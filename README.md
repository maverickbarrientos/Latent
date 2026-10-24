# Latent

A local network speed tester: download, upload, ping, jitter and packet loss, with a dashboard, history, per-network comparison and alerts.

FastAPI serves the UI, reads the Wi-Fi name with `netsh` (Windows) and stores history in `backend/data/history.json`. The speed test runs in the browser against Cloudflare's public speed endpoints. The API lives in `backend/` and the React + Tailwind + shadcn/ui UI in `frontend/`.

## Run

```
cd frontend && npm install && npm run build
cd ../backend && pip install -r requirements.txt
python -m app.main
```

Open http://localhost:8000. To change the host or port, copy `backend/.env.example` to `backend/.env` and edit it.

## Develop the UI

Run the API (`python -m app.main` in `backend/`), then in `frontend/` run `npm run dev`. Vite proxies `/api` to the backend. If the API isn't on `127.0.0.1:8000`, copy `frontend/.env.example` to `frontend/.env` and set `API_URL` (and `DEV_PORT`) there.

## Hosting the UI separately from the API

By default the UI calls the API on the same origin. If they are hosted apart, set `VITE_API_URL` (for example `https://your-backend.onrender.com`) in `frontend/.env` or in your host's environment settings, then rebuild: it is read at build time. The backend must also allow requests from the UI's origin (CORS), which it does not do yet.
