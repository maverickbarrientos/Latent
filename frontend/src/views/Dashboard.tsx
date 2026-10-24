import { Play } from "lucide-react"
import { MetricStrip } from "@/components/MetricStrip"
import { SpeedChart } from "@/components/Charts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fmt, type NetworkInfo, type Stats, type TestResult } from "@/lib/api"
import { formatAgo, formatWhen } from "@/lib/date"
import { rate } from "@/lib/speedtest"

type Props = {
  history: TestResult[]
  stats: Stats
  network: NetworkInfo | null
  onRun: () => void
  onViewHistory: () => void
}

export function Dashboard({ history, stats, network, onRun, onViewHistory }: Props) {
  const last = history[history.length - 1]
  const recent = [...history].reverse().slice(0, 5)
  const details = [network?.ip, network?.kind === "ssid" ? network.isp : undefined].filter(Boolean).join("  ·  ")

  const summary = [
    { label: "Average", down: stats.avg_download, up: stats.avg_upload },
    { label: "Best", down: stats.best_download, up: stats.best_upload },
    { label: "Worst", down: stats.worst_download, up: stats.worst_upload },
  ]

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
            <span className="bg-success size-1.5 rounded-full" />
            {network?.kind === "isp" ? "Connected via" : "Connected to"}
          </div>
          <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight">{network?.ssid ?? "Detecting…"}</h1>
          <p className="text-muted-foreground mt-1 truncate font-mono text-xs">
            {[details, last && `Tested ${formatAgo(last.timestamp)}`].filter(Boolean).join("  ·  ") ||
              "Run your first test to get started"}
          </p>
        </div>
        <Button onClick={onRun} className="shrink-0 font-semibold">
          <Play /> Run test
        </Button>
      </header>

      <MetricStrip
        items={[
          {
            label: "Download",
            value: fmt(last?.download),
            unit: "Mbps",
            hint: last ? `${rate(last.download)} · avg ${fmt(stats.avg_download)}` : undefined,
          },
          { label: "Upload", value: fmt(last?.upload), unit: "Mbps", hint: last ? `avg ${fmt(stats.avg_upload)}` : undefined },
          { label: "Ping", value: fmt(last?.ping), unit: "ms", hint: last ? `loss ${fmt(last.loss)}%` : undefined },
          { label: "Jitter", value: fmt(last?.jitter), unit: "ms", hint: `${stats.count} tests saved` },
        ]}
      />

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Speed over time</CardTitle>
          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><i className="bg-primary h-0.5 w-3 rounded" /> Download</span>
            <span className="flex items-center gap-1.5"><i className="bg-upload h-0.5 w-3 rounded" /> Upload</span>
          </div>
        </CardHeader>
        <CardContent>
          <SpeedChart history={history} />
        </CardContent>
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm font-medium">Summary</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4" />
                <TableHead className="text-right">Down</TableHead>
                <TableHead className="pr-4 text-right">Up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.map((r) => (
                <TableRow key={r.label}>
                  <TableCell className="text-muted-foreground pl-4">{r.label}</TableCell>
                  <TableCell className="text-right font-mono text-[13px] tabular-nums">{fmt(r.down)}</TableCell>
                  <TableCell className="pr-4 text-right font-mono text-[13px] tabular-nums">{fmt(r.up)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="flex items-center justify-between border-b py-3">
            <CardTitle className="text-sm font-medium">Recent tests</CardTitle>
            <button onClick={onViewHistory} className="text-primary text-xs font-medium hover:underline">
              View all
            </button>
          </CardHeader>
          <Table>
            <TableBody>
              {recent.map((r) => (
                <TableRow key={r.timestamp}>
                  <TableCell className="pl-4">{formatWhen(r.timestamp)}</TableCell>
                  <TableCell className="text-right font-mono text-[13px] tabular-nums">{fmt(r.download)} ↓</TableCell>
                  <TableCell className="text-right font-mono text-[13px] tabular-nums">{fmt(r.upload)} ↑</TableCell>
                  <TableCell className="pr-4 text-right font-mono text-[13px] tabular-nums">{fmt(r.ping)} ms</TableCell>
                </TableRow>
              ))}
              {!recent.length && (
                <TableRow>
                  <TableCell className="text-muted-foreground py-6 text-center">No tests yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
