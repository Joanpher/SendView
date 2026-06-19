"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Application, Notification } from "@/lib/types"
import { Activity, Search, X, History, Filter, Clock, AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react"

interface ActivityLogListProps {
  applications: Application[]
}

const TYPE_CONFIG: Record<string, { icon: typeof Info; color: string; dot: string }> = {
  info:    { icon: Info,          color: "text-blue-600 dark:text-blue-400",       dot: "bg-blue-400" },
  success: { icon: CheckCircle2,  color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-400" },
  warning: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400",     dot: "bg-amber-400" },
  error:   { icon: XCircle,       color: "text-rose-600 dark:text-rose-400",       dot: "bg-rose-400" },
}

const PRIORITY_LABELS: Record<string, string> = { low: "Baja", normal: "Normal", high: "Alta", urgent: "Urgente" }

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return "Ahora mismo"
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return new Date(iso).toLocaleDateString("es-ES")
}

function UserAvatar({ email, userId }: { email?: string; userId: string }) {
  const text = (email || userId).slice(0, 2).toUpperCase()
  const colors = ["bg-violet-200 text-violet-700", "bg-blue-200 text-blue-700", "bg-emerald-200 text-emerald-700", "bg-amber-200 text-amber-700", "bg-rose-200 text-rose-700"]
  const c = colors[(userId.charCodeAt(0) || 0) % colors.length]
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${c}`}>{text}</div>
  )
}

export function ActivityLogList({ applications }: ActivityLogListProps) {
  const [rows, setRows]               = useState<Notification[]>([])
  const [loading, setLoading]         = useState(true)
  const [filterApp, setFilterApp]     = useState("all")
  const [flow, setFlow]               = useState("in")
  const [filterType, setFilterType]   = useState("all")
  const [emailInput, setEmailInput]   = useState("")
  const [emailSearch, setEmailSearch] = useState("")
  const [selectedUser, setSelectedUser]       = useState<{ email: string; userId: string } | null>(null)
  const [userHistory, setUserHistory]         = useState<Notification[]>([])
  const [loadingHistory, setLoadingHistory]   = useState(false)
  const [historyDateFrom, setHistoryDateFrom] = useState("")
  const [historyDateTo, setHistoryDateTo]     = useState("")

  const appNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const a of applications) m.set(a.id, a.name)
    return m
  }, [applications])

  const load = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (filterApp !== "all") qs.set("app_id", filterApp)
      qs.set("flow", flow)
      if (filterType !== "all") qs.set("type", filterType)
      if (emailSearch) qs.set("user_email", emailSearch)
      qs.set("limit", "100")
      const res  = await fetch(`/api/dashboard/activity?${qs}`, { cache: "no-store" })
      const data = await res.json().catch(() => null)
      setRows(res.ok && data?.ok ? (data.notifications || []) : [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterApp, flow, filterType, emailSearch])

  const loadHistory = async (email: string, userId: string, from?: string, to?: string) => {
    setSelectedUser({ email, userId })
    setLoadingHistory(true)
    try {
      const qs = new URLSearchParams({ user_email: email, flow: "all", limit: "500" })
      if (from) qs.set("date_from", from)
      if (to) qs.set("date_to", to)
      const res  = await fetch(`/api/dashboard/activity?${qs}`, { cache: "no-store" })
      const data = await res.json().catch(() => null)
      setUserHistory(res.ok && data?.ok ? (data.notifications || []) : [])
    } finally { setLoadingHistory(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /><span className="font-medium">Filtrar:</span>
        </div>
        <select value={filterApp} onChange={(e) => setFilterApp(e.target.value)}
          className="h-8 px-2.5 text-xs rounded-lg border border-border/60 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="all">Todas las apps</option>
          {applications.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <div className="flex rounded-lg border border-border/60 overflow-hidden">
          {[["in","Entrada"],["out","Salida"],["all","Todas"]].map(([v, l]) => (
            <button key={v} onClick={() => setFlow(v)}
              className={`h-8 px-3 text-xs font-medium transition-colors ${flow === v ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted/60"}`}>{l}</button>
          ))}
        </div>
        <div className="flex rounded-lg border border-border/60 overflow-hidden">
          {[["all","Todo"],["info","Info"],["success","OK"],["warning","Aviso"],["error","Error"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilterType(v)}
              className={`h-8 px-2.5 text-xs font-medium transition-colors ${filterType === v ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted/60"}`}>{l}</button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Buscar usuario..." value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setEmailSearch(emailInput.trim())}
              className="pl-8 h-8 w-48 text-xs rounded-lg" />
          </div>
          <Button size="sm" variant="secondary" onClick={() => setEmailSearch(emailInput.trim())} className="h-8 text-xs rounded-lg px-3">Buscar</Button>
          {emailSearch && (
            <Button size="sm" variant="ghost" onClick={() => { setEmailInput(""); setEmailSearch("") }} className="h-8 w-8 p-0 rounded-lg">
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {emailSearch && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
          <Search className="h-3 w-3 text-primary" />
          Mostrando resultados para <span className="font-mono font-medium text-foreground">{emailSearch}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
          <Clock className="h-4 w-4 animate-pulse" />Cargando actividad...
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Activity className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">Sin actividad para mostrar</p>
        </div>
      ) : (
        <div className="space-y-0 border border-border/50 rounded-2xl overflow-hidden bg-card/50">
          {rows.map((n, i) => {
            const cfg  = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
            const Icon = cfg.icon
            return (
              <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${i !== 0 ? "border-t border-border/40" : ""}`}>
                <div className="flex flex-col items-center pt-1 shrink-0">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                </div>
                <UserAvatar email={n.user_email} userId={n.user_id} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold truncate">{n.title}</span>
                    <span className={`text-xs font-medium ${cfg.color}`}><Icon className="h-3 w-3 inline mr-0.5" />{n.type}</span>
                    {n.priority !== "normal" && (
                      <span className="text-xs text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">{PRIORITY_LABELS[n.priority] || n.priority}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => loadHistory(n.user_email || n.user_id, n.user_id)} className="text-xs text-primary hover:underline font-mono">
                      {n.user_email || n.user_id}
                    </button>
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <span className="text-xs text-muted-foreground">{appNameById.get(n.app_id) || "App"}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">{relativeTime(n.created_at)}</span>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={!!selectedUser} onOpenChange={(o) => { if (!o) { setSelectedUser(null); setHistoryDateFrom(""); setHistoryDateTo("") } }}>
        <DialogContent className="w-[96vw] max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><History className="h-4 w-4" />Historial del usuario</DialogTitle>
            <DialogDescription className="font-mono text-xs">{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 items-end flex-wrap">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Desde</div>
              <Input value={historyDateFrom} onChange={(e) => setHistoryDateFrom(e.target.value)} type="date" className="h-8 text-xs rounded-lg" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Hasta</div>
              <Input value={historyDateTo} onChange={(e) => setHistoryDateTo(e.target.value)} type="date" className="h-8 text-xs rounded-lg" />
            </div>
            <Button size="sm" variant="secondary" onClick={() => selectedUser && loadHistory(selectedUser.email, selectedUser.userId, historyDateFrom || undefined, historyDateTo || undefined)} className="h-8 text-xs rounded-lg">
              Aplicar
            </Button>
            {(historyDateFrom || historyDateTo) && (
              <Button size="sm" variant="ghost" onClick={() => { setHistoryDateFrom(""); setHistoryDateTo(""); selectedUser && loadHistory(selectedUser.email, selectedUser.userId) }} className="h-8 w-8 p-0 rounded-lg">
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
            {userHistory.length > 0 && <span className="ml-auto text-xs text-muted-foreground">{userHistory.length} registros</span>}
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-border/50 bg-card/50">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm"><Clock className="h-4 w-4 animate-pulse" />Cargando...</div>
            ) : userHistory.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Sin registros.</div>
            ) : (
              <div>
                {userHistory.map((n, i) => {
                  const cfg  = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
                  const Icon = cfg.icon
                  return (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${i !== 0 ? "border-t border-border/40" : ""}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold">{n.title}</span>
                          <span className={`text-xs ${cfg.color}`}><Icon className="h-3 w-3 inline mr-0.5" />{n.type}</span>
                          <span className="text-xs text-muted-foreground">{appNameById.get(n.app_id) || "App"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{relativeTime(n.created_at)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
