"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Send, Search, Users, Mail, Radio, UserCheck,
  AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Plus, X, Sparkles,
} from "lucide-react"
import type { Application } from "@/lib/types"

interface AppUser {
  external_user_id: string
  email: string | null
  created_at: string
}

type Recipient = { user_id: string; email?: string }

interface SendNotificationFormProps {
  applications: Application[]
  onSent?: () => void
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function parseRecipients(input: string): Recipient[] {
  return input
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(",")
      const user_id = (parts[0] || "").trim()
      const email = (parts[1] || "").trim() || undefined
      if (!user_id) return null
      if (!email && isEmail(user_id)) return { user_id, email: user_id }
      return { user_id, email }
    })
    .filter(Boolean) as Recipient[]
}

const TYPE_OPTIONS = [
  { value: "info",    label: "Info",  color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" },
  { value: "success", label: "Éxito", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" },
  { value: "warning", label: "Aviso", color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800" },
  { value: "error",   label: "Error", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" },
]

const TEMPLATES = [
  {
    label: "Pronto te contactamos",
    type: "info" as const,
    icon: "💬",
    title: "Gracias por contactarnos",
    message:
      "Hemos recibido tu consulta y en breve uno de nuestros desarrolladores se pondrá en contacto contigo.\n\nNuestro equipo está revisando tu mensaje y te responderemos a la brevedad posible.\n\nGracias por confiar en JoFi.",
  },
  {
    label: "Revisión de proyecto",
    type: "warning" as const,
    icon: "📋",
    title: "Revisión de proyecto próximamente",
    message:
      "Te informamos que en los próximos días realizaremos una revisión del estado de tu proyecto.\n\nNos pondremos en contacto para coordinar una sesión donde revisaremos avances, próximos pasos y cualquier ajuste necesario.\n\nEstamos comprometidos con el éxito de tu proyecto. Ante cualquier duda, no dudes en escribirnos.",
  },
  {
    label: "Qué ofrecemos",
    type: "info" as const,
    icon: "🚀",
    title: "Construimos el futuro del mundo digital",
    message:
      "En JoFi desarrollamos aplicaciones web y móviles que transforman negocios y crean experiencias que importan.\n\nDesarrollo Web — SPAs, SSR, e-commerce, dashboards y plataformas SaaS con React, Next.js y Node.js.\n\nApps Móviles — Experiencias nativas para iOS y Android con React Native y Flutter.\n\nDiseño UI/UX — Interfaces que enamoran, desde wireframes hasta sistemas de diseño completos.\n\n¿Listo para construir algo increíble? Visítanos en https://www.jofi.lat/",
  },
]

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "high",   label: "Alta" },
  { value: "urgent", label: "Urgente" },
]

export function SendNotificationForm({ applications, onSent }: SendNotificationFormProps) {
  const [appId, setAppId]                   = useState<string>(applications[0]?.id || "")
  const [title, setTitle]                   = useState("")
  const [message, setMessage]               = useState("")
  const [type, setType]                     = useState("info")
  const [priority, setPriority]             = useState("normal")
  const [sendEmail, setSendEmail]           = useState(true)
  const [broadcastAll, setBroadcastAll]     = useState(false)
  const [recipientsText, setRecipientsText] = useState("")
  const [dataText, setDataText]             = useState("")
  const [showJson, setShowJson]             = useState(false)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [success, setSuccess]               = useState<string | null>(null)
  const [appUsers, setAppUsers]             = useState<AppUser[]>([])
  const [loadingUsers, setLoadingUsers]     = useState(false)
  const [userSearch, setUserSearch]         = useState("")
  const [selectedUsers, setSelectedUsers]   = useState<Set<string>>(new Set())
  const [addedEmails, setAddedEmails]       = useState<Set<string>>(new Set())

  const parsedRecipients = useMemo(() => parseRecipients(recipientsText), [recipientsText])

  const loadAppUsers = async (searchTerm = "") => {
    if (!appId) return
    setLoadingUsers(true)
    try {
      const qs = new URLSearchParams({ app_id: appId, limit: "200" })
      if (searchTerm) qs.set("search", searchTerm)
      const res  = await fetch(`/api/dashboard/app-users?${qs}`)
      const data = await res.json()
      if (data?.ok) setAppUsers(data.users || [])
    } finally { setLoadingUsers(false) }
  }

  useEffect(() => {
    if (appId && !broadcastAll) { loadAppUsers(); setSelectedUsers(new Set()) }
  }, [appId, broadcastAll])

  const syncText = (users: Set<string>, extras: Set<string>) => {
    setRecipientsText(Array.from(new Set([...users, ...extras])).join("\n"))
  }

  const toggleUser = (email: string) => {
    const next = new Set(selectedUsers)
    next.has(email) ? next.delete(email) : next.add(email)
    setSelectedUsers(next)
    syncText(next, addedEmails)
  }

  const addEmailManually = (email: string) => {
    const trimmed = email.trim()
    if (!isEmail(trimmed)) return
    const next = new Set(addedEmails)
    next.add(trimmed)
    setAddedEmails(next)
    syncText(selectedUsers, next)
    setUserSearch("")
  }

  const removeAddedEmail = (email: string) => {
    const next = new Set(addedEmails)
    next.delete(email)
    setAddedEmails(next)
    syncText(selectedUsers, next)
  }

  const selectAll = () => {
    const next = new Set(selectedUsers)
    appUsers.forEach((u) => u.email && next.add(u.email))
    setSelectedUsers(next)
    syncText(next, addedEmails)
  }

  const clearAll = () => {
    setSelectedUsers(new Set())
    setAddedEmails(new Set())
    setRecipientsText("")
  }

  const handleSend = async () => {
    setLoading(true); setError(null); setSuccess(null)
    try {
      if (!appId)                                              { setError("Selecciona una aplicación"); return }
      if (!title.trim() || !message.trim())                   { setError("Completa título y mensaje"); return }
      if (!broadcastAll && parsedRecipients.length === 0)     { setError("Agrega al menos un destinatario"); return }

      let data: any = undefined
      if (dataText.trim()) data = JSON.parse(dataText)

      const res = await fetch("/api/dashboard/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: appId, title: title.trim(), message: message.trim(),
          type, priority, data,
          recipients: broadcastAll ? undefined : parsedRecipients,
          broadcast_all: broadcastAll, send_email: sendEmail,
        }),
      })

      const payload = await res.json()
      if (!res.ok || !payload?.ok) { setError(payload?.error || "No se pudo enviar"); return }

      if (payload?.broadcast_all) {
        setSuccess(`Enviado a ${payload.total_users ?? 0} usuarios · ${payload.inserted_count ?? 0} notificaciones · ${payload.emailed_count ?? 0} emails`)
      } else {
        const total   = Array.isArray(payload.results) ? payload.results.length : 0
        const emailed = Array.isArray(payload.results) ? payload.results.filter((r: any) => r.emailed).length : 0
        setSuccess(`${total} notificaciones · ${emailed} emails`)
      }

      setTitle(""); setMessage(""); setRecipientsText(""); setDataText("")
      setSelectedUsers(new Set()); setAddedEmails(new Set())
      onSent?.()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado")
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Send className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold leading-none">SendView</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Envía notificaciones a tus usuarios</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* LEFT */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 space-y-4 border-border/60 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Aplicación</Label>
                <Select value={appId} onValueChange={setAppId}>
                  <SelectTrigger className="h-9 rounded-lg"><SelectValue placeholder="Seleccionar app" /></SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Modo de envío</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: false, label: "Específicos", icon: <UserCheck className="h-3.5 w-3.5" /> },
                    { v: true,  label: "Broadcast",   icon: <Radio className="h-3.5 w-3.5" /> },
                  ].map(({ v, label, icon }) => (
                    <button key={String(v)} type="button" onClick={() => setBroadcastAll(v)}
                      className={`flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-medium transition-all ${
                        broadcastAll === v
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}>
                      {icon}{label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                sendEmail ? "border-primary/30 bg-primary/5" : "border-border/50 bg-muted/30"
              }`}
              onClick={() => setSendEmail(!sendEmail)}
            >
              <div className="flex items-center gap-2">
                <Mail className={`h-3.5 w-3.5 ${sendEmail ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs font-medium">Enviar email a los destinatarios</span>
              </div>
              <div className={`w-8 h-4 rounded-full transition-colors relative ${sendEmail ? "bg-primary" : "bg-muted-foreground/30"}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${sendEmail ? "left-4" : "left-0.5"}`} />
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-4 border-border/60 shadow-sm">
            {/* Plantillas rápidas */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Plantillas rápidas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => { setTitle(tpl.title); setMessage(tpl.message); setType(tpl.type) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-primary/8 hover:border-primary/40 hover:text-primary text-xs text-muted-foreground font-medium transition-all"
                  >
                    <span>{tpl.icon}</span>{tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/40" />

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Escribe el título de la notificación..." className="h-9 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Mensaje</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe el cuerpo del mensaje..." rows={4} className="rounded-lg resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Tipo</Label>
              <div className="flex gap-2 flex-wrap">
                {TYPE_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setType(opt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      type === opt.value ? opt.color + " shadow-sm" : "border-border/50 text-muted-foreground hover:border-border"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Prioridad</Label>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setPriority(opt.value)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      priority === opt.value
                        ? "bg-foreground text-background border-foreground shadow-sm"
                        : "border-border/50 text-muted-foreground hover:border-border"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <button type="button" onClick={() => setShowJson(!showJson)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {showJson ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                Data JSON adicional (opcional)
              </button>
              {showJson && (
                <Textarea value={dataText} onChange={(e) => setDataText(e.target.value)}
                  placeholder='{"url": "/mi-ruta", "badge": 3}' rows={3}
                  className="mt-2 rounded-lg resize-none font-mono text-xs" />
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-4">
          {broadcastAll ? (
            <Card className="p-5 border-border/60 shadow-sm flex flex-col items-center justify-center gap-3 text-center min-h-[200px]">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Radio className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Modo Broadcast</p>
                <p className="text-xs text-muted-foreground mt-1">Se enviará a todos los usuarios de la aplicación.</p>
              </div>
            </Card>
          ) : (
            <Card className="p-4 space-y-3 border-border/60 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-xs font-medium text-muted-foreground">Destinatarios</Label>
                {parsedRecipients.length > 0 && (
                  <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {parsedRecipients.length} detectados
                  </span>
                )}
              </div>

              {addedEmails.size > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(addedEmails).map((em) => (
                    <span key={em} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                      {em}
                      <button onClick={() => removeAddedEmail(em)} className="hover:text-destructive transition-colors">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuario o escribir email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (isEmail(userSearch)) addEmailManually(userSearch)
                          else loadAppUsers(userSearch)
                        }
                      }}
                      className="pl-8 h-8 text-xs rounded-lg"
                    />
                  </div>
                  {isEmail(userSearch) ? (
                    <Button size="sm" onClick={() => addEmailManually(userSearch)} className="h-8 text-xs rounded-lg gap-1">
                      <Plus className="h-3 w-3" />Agregar
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => loadAppUsers(userSearch)} className="h-8 text-xs rounded-lg">
                      Buscar
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={selectAll} className="text-xs text-primary hover:underline">Todos</button>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground">Limpiar</button>
                  {(selectedUsers.size + addedEmails.size) > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">{selectedUsers.size + addedEmails.size} selec.</span>
                  )}
                </div>

                <ScrollArea className="h-[140px] rounded-lg border border-border/50 bg-muted/20">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Cargando...</div>
                  ) : appUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-1.5">
                      <Users className="h-5 w-5 text-muted-foreground/40" />
                      <p className="text-xs text-muted-foreground">Sin usuarios registrados</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-0.5">
                      {appUsers.map((u) => (
                        <div key={u.external_user_id}
                          className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                            u.email && selectedUsers.has(u.email) ? "bg-primary/10" : "hover:bg-muted/60"
                          }`}
                          onClick={() => u.email && toggleUser(u.email)}>
                          <Checkbox checked={u.email ? selectedUsers.has(u.email) : false} onCheckedChange={() => u.email && toggleUser(u.email)} className="h-3.5 w-3.5" />
                          <span className="text-xs truncate">{u.email || u.external_user_id}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">O escribe manualmente</Label>
                <Textarea value={recipientsText} onChange={(e) => setRecipientsText(e.target.value)}
                  placeholder={"user_123,user@email.com\nuser_456,otro@email.com\nsoloemail@email.com"}
                  rows={3} className="rounded-lg resize-none text-xs font-mono" />
              </div>
            </Card>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />{success}
            </div>
          )}

          <Button onClick={handleSend} disabled={loading} className="w-full h-10 gap-2 rounded-xl shadow-md shadow-primary/20 font-semibold">
            {loading ? (
              <><span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Enviando...</>
            ) : (
              <><Send className="h-3.5 w-3.5" />Enviar notificación</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
