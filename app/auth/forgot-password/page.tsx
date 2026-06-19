"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Mail } from "lucide-react"
import { NotiLogo } from "@/components/noti-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-svh flex flex-col">
      {/* Barra top */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <Link href="/auth/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <div className="flex items-center gap-2">
          <NotiLogo size="sm" />
          <span className="font-bold text-sm">SendView</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Contenido centrado */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {success ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Revisa tu email</h2>
                <p className="text-muted-foreground text-sm mt-2">Enviamos un enlace de recuperación a <span className="font-medium text-foreground">{email}</span></p>
              </div>
              <Link href="/auth/login">
                <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" />Volver al inicio de sesión</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
                <p className="text-muted-foreground text-sm mt-1">Ingresa tu email y te enviamos un enlace para restablecer tu acceso</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
                </div>
                {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}
                <Button type="submit" className="w-full h-10" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
