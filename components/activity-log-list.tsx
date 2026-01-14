"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Application, Notification } from "@/lib/types"
import { Activity, Search, X, History } from "lucide-react"

interface ActivityLogListProps {
  applications: Application[]
}

export function ActivityLogList({ applications }: ActivityLogListProps) {
  const [rows, setRows] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filterApp, setFilterApp] = useState<string>("all")
  const [flow, setFlow] = useState<string>("in")
  const [filterType, setFilterType] = useState<string>("all")
  const [emailSearch, setEmailSearch] = useState<string>("")
  const [emailInput, setEmailInput] = useState<string>("")
  const [selectedUser, setSelectedUser] = useState<{ email: string; userId: string } | null>(null)
  const [userHistory, setUserHistory] = useState<Notification[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

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

      const res = await fetch(`/api/dashboard/activity?${qs.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.ok) {
        setRows([])
        return
      }

      setRows(Array.isArray(data.notifications) ? data.notifications : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filterApp, flow, filterType, emailSearch])

  const handleEmailSearch = () => {
    setEmailSearch(emailInput.trim())
  }

  const clearEmailSearch = () => {
    setEmailInput("")
    setEmailSearch("")
  }

  const loadUserHistory = async (email: string, userId: string) => {
    setSelectedUser({ email, userId })
    setLoadingHistory(true)
    try {
      const qs = new URLSearchParams()
      qs.set("user_email", email)
      qs.set("flow", "all")
      qs.set("limit", "500")

      const res = await fetch(`/api/dashboard/activity?${qs.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.ok) {
        setUserHistory([])
        return
      }

      setUserHistory(Array.isArray(data.notifications) ? data.notifications : [])
    } finally {
      setLoadingHistory(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando actividad...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap items-end">
        <Select value={filterApp} onValueChange={setFilterApp}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas las apps" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las apps</SelectItem>
            {applications.map((app) => (
              <SelectItem key={app.id} value={app.id}>
                {app.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={flow} onValueChange={setFlow}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Entrada/Salida" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">Entrada</SelectItem>
            <SelectItem value="out">Salida</SelectItem>
            <SelectItem value="all">Todas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Éxito</SelectItem>
            <SelectItem value="warning">Advertencia</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por correo..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailSearch()}
              className="pl-9 w-[250px]"
            />
          </div>
          <Button onClick={handleEmailSearch} size="sm" variant="secondary">
            Buscar
          </Button>
          {emailSearch && (
            <Button onClick={clearEmailSearch} size="sm" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {emailSearch && (
        <div className="text-sm text-muted-foreground">
          Filtrando por correo: <span className="font-mono bg-muted px-2 py-1 rounded">{emailSearch}</span>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay actividad todavía.</p>
        </div>
      ) : (
        <>
          <Card className="p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prioridad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{new Date(n.created_at).toLocaleString()}</TableCell>
                    <TableCell>{appNameById.get(n.app_id) || "Desconocida"}</TableCell>
                    <TableCell 
                      className="font-mono text-xs cursor-pointer hover:text-primary hover:underline"
                      onClick={() => loadUserHistory(n.user_email || n.user_id, n.user_id)}
                      title="Ver historial del usuario"
                    >
                      <span className="flex items-center gap-1">
                        {n.user_email || n.user_id}
                        <History className="h-3 w-3 opacity-50" />
                      </span>
                    </TableCell>
                    <TableCell>{n.title}</TableCell>
                    <TableCell>{n.type}</TableCell>
                    <TableCell>{n.priority}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:underline">Ver payload (primer item)</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">{JSON.stringify(rows[0]?.data ?? null, null, 2)}</pre>
          </details>
        </>
      )}

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Usuario
            </DialogTitle>
            <DialogDescription>
              Actividad completa de <span className="font-mono bg-muted px-2 py-1 rounded">{selectedUser?.email}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {loadingHistory ? (
              <div className="text-center py-8 text-muted-foreground">Cargando historial...</div>
            ) : userHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay actividad registrada.</div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-2">
                  {userHistory.length} registros encontrados
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>App</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Mensaje</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Prioridad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userHistory.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</TableCell>
                        <TableCell>{appNameById.get(n.app_id) || "Desconocida"}</TableCell>
                        <TableCell className="font-medium">{n.title}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={n.message}>{n.message}</TableCell>
                        <TableCell>
                          <Badge variant={n.type === "error" ? "destructive" : n.type === "warning" ? "secondary" : "default"}>
                            {n.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{n.priority}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
