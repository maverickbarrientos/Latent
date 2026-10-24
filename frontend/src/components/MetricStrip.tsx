import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

export type Metric = { label: string; value: ReactNode; unit?: string; hint?: ReactNode }

/** One card holding a row of metrics split by hairlines, instead of a grid of separate boxes. */
export function MetricStrip({ items }: { items: Metric[] }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="bg-border grid grid-cols-2 gap-px lg:grid-cols-4">
        {items.map((m) => (
          <div key={m.label} className="bg-card px-5 py-4">
            <div className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">{m.label}</div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-medium tracking-tight tabular-nums">{m.value}</span>
              {m.unit && <span className="text-muted-foreground font-mono text-xs">{m.unit}</span>}
            </div>
            {m.hint && <div className="text-muted-foreground mt-1 font-mono text-[11px]">{m.hint}</div>}
          </div>
        ))}
      </div>
    </Card>
  )
}
