import { useCallback, useState } from "react"
import { api, type TestResult } from "@/lib/api"
import { measureDownload, measureLatency, measureUpload } from "@/lib/speedtest"

export type Phase = "idle" | "latency" | "download" | "upload" | "done" | "failed"

type Options = {
  getNetwork: () => Promise<string>
  onSaved: (r: TestResult) => void
}

export function useSpeedTest({ getNetwork, onSaved }: Options) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [value, setValue] = useState(0)
  const [result, setResult] = useState<Partial<TestResult>>({})
  const [error, setError] = useState("")

  const start = useCallback(async () => {
    setError("")
    setResult({})
    setValue(0)
    try {
      const network = await getNetwork()

      setPhase("latency")
      const { ping, jitter, loss } = await measureLatency()
      setResult({ ping, jitter, loss })

      setPhase("download")
      const download = await measureDownload(setValue)
      setResult((r) => ({ ...r, download }))

      setValue(0)
      setPhase("upload")
      const upload = await measureUpload(setValue)
      setValue(upload)

      const full: TestResult = {
        timestamp: new Date().toISOString(),
        network,
        download,
        upload,
        ping,
        jitter,
        loss,
      }
      setResult(full)
      await api.saveResult(full)
      setPhase("done")
      onSaved(full)
    } catch (err) {
      setPhase("failed")
      setError(`${err instanceof Error ? err.message : "Test failed"}. Nothing was saved.`)
    }
  }, [getNetwork, onSaved])

  const running = phase === "latency" || phase === "download" || phase === "upload"
  return { phase, value, result, error, start, running }
}
