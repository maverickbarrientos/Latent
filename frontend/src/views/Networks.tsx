import { NetworkChart } from "@/components/Charts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fmt, type Stats } from "@/lib/api"

export function Networks({ stats, current }: { stats: Stats; current?: string }) {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Networks</h1>
        <p className="text-muted-foreground text-sm">Compare average speeds across the networks you test on.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Average speed by network (Mbps)</CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkChart networks={stats.networks} />
        </CardContent>
      </Card>

      <Card className="py-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Network</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Tests</TableHead>
              <TableHead className="text-right">Down<span className="hidden sm:inline"> (Mbps)</span></TableHead>
              <TableHead className="text-right">Up<span className="hidden sm:inline"> (Mbps)</span></TableHead>
              <TableHead className="pr-5 text-right">Ping<span className="hidden sm:inline"> (ms)</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.networks.map((n) => (
              <TableRow key={n.network}>
                <TableCell className="pl-5 font-medium">
                  {n.network}
                  {n.network === current && <Badge variant="outline" className="border-success/40 text-success ml-2">Connected</Badge>}
                  <div className="text-muted-foreground text-xs font-normal sm:hidden">{n.count} tests</div>
                </TableCell>
                <TableCell className="hidden text-right font-mono text-[13px] tabular-nums sm:table-cell">{n.count}</TableCell>
                <TableCell className="text-right font-mono text-[13px] tabular-nums">{fmt(n.avg_download)}</TableCell>
                <TableCell className="text-right font-mono text-[13px] tabular-nums">{fmt(n.avg_upload)}</TableCell>
                <TableCell className="pr-5 text-right font-mono text-[13px] tabular-nums">{fmt(n.avg_ping)}</TableCell>
              </TableRow>
            ))}
            {!stats.networks.length && (
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
