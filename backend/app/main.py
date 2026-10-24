import os
from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import network, storage
from .models import Settings, TestResult

# Read backend/.env for every way of starting the app (python -m app.main or uvicorn app.main:app).
load_dotenv()

app = FastAPI(title="Latent")
STATIC_DIR = Path(__file__).resolve().parents[2] / "frontend" / "dist"

# Origins allowed to call the API from a browser when the UI is hosted elsewhere.
# Comma-separated; "*" allows any origin. Empty means same-origin only.
CORS_ORIGINS = [o.strip().rstrip("/") for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
if CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type"],
    )


@app.get("/api/network")
def get_network():
    return {"ssid": network.get_ssid(), **network.get_ip_info()}


@app.get("/api/history")
def get_history():
    return storage.read("history.json", [])


@app.post("/api/history")
def add_history(result: TestResult):
    history = storage.read("history.json", [])
    history.append(result.model_dump())
    storage.write("history.json", history)
    return result


@app.delete("/api/history")
def clear_history():
    storage.write("history.json", [])
    return {"ok": True}


def _summary(rows: list[dict]) -> dict:
    n = len(rows)
    return {
        "count": n,
        "avg_download": sum(r["download"] for r in rows) / n,
        "avg_upload": sum(r["upload"] for r in rows) / n,
        "avg_ping": sum(r["ping"] for r in rows) / n,
    }


@app.get("/api/stats")
def get_stats():
    history = storage.read("history.json", [])
    if not history:
        return {"count": 0, "networks": []}
    by_network = defaultdict(list)
    for row in history:
        by_network[row["network"]].append(row)
    downloads = [r["download"] for r in history]
    uploads = [r["upload"] for r in history]
    return {
        **_summary(history),
        "best_download": max(downloads),
        "worst_download": min(downloads),
        "best_upload": max(uploads),
        "worst_upload": min(uploads),
        "networks": [{"network": k, **_summary(v)} for k, v in by_network.items()],
    }


@app.get("/api/settings")
def get_settings():
    return Settings(**storage.read("settings.json", {}))


@app.put("/api/settings")
def put_settings(settings: Settings):
    storage.write("settings.json", settings.model_dump())
    return settings


# The UI is only served when it has been built; otherwise run as a plain API.
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
else:

    @app.get("/")
    def root():
        return {"name": "Latent API", "ui": "not built"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=os.environ.get("HOST", "127.0.0.1"), port=int(os.environ.get("PORT", 8000)))
