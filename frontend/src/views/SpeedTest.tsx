import { Play } from "lucide-react"
import { Gauge } from "@/components/Gauge"
import { MetricStrip } from "@/components/MetricStrip"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fmt } from "@/lib/api"
import { rate } from "@/lib/speedtest"
import type { Phase } from "@/hooks/useSpeedTest"
import type { TestResult } from "@/lib/api"

type Props = {
  network?: string
  phase: Phase
  value: number
  result: Partial<TestResult>
  error: string
  running: boolean
  onStart: () => void
}

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Ready",
  latency: "Measuring latency",
  download: "Download Mbps",
  upload: "Upload Mbps",
  done: "Complete",
  failed: "Failed",
}

export function SpeedTest({ network, phase, value, result, error, running, onStart }: Props) {
  const rating = result.download !== undefined && phase === "done" ? rate(result.download) : "–"
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Speed Test</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Testing on <span className="text-foreground font-semibold">{network ?? "…"}</span>
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-6">
          <Gauge value={value} label={PHASE_LABEL[phase]} />
          <Button size="lg" onClick={onStart} disabled={running} className="font-semibold">
            <Play /> {running ? "Testing…" : "Start test"}
          </Button>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>

      <MetricStrip
        items={[
          { label: "Download", value: fmt(result.download), unit: "Mbps" },
          { label: "Upload", value: fmt(result.upload), unit: "Mbps" },
          {
            label: "Ping",
            value: fmt(result.ping),
            unit: "ms",
            hint: result.jitter !== undefined ? `jitter ${fmt(result.jitter)} ms · loss ${fmt(result.loss)}%` : undefined,
          },
          { label: "Rating", value: rating },
        ]}
      />
    </div>
  )
}
