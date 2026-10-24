const DOWN_URL = "https://speed.cloudflare.com/__down?bytes="
const UP_URL = "https://speed.cloudflare.com/__up"
const PHASE_MS = 8000
const STREAMS = 4

const mbps = (bytes: number, ms: number) => (bytes * 8) / (ms / 1000) / 1e6

export type Latency = { ping: number; jitter: number; loss: number }

export async function measureLatency(samples = 10): Promise<Latency> {
  const times: number[] = []
  let failed = 0
  for (let i = 0; i < samples; i++) {
    const start = performance.now()
    try {
      await fetch(`${DOWN_URL}0&r=${Math.random()}`, { cache: "no-store" })
      times.push(performance.now() - start)
    } catch {
      failed++
    }
  }
  if (!times.length) throw new Error("Unable to reach the test server")
  const sorted = [...times].sort((a, b) => a - b)
  const ping = sorted[Math.floor(sorted.length / 2)]
  const jitter =
    times.length > 1
      ? times.slice(1).reduce((s, t, i) => s + Math.abs(t - times[i]), 0) / (times.length - 1)
      : 0
  return { ping, jitter, loss: (failed / samples) * 100 }
}

export async function measureDownload(onProgress: (mbps: number) => void): Promise<number> {
  let bytes = 0
  const start = performance.now()
  const deadline = start + PHASE_MS

  async function stream() {
    while (performance.now() < deadline) {
      const res = await fetch(`${DOWN_URL}25000000&r=${Math.random()}`, { cache: "no-store" })
      const reader = res.body!.getReader()
      while (performance.now() < deadline) {
        const { done, value } = await reader.read()
        if (done) break
        bytes += value.length
        onProgress(mbps(bytes, performance.now() - start))
      }
      reader.cancel().catch(() => {})
    }
  }

  await Promise.all(Array.from({ length: STREAMS }, stream))
  return mbps(bytes, performance.now() - start)
}

export function measureUpload(onProgress: (mbps: number) => void): Promise<number> {
  const chunk = new Uint8Array(2_000_000)
  for (let i = 0; i < chunk.length; i += 65536) {
    crypto.getRandomValues(chunk.subarray(i, Math.min(i + 65536, chunk.length)))
  }
  const start = performance.now()
  const deadline = start + PHASE_MS
  const inFlight = new Array<number>(STREAMS).fill(0)
  let total = 0

  const upload = (slot: number) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", UP_URL)
      xhr.upload.onprogress = (e) => {
        inFlight[slot] = e.loaded
      }
      xhr.onload = () => {
        total += chunk.length
        inFlight[slot] = 0
        resolve()
      }
      xhr.onerror = () => reject(new Error("Upload failed"))
      xhr.send(chunk)
    })

  async function stream(slot: number) {
    while (performance.now() < deadline) await upload(slot)
  }

  const timer = setInterval(() => {
    const done = total + inFlight.reduce((a, b) => a + b, 0)
    onProgress(mbps(done, performance.now() - start))
  }, 200)

  return Promise.all(Array.from({ length: STREAMS }, (_, i) => stream(i)))
    .then(() => mbps(total, performance.now() - start))
    .finally(() => clearInterval(timer))
}

export function rate(download: number): "Excellent" | "Good" | "Fair" | "Poor" {
  if (download >= 100) return "Excellent"
  if (download >= 25) return "Good"
  if (download >= 5) return "Fair"
  return "Poor"
}
