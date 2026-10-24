import { useCallback, useState } from "react"

const KEY = "latent.networkName"

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? ""
  } catch {
    return ""
  }
}

/** The Wi-Fi name the user typed in Settings, kept in this browser only. */
export function useNetworkName() {
  const [name, setName] = useState(read)

  const save = useCallback((value: string) => {
    const next = value.trim().slice(0, 64)
    try {
      if (next) localStorage.setItem(KEY, next)
      else localStorage.removeItem(KEY)
    } catch {
      // Storage is unavailable (private mode, blocked): the name lasts for this session only.
    }
    setName(next)
  }, [])

  return [name, save] as const
}
