import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { NetworkStats, TestResult } from "@/lib/api"
import { formatDay, formatDayTime } from "@/lib/date"

const PRIMARY = "#6c8cff"
const SECONDARY = "#2dd4bf"
const GRID = "#232832"
const MUTED = "#8b94a5"
const MONO = "Geist Mono Variable, monospace"

const tooltipStyle = {
  contentStyle: {
    background: "#171a21",
    border: "1px solid #2a2f3a",
    borderRadius: 8,
    color: "#e7ecf7",
    fontSize: 12,
    fontFamily: MONO,
  },
  labelStyle: { color: MUTED },
}

const axis = { stroke: MUTED, fontSize: 11, fontFamily: MONO, tickLine: false, axisLine: false } as const

function Empty() {
  return (
    <div className="text-muted-foreground flex h-[220px] items-center justify-center text-sm">
      No tests yet. Run one to see your data here.
    </div>
  )
}

export function SpeedChart({ history }: { history: TestResult[] }) {
  if (!history.length) return <Empty />
  const data = history.map((r) => ({
    d: formatDay(r.timestamp),
    t: formatDayTime(r.timestamp),
    Download: +r.download.toFixed(1),
    Upload: +r.upload.toFixed(1),
  }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: -20, right: 28, top: 8 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="d" {...axis} minTickGap={110} interval="preserveStartEnd" tickMargin={8} />
        <YAxis {...axis} />
        <Tooltip {...tooltipStyle} cursor={{ stroke: "#2a2f3a" }} labelFormatter={(_, p) => p?.[0]?.payload?.t} />
        <Line isAnimationActive={false} type="monotone" dataKey="Download" stroke={PRIMARY} strokeWidth={1.75} dot={false} activeDot={{ r: 4 }} />
        <Line isAnimationActive={false} type="monotone" dataKey="Upload" stroke={SECONDARY} strokeWidth={1.75} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function NetworkChart({ networks }: { networks: NetworkStats[] }) {
  if (!networks.length) return <Empty />
  const data = networks.map((n) => ({
    name: n.network,
    Download: +n.avg_download.toFixed(1),
    Upload: +n.avg_upload.toFixed(1),
  }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -20, right: 4, top: 8 }} barGap={4} maxBarSize={36}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="name" {...axis} tickMargin={8} />
        <YAxis {...axis} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "#1c2029" }} />
        <Bar isAnimationActive={false} dataKey="Download" fill={PRIMARY} radius={[3, 3, 0, 0]} />
        <Bar isAnimationActive={false} dataKey="Upload" fill={SECONDARY} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
