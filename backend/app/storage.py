import json
import os
import threading
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
_lock = threading.Lock()


def read(name: str, default):
    path = DATA_DIR / name
    with _lock:
        if not path.exists():
            return default
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return default


def write(name: str, value) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    path = DATA_DIR / name
    tmp = path.with_suffix(".tmp")
    with _lock:
        tmp.write_text(json.dumps(value, indent=2), encoding="utf-8")
        os.replace(tmp, path)
