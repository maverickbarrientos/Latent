import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { NetworkInfo, Settings } from "@/lib/api"

type Props = {
  settings: Settings
  onSave: (s: Settings) => void
  networkName: string
  detected: NetworkInfo | null
  onSaveNetworkName: (name: string) => void
}

const FIELDS: { key: keyof Settings; label: string; unit: string }[] = [
  { key: "min_download", label: "Minimum download", unit: "Mbps" },
  { key: "min_upload", label: "Minimum upload", unit: "Mbps" },
  { key: "max_ping", label: "Maximum ping", unit: "ms" },
]

export function SettingsView({ settings, onSave, networkName, detected, onSaveNetworkName }: Props) {
  const [draft, setDraft] = useState({
    min_download: String(settings.min_download),
    min_upload: String(settings.min_upload),
    max_ping: String(settings.max_ping),
  })
  const [nameDraft, setNameDraft] = useState(networkName)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSave({
      min_download: Number(draft.min_download) || 0,
      min_upload: Number(draft.min_upload) || 0,
      max_ping: Number(draft.max_ping) || 0,
    })
  }

  const submitName = (e: FormEvent) => {
    e.preventDefault()
    onSaveNetworkName(nameDraft)
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Your Wi-Fi name and speed alerts.</p>
      </header>

      <Card className="max-w-md">
        <CardContent>
          <form onSubmit={submitName} className="space-y-3">
            <Label htmlFor="network-name">Wi-Fi name</Label>
            <Input
              id="network-name"
              value={nameDraft}
              maxLength={64}
              placeholder="e.g. Home Wi-Fi"
              onChange={(e) => setNameDraft(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              {detected?.kind === "ssid"
                ? `Detected automatically: ${detected.ssid}. This name is only used when detection isn't possible, such as on the hosted site.`
                : "Browsers can't read your Wi-Fi name, so enter it here. It's shown on the dashboard and saved with your tests. It's stored only in this browser."}
            </p>
            <Button type="submit">Save name</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-md">
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <p className="text-muted-foreground text-xs">
              Get an alert when a result falls outside these limits. Set a value to 0 to turn it off.
            </p>
            {FIELDS.map(({ key, label, unit }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>
                  {label} <span className="text-muted-foreground font-normal">({unit})</span>
                </Label>
                <Input
                  id={key}
                  type="number"
                  min={0}
                  step="any"
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                />
              </div>
            ))}
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
