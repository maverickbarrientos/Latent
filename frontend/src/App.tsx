import { useCallback, useEffect, useRef, useState } from "react"
import { Activity, Gauge, History as HistoryIcon, LayoutDashboard, Settings as SettingsIcon, Wifi } from "lucide-react"
import { useData } from "@/hooks/useData"
import { useSpeedTest } from "@/hooks/useSpeedTest"
import { api, breaches, type Settings, type TestResult } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Dashboard } from "@/views/Dashboard"
import { History } from "@/views/History"
import { Networks } from "@/views/Networks"
import { SettingsView } from "@/views/SettingsView"
import { SpeedTest } from "@/views/SpeedTest"

type View = "dashboard" | "test" | "history" | "networks" | "settings"

const NAV: { id: View; label: string; icon: typeof Gauge }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "test", label: "Speed Test", icon: Gauge },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "networks", label: "Networks", icon: Wifi },
  { id: "settings", label: "Settings", icon: SettingsIcon },
]

type Toast = { message: string; tone: "ok" | "warn" }

export default function App() {
  const [view, setView] = useState<View>(() => {
    const id = window.location.hash.slice(1)
    return NAV.some((n) => n.id === id) ? (id as View) : "dashboard"
  })
  const [toast, setToast] = useState<Toast | null>(null)
  const { history, stats, network, settings, setSettings, offline, refresh, refreshNetwork } = useData()

  const settingsRef = useRef(settings)
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(id)
  }, [toast])

  const getNetwork = useCallback(async () => (await refreshNetwork())?.ssid ?? "Unknown", [refreshNetwork])

  const onSaved = useCallback(
    (r: TestResult) => {
      refresh()
      const problems = breaches(r, settingsRef.current)
      if (problems.length) setToast({ message: `Below your limits: ${problems.join("; ")}`, tone: "warn" })
    },
    [refresh],
  )

  const speedTest = useSpeedTest({ getNetwork, onSaved })

  useEffect(() => {
    window.location.hash = view
  }, [view])

  const runTest = () => {
    setView("test")
    if (!speedTest.running) speedTest.start()
  }

  const clearHistory = async () => {
    if (!window.confirm("Delete all test history?")) return
    await api.clearHistory()
    refresh()
  }

  const saveSettings = async (s: Settings) => {
    await api.saveSettings(s)
    setSettings(s)
    setToast({ message: "Settings saved", tone: "ok" })
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-border bg-background flex shrink-0 flex-col gap-5 border-b p-3 md:w-52 md:border-r md:border-b-0 md:p-4">
        <div className="flex items-center gap-2 px-3 pt-1">
          <Activity className="text-primary size-4" />
          <span className="text-base font-semibold tracking-tight">Latent</span>
        </div>

        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                view === id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </nav>

        <div className="border-border mt-auto hidden border-t px-3 pt-3 md:block">
          <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase">
            <span className={cn("size-1.5 shrink-0 rounded-full", offline ? "bg-destructive" : "bg-success")} />
            {offline ? "Server offline" : "Connected to"}
          </div>
          {!offline && <div className="mt-1 truncate text-sm font-medium">{network?.ssid ?? "Detecting…"}</div>}
        </div>
      </aside>

      <main className="w-full min-w-0 flex-1 p-4 md:px-6 md:py-6">
        {view === "dashboard" && <Dashboard history={history} stats={stats} network={network} onRun={runTest} onViewHistory={() => setView("history")} />}
        {view === "test" && (
          <SpeedTest
            network={network?.ssid}
            phase={speedTest.phase}
            value={speedTest.value}
            result={speedTest.result}
            error={speedTest.error}
            running={speedTest.running}
            onStart={speedTest.start}
          />
        )}
        {view === "history" && <History history={history} settings={settings} onClear={clearHistory} />}
        {view === "networks" && <Networks stats={stats} current={network?.ssid} />}
        {view === "settings" && <SettingsView key={JSON.stringify(settings)} settings={settings} onSave={saveSettings} />}
      </main>

      {toast && (
        <div
          role="status"
          className={cn(
            "fixed right-5 bottom-5 max-w-sm rounded-lg px-4 py-3 text-sm font-medium shadow-lg",
            toast.tone === "ok" ? "bg-success text-background" : "bg-destructive text-background",
          )}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
