type Props = { value: number; label: string }

// Log scale so both 5 Mbps and 500 Mbps connections move the needle meaningfully.
const MAX = 1000
const ARC = "M20 100 A80 80 0 0 1 180 100"
const TICKS = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]

export function Gauge({ value, label }: Props) {
  const frac = Math.min(Math.log10(value + 1) / Math.log10(MAX + 1), 1)
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <svg viewBox="0 0 200 118" className="w-full overflow-visible">
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6c8cff" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#9db4ff" />
          </linearGradient>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {TICKS.map((t) => {
          const a = Math.PI * (1 - t)
          const [x1, y1] = [100 + 92 * Math.cos(a), 100 - 92 * Math.sin(a)]
          const [x2, y2] = [100 + 97 * Math.cos(a), 100 - 97 * Math.sin(a)]
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-border" strokeWidth={1.5} strokeLinecap="round" />
        })}
        <path d={ARC} pathLength={100} fill="none" strokeWidth={9} strokeLinecap="round" className="stroke-white/[0.06]" />
        <path
          d={ARC}
          pathLength={100}
          fill="none"
          strokeWidth={9}
          strokeLinecap="round"
          stroke="#6c8cff"
          opacity={frac > 0.001 ? 0.5 : 0}
          filter="url(#gauge-glow)"
          strokeDasharray={100}
          strokeDashoffset={100 - frac * 100}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
        <path
          d={ARC}
          pathLength={100}
          fill="none"
          strokeWidth={9}
          strokeLinecap="round"
          stroke="url(#gauge-grad)"
          opacity={frac > 0.001 ? 1 : 0}
          strokeDasharray={100}
          strokeDashoffset={100 - frac * 100}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="font-mono text-5xl font-medium tracking-tighter tabular-nums">
          {value >= 100 ? value.toFixed(0) : value.toFixed(1)}
        </div>
        <div className="text-muted-foreground text-xs tracking-wider uppercase">{label}</div>
      </div>
    </div>
  )
}
