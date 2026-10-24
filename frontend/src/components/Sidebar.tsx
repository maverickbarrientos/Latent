import { Gauge, History as HistoryIcon, LayoutDashboard, Settings as SettingsIcon, Wifi } from "lucide-react"
import type { NetworkInfo } from "@/lib/api"
import { cn } from "@/lib/utils"

export type View = "dashboard" | "test" | "history" | "networks" | "settings"

export const NAV: { id: View; label: string; icon: typeof Gauge }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "test", label: "Speed Test", icon: Gauge },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "networks", label: "Networks", icon: Wifi },
  { id: "settings", label: "Settings", icon: SettingsIcon },
]

export function Logo() {
  return (
    <div className="flex items-center gap-1">
      <img src="/latent.png" alt="" className="size-10" />
      <span className="text-base font-semibold tracking-tight">Latent</span>
    </div>
  )
}

type Props = {
  view: View
  onSelect: (view: View) => void
  network: NetworkInfo | null
  offline: boolean
}

/** Navigation and network status, shared by the desktop sidebar and the mobile menu. */
export function SidebarContent({ view, onSelect, network, offline }: Props) {
  return (
    <>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors md:py-1.5",
              view === id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </nav>

      <div className="border-border mt-auto border-t px-3 pt-3">
        <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase">
          <span className={cn("size-1.5 shrink-0 rounded-full", offline ? "bg-destructive" : "bg-success")} />
          {offline ? "Server offline" : "Connected to"}
        </div>
        {!offline && <div className="mt-1 truncate text-sm font-medium">{network?.ssid ?? "Detecting…"}</div>}
      </div>
    </>
  )
}
