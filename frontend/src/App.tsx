import { useCallback, useEffect, useRef, useState } from "react"
import { Menu } from "lucide-react"
import { Logo, NAV, SidebarContent, type View } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useData } from "@/hooks/useData"
import { useSpeedTest } from "@/hooks/useSpeedTest"
import { api, breaches, type Settings, type TestResult } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Dashboard } from "@/views/Dashboard"
import { History } from "@/views/History"
import { Networks } from "@/views/Networks"
import { SettingsView } from "@/views/SettingsView"
import { SpeedTest } from "@/views/SpeedTest"

type Toast = { message: string; tone: "ok" | "warn" }

export default function App() {
  const [view, setView] = useState<View>(() => {
    const id = window.location.hash.slice(1)
    return NAV.some((n) => n.id === id) ? (id as View) : "dashboard"
  })
  const [toast, setToast] = useState<Toast | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
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
      <aside className="border-border bg-background sticky top-0 hidden h-screen w-52 shrink-0 flex-col gap-5 border-r p-4 md:flex">
        <div className="px-1">
          <Logo />
        </div>
        <SidebarContent view={view} onSelect={setView} network={network} offline={offline} />
      </aside>

      <header className="border-border bg-background sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 md:hidden">
        <Logo />
        <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="bg-background flex w-64 flex-col gap-5 p-4 md:hidden">
          <SheetHeader className="p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Navigate between pages</SheetDescription>
            <Logo />
          </SheetHeader>
          <SidebarContent
            view={view}
            onSelect={(v) => {
              setView(v)
              setMenuOpen(false)
            }}
            network={network}
            offline={offline}
          />
        </SheetContent>
      </Sheet>

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
