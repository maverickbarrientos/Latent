import type { NetworkInfo } from "@/lib/api"

/** A name typed in Settings stands in only when the Wi-Fi name can't be detected (kind "isp"). */
export function withName(network: NetworkInfo | null, manual: string): NetworkInfo | null {
  const name = manual.trim()
  if (!network || network.kind !== "isp" || !name) return network
  return { ...network, ssid: name, kind: "ssid" }
}
