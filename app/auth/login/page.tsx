"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { NotiLogo } from "@/components/noti-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Send, Zap, Shield, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 bg-primary relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/3" />

        <div className="relative z-10 flex items-center gap-3">
          <NotiLogo size="md" className="bg-white/20 shadow-none" />
          <span className="text-white font-bold text-xl">SendView</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-white text-3xl font-bold leading-tight mb-3">
              Notifica a tus usuarios<br />en tiempo real
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              API REST simple, webhooks instantáneos y panel de control completo para gestionar todas tus notificaciones.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Send,   text: "Envío masivo o individual en segundos" },
              { icon: Zap,    text: "Integración en menos de 5 minutos" },
              { icon: Shield, text: "Seguro con API Keys y RLS" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs">
          © 2026 SendView
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2 lg:hidden">
            <NotiLogo size="sm" />
            <span className="font-bold">SendView</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground hidden sm:block">
              ¿Sin cuenta?{" "}
              <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">Regístrate</Link>
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Bienvenido de vuelta</h1>
              <p className="text-muted-foreground text-sm mt-1">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
                </div>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-10" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c === true)} />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-muted-foreground">Recordarme</Label>
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>
              )}
              <Button type="submit" className="w-full h-10 gap-2" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : <><span>Iniciar Sesión</span><ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground lg:hidden">
              ¿Sin cuenta?{" "}
              <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">Regístrate gratis</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
