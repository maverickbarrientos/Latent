import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Settings } from "@/lib/api"

type Props = { settings: Settings; onSave: (s: Settings) => void }

const FIELDS: { key: keyof Settings; label: string; unit: string }[] = [
  { key: "min_download", label: "Minimum download", unit: "Mbps" },
  { key: "min_upload", label: "Minimum upload", unit: "Mbps" },
  { key: "max_ping", label: "Maximum ping", unit: "ms" },
]

export function SettingsView({ settings, onSave }: Props) {
  const [draft, setDraft] = useState({
    min_download: String(settings.min_download),
    min_upload: String(settings.min_upload),
    max_ping: String(settings.max_ping),
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSave({
      min_download: Number(draft.min_download) || 0,
      min_upload: Number(draft.min_upload) || 0,
      max_ping: Number(draft.max_ping) || 0,
    })
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Get an alert when a result falls outside these limits. Set a value to 0 to turn it off.
        </p>
      </header>

      <Card className="max-w-md">
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
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
