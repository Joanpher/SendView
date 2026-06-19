"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Copy, Trash2, ExternalLink, Pencil, Globe, Key, CheckCircle2, XCircle, Layers } from "lucide-react"
import type { Application } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface ApplicationsListProps {
  applications: Application[]
  onApplicationDeleted: (id: string) => void
  onApplicationUpdated?: (app: Application) => void
  hideApiKey?: boolean
}

const APP_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-500",
]

function getAppColor(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return APP_COLORS[n % APP_COLORS.length]
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
}

export function ApplicationsList({ applications, onApplicationDeleted, onApplicationUpdated, hideApiKey }: ApplicationsListProps) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [editName, setEditName] = useState("")
  const [editWebhookUrl, setEditWebhookUrl] = useState("")
  const [editIsActive, setEditIsActive] = useState(true)
  const [savingEdit, setSavingEdit] = useState(false)

  const toggleKey = (id: string) => {
    setVisibleKeys(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const openEdit = (app: Application) => {
    setEditingApp(app)
    setEditName(app.name)
    setEditWebhookUrl(app.webhook_url || "")
    setEditIsActive(Boolean(app.is_active))
  }

  const saveEdit = async () => {
    if (!editingApp) return
    setSavingEdit(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("applications")
        .update({ name: editName, webhook_url: editWebhookUrl.trim() || null, is_active: editIsActive, updated_at: new Date().toISOString() })
        .eq("id", editingApp.id).select().single()
      if (!error && data && onApplicationUpdated) onApplicationUpdated(data as Application)
      setEditingApp(null)
    } finally { setSavingEdit(false) }
  }

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const deleteApp = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("applications").delete().eq("id", id)
    if (!error) onApplicationDeleted(id)
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <Layers className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Sin aplicaciones todavía</p>
        <p className="text-xs text-muted-foreground/70">Crea tu primera app para empezar a enviar notificaciones</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {applications.map((app) => {
          const gradient = getAppColor(app.id)
          const isVisible = visibleKeys.has(app.id)
          return (
            <div key={app.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className={`bg-gradient-to-br ${gradient} p-5`}>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-sm">
                    {getInitials(app.name)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(app)} className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="w-7 h-7 rounded-lg bg-white/15 hover:bg-red-500/60 flex items-center justify-center text-white transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar aplicación</AlertDialogTitle>
                          <AlertDialogDescription>Se eliminará "{app.name}" y todas sus notificaciones. Esta acción no se puede deshacer.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteApp(app.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-white font-semibold text-base leading-tight">{app.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    {app.is_active ? <CheckCircle2 className="h-3 w-3 text-white/80" /> : <XCircle className="h-3 w-3 text-white/60" />}
                    <span className="text-white/80 text-xs">{app.is_active ? "Activa" : "Inactiva"}</span>
                    <span className="text-white/40 text-xs ml-2">{new Date(app.created_at).toLocaleDateString("es-ES")}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {!hideApiKey && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"><Key className="h-3 w-3" />API Key</div>
                      <div className="flex items-center gap-1.5 bg-muted/60 rounded-lg px-2.5 py-1.5">
                        <code className="text-xs flex-1 truncate font-mono">{isVisible ? app.api_key : "••••••••••••••••••••••••"}</code>
                        <button onClick={() => toggleKey(app.id)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                          {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => copy(app.api_key, `key-${app.id}`)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                          {copiedId === `key-${app.id}` ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"><Globe className="h-3 w-3" />URL de ingesta</div>
                      <div className="flex items-center gap-1.5 bg-muted/60 rounded-lg px-2.5 py-1.5">
                        <code className="text-xs flex-1 truncate font-mono text-muted-foreground">/api/ingest?api_key={app.api_key.slice(0, 12)}…</code>
                        <button onClick={() => copy(`/api/ingest?api_key=${app.api_key}`, `url-${app.id}`)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                          {copiedId === `url-${app.id}` ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {app.webhook_url && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"><ExternalLink className="h-3 w-3" />Webhook</div>
                    <div className="flex items-center gap-1.5 bg-muted/60 rounded-lg px-2.5 py-1.5">
                      <code className="text-xs flex-1 truncate font-mono text-muted-foreground">{app.webhook_url}</code>
                      <button onClick={() => copy(app.webhook_url!, `wh-${app.id}`)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                        {copiedId === `wh-${app.id}` ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={Boolean(editingApp)} onOpenChange={(o) => !o && setEditingApp(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Editar aplicación</DialogTitle>
            <DialogDescription>Actualiza nombre, webhook y estado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-xs font-medium text-muted-foreground">Nombre</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} className="h-9 rounded-lg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-webhook" className="text-xs font-medium text-muted-foreground">Webhook URL (opcional)</Label>
              <Input id="edit-webhook" type="url" placeholder="https://tu-app.com/api/webhooks" value={editWebhookUrl} onChange={(e) => setEditWebhookUrl(e.target.value)} className="h-9 rounded-lg" />
            </div>
            <div className="flex items-center justify-between py-1">
              <Label htmlFor="edit-active" className="text-xs font-medium text-muted-foreground">Aplicación activa</Label>
              <Switch id="edit-active" checked={editIsActive} onCheckedChange={setEditIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingApp(null)} disabled={savingEdit} className="rounded-lg">Cancelar</Button>
            <Button onClick={saveEdit} disabled={savingEdit || !editName.trim()} className="rounded-lg">{savingEdit ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
