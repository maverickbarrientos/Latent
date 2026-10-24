export type TestResult = {
  timestamp: string
  network: string
  download: number
  upload: number
  ping: number
  jitter: number
  loss: number
}

export type Settings = { min_download: number; min_upload: number; max_ping: number }

export type NetworkInfo = { ssid: string; ip: string; isp: string }

export type NetworkStats = {
  network: string
  count: number
  avg_download: number
  avg_upload: number
  avg_ping: number
}

export type Stats = {
  count: number
  avg_download?: number
  avg_upload?: number
  best_download?: number
  worst_download?: number
  best_upload?: number
  worst_upload?: number
  networks: NetworkStats[]
}

// Empty means same origin: the backend serves the UI, or the dev server proxies /api.
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "")

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/${path}`, init)
  if (!res.ok) throw new Error(`Request failed: ${path}`)
  return res.json()
}

const send = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})

export const api = {
  network: () => request<NetworkInfo>("network"),
  history: () => request<TestResult[]>("history"),
  stats: () => request<Stats>("stats"),
  settings: () => request<Settings>("settings"),
  saveResult: (r: TestResult) => request<TestResult>("history", send("POST", r)),
  saveSettings: (s: Settings) => request<Settings>("settings", send("PUT", s)),
  clearHistory: () => request<{ ok: boolean }>("history", { method: "DELETE" }),
}

export const fmt = (n: number | undefined) =>
  n === undefined ? "–" : n >= 100 ? n.toFixed(0) : n.toFixed(1)

export function breaches(r: TestResult, s: Settings): string[] {
  const out: string[] = []
  if (s.min_download && r.download < s.min_download)
    out.push(`download ${fmt(r.download)} < ${s.min_download} Mbps`)
  if (s.min_upload && r.upload < s.min_upload)
    out.push(`upload ${fmt(r.upload)} < ${s.min_upload} Mbps`)
  if (s.max_ping && r.ping > s.max_ping) out.push(`ping ${fmt(r.ping)} > ${s.max_ping} ms`)
  return out
}
