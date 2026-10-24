import { useCallback, useEffect, useState } from "react"
import { api, type NetworkInfo, type Settings, type Stats, type TestResult } from "@/lib/api"

const DEFAULT_SETTINGS: Settings = { min_download: 0, min_upload: 0, max_ping: 0 }

export function useData() {
  const [history, setHistory] = useState<TestResult[]>([])
  const [stats, setStats] = useState<Stats>({ count: 0, networks: [] })
  const [network, setNetwork] = useState<NetworkInfo | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [offline, setOffline] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [h, s] = await Promise.all([api.history(), api.stats()])
      setHistory(h)
      setStats(s)
      setOffline(false)
    } catch {
      setOffline(true)
    }
  }, [])

  const refreshNetwork = useCallback(async () => {
    try {
      const n = await api.network()
      setNetwork(n)
      return n
    } catch {
      setOffline(true)
      return null
    }
  }, [])

  useEffect(() => {
    api.settings().then(setSettings).catch(() => {})
    refreshNetwork()
    refresh()
  }, [refresh, refreshNetwork])

  return { history, stats, network, settings, setSettings, offline, refresh, refreshNetwork }
}
