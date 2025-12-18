"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Application, Notification } from "@/lib/types"
import { Activity } from "lucide-react"

interface ActivityLogListProps {
  applications: Application[]
}

export function ActivityLogList({ applications }: ActivityLogListProps) {
  const [rows, setRows] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filterApp, setFilterApp] = useState<string>("all")
  const [flow, setFlow] = useState<string>("in")
  const [filterType, setFilterType] = useState<string>("all")

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
  }, [filterApp, flow, filterType])

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando actividad...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Select value={filterApp} onValueChange={setFilterApp}>
          <SelectTrigger className="w-[260px]">
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
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Entrada/Salida" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">Entrada</SelectItem>
            <SelectItem value="out">Salida</SelectItem>
            <SelectItem value="all">Todas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[220px]">
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
      </div>

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
                    <TableCell className="font-mono text-xs">{n.user_email || n.user_id}</TableCell>
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
    </div>
  )
}
