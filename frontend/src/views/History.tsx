import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { breaches, fmt, type Settings, type TestResult } from "@/lib/api"
import { formatWhen } from "@/lib/date"

type Props = { history: TestResult[]; settings: Settings; onClear: () => void }

export function History({ history, settings, onClear }: Props) {
  const rows = [...history].reverse()
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="text-muted-foreground text-sm">{history.length} saved tests.</p>
        </div>
        <Button variant="outline" onClick={onClear} disabled={!history.length}>
          <Trash2 /> Clear
        </Button>
      </header>

      <Card className="py-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Time</TableHead>
              <TableHead className="hidden sm:table-cell">Network</TableHead>
              <TableHead className="text-right">Down<span className="hidden sm:inline"> (Mbps)</span></TableHead>
              <TableHead className="text-right">Up<span className="hidden sm:inline"> (Mbps)</span></TableHead>
              <TableHead className="pr-5 text-right">Ping<span className="hidden sm:inline"> (ms)</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.timestamp}>
                <TableCell className="pl-5">
                  <div>{formatWhen(r.timestamp)}</div>
                  <div className="text-muted-foreground text-xs sm:hidden">
                    {r.network}
                    {breaches(r, settings).length > 0 && <span className="text-destructive"> · Below limit</span>}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{r.network}</TableCell>
                <TableCell className="text-right font-mono text-[13px] tabular-nums">{fmt(r.download)}</TableCell>
                <TableCell className="text-right font-mono text-[13px] tabular-nums">{fmt(r.upload)}</TableCell>
                <TableCell className="pr-5 text-right font-mono text-[13px] tabular-nums">
                  {breaches(r, settings).length > 0 && (
                    <Badge variant="outline" className="border-destructive/40 text-destructive mr-2 hidden sm:inline-flex">Below limit</Badge>
                  )}
                  {fmt(r.ping)}
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-6 text-center">
                  No tests yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
