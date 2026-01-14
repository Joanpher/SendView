"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApplicationsList } from "@/components/applications-list"
import { NotificationsList } from "@/components/notifications-list"
import { SendNotificationForm } from "@/components/send-notification-form"
import { CreateApplicationDialog } from "@/components/create-application-dialog"
import { Bell, Package, Settings, LogOut, Activity } from "lucide-react"
import type { Application } from "@/lib/types"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { ActivityLogList } from "@/components/activity-log-list"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface DashboardContentProps {
  applications: Application[]
  user: User
}

export function DashboardContent({ applications: initialApplications, user }: DashboardContentProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [activeTab, setActiveTab] = useState("applications")
  const [mounted, setMounted] = useState(false)
  const [displayName, setDisplayName] = useState<string>(
    ((user as any).user_metadata?.full_name as string) ||
      ((user as any).user_metadata?.name as string) ||
      "",
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

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleApplicationCreated = (newApp: Application) => {
    setApplications([newApp, ...applications])
  }

  const handleApplicationDeleted = (deletedId: string) => {
    setApplications(applications.filter((app) => app.id !== deletedId))
  }

  const handleApplicationUpdated = (updatedApp: Application) => {
    setApplications(applications.map((app) => (app.id === updatedApp.id ? updatedApp : app)))
  }

  const handleSaveName = async () => {
    setSavingName(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: displayName,
        },
      })

      if (!error) {
        router.refresh()
      }
    } finally {
      setSavingName(false)
    }
  }

  const handleSaveUsername = async () => {
    setSavingUsername(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: {
          username,
        },
      })

      if (!error) {
        router.refresh()
      }
    } finally {
      setSavingUsername(false)
    }
  }

  const handleSaveEmail = async () => {
    setSavingEmail(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        email,
      })

      if (!error) {
        router.refresh()
      }
    } finally {
      setSavingEmail(false)
    }
  }

  const handleSavePassword = async () => {
    if (!password || password !== passwordConfirm) {
      return
    }
    setSavingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (!error) {
        setPassword("")
        setPasswordConfirm("")
      }
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Centro de Notificaciones</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
                  Configuración
                </Button>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>Configuración de cuenta</DialogTitle>
                    <DialogDescription>
                      Gestiona la información de tu usuario: nombre, nombre de usuario, email y contraseña.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 text-sm mt-2">
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Nombre</span>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Tu nombre"
                          className="h-8"
                        />
                        <Button size="sm" onClick={handleSaveName} disabled={savingName}>
                          {savingName ? "Guardando..." : "Guardar"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Nombre de usuario</span>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="tu_usuario"
                          className="h-8"
                        />
                        <Button size="sm" onClick={handleSaveUsername} disabled={savingUsername}>
                          {savingUsername ? "Guardando..." : "Guardar"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Email</span>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@email.com"
                          className="h-8"
                        />
                        <Button size="sm" onClick={handleSaveEmail} disabled={savingEmail}>
                          {savingEmail ? "Guardando..." : "Guardar"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Contraseña</span>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Nueva contraseña"
                          className="h-8"
                        />
                        <Input
                          type="password"
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          placeholder="Confirmar contraseña"
                          className="h-8"
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={handleSavePassword}
                            disabled={savingPassword || !password || password !== passwordConfirm}
                          >
                            {savingPassword ? "Guardando..." : "Cambiar contraseña"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {mounted ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 lg:w-[800px] gap-2">
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Mis Aplicaciones
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificaciones
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Actividad
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Perfil
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Mis Aplicaciones</CardTitle>
                      <CardDescription>Gestiona las aplicaciones que envían notificaciones</CardDescription>
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

          <TabsContent value="notifications" className="space-y-4">
            <SendNotificationForm
              applications={applications}
              onSent={() => {
              }}
            />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Actividad</CardTitle>
                    <CardDescription>
                      Últimas notificaciones recibidas por tus aplicaciones.
                    </CardDescription>
                  </div>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <ActivityLogList applications={applications} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de API Keys</CardTitle>
                <CardDescription>
                  Administra las claves de API de tus aplicaciones: ver, copiar y regenerar claves de forma segura.
                </CardDescription>
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

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Perfil de usuario</CardTitle>
                <CardDescription>Información básica de tu cuenta en el centro de notificaciones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs">Nombre</span>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tu nombre"
                      className="h-8"
                    />
                    <Button size="sm" onClick={handleSaveName} disabled={savingName}>
                      {savingName ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs">Nombre de usuario</span>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="tu_usuario"
                      className="h-8"
                    />
                    <Button size="sm" onClick={handleSaveUsername} disabled={savingUsername}>
                      {savingUsername ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs">Email</span>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="h-8"
                    />
                    <Button size="sm" onClick={handleSaveEmail} disabled={savingEmail}>
                      {savingEmail ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de usuario</span>
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
                {user.created_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cuenta creada</span>
                    <span>{new Date(user.created_at).toLocaleString()}</span>
                  </div>
                )}
                {user.last_sign_in_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Último acceso</span>
                    <span>{new Date(user.last_sign_in_at).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
      ) : (
        <div className="py-8 text-center text-muted-foreground">Cargando...</div>
      )}
      </main>
    </div>
  )
}
