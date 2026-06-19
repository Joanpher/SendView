"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApplicationsList } from "@/components/applications-list"
import { SendNotificationForm } from "@/components/send-notification-form"
import { CreateApplicationDialog } from "@/components/create-application-dialog"
import { ActivityLogList } from "@/components/activity-log-list"
import { NotiLogo } from "@/components/noti-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Package, Settings, LogOut, Activity, Send, User, Key } from "lucide-react"
import type { Application } from "@/lib/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface DashboardContentProps {
  applications: Application[]
  user: SupabaseUser
}

export function DashboardContent({ applications: initialApplications, user }: DashboardContentProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [activeTab, setActiveTab] = useState("applications")
  const [mounted, setMounted] = useState(false)
  const [displayName, setDisplayName] = useState<string>(
    ((user as any).user_metadata?.full_name as string) || ((user as any).user_metadata?.name as string) || "",
  )
  const [username, setUsername] = useState<string>(((user as any).user_metadata?.username as string) || "")
  const [savingName, setSavingName] = useState(false)
  const [savingUsername, setSavingUsername] = useState(false)
  const [email, setEmail] = useState<string>(user.email || "")
  const [savingEmail, setSavingEmail] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleApplicationCreated = (newApp: Application) => setApplications([newApp, ...applications])
  const handleApplicationDeleted = (id: string) => setApplications(applications.filter((a) => a.id !== id))
  const handleApplicationUpdated = (updated: Application) =>
    setApplications(applications.map((a) => (a.id === updated.id ? updated : a)))

  const handleSaveName = async () => {
    setSavingName(true)
    try {
      const supabase = createClient()
      await supabase.auth.updateUser({ data: { full_name: displayName } })
      router.refresh()
    } finally { setSavingName(false) }
  }

  const handleSaveUsername = async () => {
    setSavingUsername(true)
    try {
      const supabase = createClient()
      await supabase.auth.updateUser({ data: { username } })
      router.refresh()
    } finally { setSavingUsername(false) }
  }

  const handleSaveEmail = async () => {
    setSavingEmail(true)
    try {
      const supabase = createClient()
      await supabase.auth.updateUser({ email })
      router.refresh()
    } finally { setSavingEmail(false) }
  }

  const handleSavePassword = async () => {
    if (!password || password !== passwordConfirm) return
    setSavingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (!error) { setPassword(""); setPasswordConfirm("") }
    } finally { setSavingPassword(false) }
  }

  return (
    <div className="min-h-screen">
      {/* Header sticky */}
      <header className="sticky top-0 z-20 border-b border-border/50 backdrop-blur-md bg-card/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <NotiLogo size="sm" />
            <span className="font-bold text-base hidden sm:block">SendView</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden md:block truncate max-w-[200px]">{user.email}</span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {mounted ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="flex w-full sm:w-auto gap-1 h-auto p-1 flex-wrap">
              <TabsTrigger value="applications" className="flex items-center gap-1.5 text-xs h-8">
                <Package className="h-3.5 w-3.5" />
                Mis Aplicaciones
              </TabsTrigger>
              <TabsTrigger value="sendview" className="flex items-center gap-1.5 text-xs h-8">
                <Send className="h-3.5 w-3.5" />
                SendView
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-1.5 text-xs h-8">
                <Activity className="h-3.5 w-3.5" />
                Actividad
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center gap-1.5 text-xs h-8">
                <Key className="h-3.5 w-3.5" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs h-8">
                <User className="h-3.5 w-3.5" />
                Perfil
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="space-y-4">
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Mis Aplicaciones</CardTitle>
                      <CardDescription>Gestiona las apps que envían notificaciones</CardDescription>
                    </div>
                    <CreateApplicationDialog onApplicationCreated={handleApplicationCreated} />
                  </div>
                </CardHeader>
                <CardContent>
                  <ApplicationsList
                    applications={applications}
                    onApplicationDeleted={handleApplicationDeleted}
                    onApplicationUpdated={handleApplicationUpdated}
                    hideApiKey
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sendview">
              <SendNotificationForm applications={applications} onSent={() => {}} />
            </TabsContent>

            <TabsContent value="activity">
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Actividad</CardTitle>
                      <CardDescription>Últimas notificaciones de tus aplicaciones</CardDescription>
                    </div>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ActivityLogList applications={applications} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api-keys">
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle>Gestión de API Keys</CardTitle>
                  <CardDescription>Administra las claves de API de tus aplicaciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <ApplicationsList
                    applications={applications}
                    onApplicationDeleted={handleApplicationDeleted}
                    onApplicationUpdated={handleApplicationUpdated}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle>Perfil de usuario</CardTitle>
                  <CardDescription>Información de tu cuenta en SendView</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {[
                    { label: "Nombre", value: displayName, onChange: setDisplayName, onSave: handleSaveName, saving: savingName, placeholder: "Tu nombre" },
                    { label: "Nombre de usuario", value: username, onChange: setUsername, onSave: handleSaveUsername, saving: savingUsername, placeholder: "tu_usuario" },
                    { label: "Email", value: email, onChange: setEmail, onSave: handleSaveEmail, saving: savingEmail, placeholder: "tu@email.com", type: "email" },
                  ].map(({ label, value, onChange, onSave, saving, placeholder, type }) => (
                    <div key={label} className="space-y-1">
                      <span className="text-muted-foreground text-xs">{label}</span>
                      <div className="flex gap-2 items-center">
                        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-8" />
                        <Button size="sm" onClick={onSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
                      </div>
                    </div>
                  ))}
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs">Contraseña</span>
                    <div className="flex flex-col gap-2">
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña" className="h-8" />
                      <Input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Confirmar contraseña" className="h-8" />
                      <div className="flex justify-end">
                        <Button size="sm" onClick={handleSavePassword} disabled={savingPassword || !password || password !== passwordConfirm}>
                          {savingPassword ? "Guardando..." : "Cambiar contraseña"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <span className="text-muted-foreground text-xs">ID de usuario</span>
                    <span className="font-mono text-xs">{user.id}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-8 text-center text-muted-foreground">Cargando...</div>
        )}
      </main>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Configuración de cuenta</DialogTitle>
            <DialogDescription>Gestiona tu nombre, email y contraseña.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm mt-2">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Nombre</span>
              <div className="flex gap-2 items-center">
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Tu nombre" className="h-8" />
                <Button size="sm" onClick={handleSaveName} disabled={savingName}>{savingName ? "Guardando..." : "Guardar"}</Button>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Email</span>
              <div className="flex gap-2 items-center">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="h-8" />
                <Button size="sm" onClick={handleSaveEmail} disabled={savingEmail}>{savingEmail ? "Guardando..." : "Guardar"}</Button>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Contraseña</span>
              <div className="flex flex-col gap-2">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña" className="h-8" />
                <Input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Confirmar" className="h-8" />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleSavePassword} disabled={savingPassword || !password || password !== passwordConfirm}>
                    {savingPassword ? "Guardando..." : "Cambiar contraseña"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
