"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Bell, Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setHasSession(true)
        setIsSessionLoading(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY" || session) {
          setHasSession(true)
          setIsSessionLoading(false)
        }
      }
    )

    checkSession()

    const timeout = setTimeout(() => {
      setIsSessionLoading(false)
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password,
      })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (error: unknown) {
      console.error("Update password error:", error)
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Centro de Notificaciones</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Nueva Contraseña</CardTitle>
              <CardDescription>Ingresa tu nueva contraseña</CardDescription>
            </CardHeader>
            <CardContent>
              {isSessionLoading ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Verificando sesión...</p>
                </div>
              ) : !hasSession ? (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-destructive">
                    El enlace de recuperación ha expirado o es inválido. Por favor solicita un nuevo enlace.
                  </p>
                  <Link href="/auth/forgot-password">
                    <Button variant="outline" className="w-full">
                      Solicitar nuevo enlace
                    </Button>
                  </Link>
                </div>
              ) : success ? (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-green-600">
                    Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión...
                  </p>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      Ir al inicio de sesión
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="password">Nueva Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
