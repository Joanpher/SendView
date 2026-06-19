"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { NotiLogo } from "@/components/noti-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowRight, Check } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    if (password !== repeatPassword) { setError("Las contraseñas no coinciden"); setIsLoading(false); return }
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard` },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally { setIsLoading(false) }
  }

  const perks = [
    "Panel de control completo",
    "API REST lista para usar",
    "Envío de emails incluido",
    "Webhooks en tiempo real",
  ]

  return (
    <div className="flex min-h-svh w-full">
      {/* Panel derecho — branding (invertido respecto al login) */}
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-between p-10 bg-gradient-to-b from-primary/90 to-primary relative overflow-hidden order-last">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white/5" />

        <div className="relative z-10 flex justify-end">
          <NotiLogo size="md" className="bg-white/20 shadow-none" />
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">Gratis para siempre</p>
            <h2 className="text-white text-2xl font-bold leading-tight">
              Todo lo que necesitas para notificar a tus usuarios
            </h2>
          </div>
          <div className="space-y-3">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-white/80 text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs">© 2026 SendView</div>
      </div>

      {/* Panel izquierdo — formulario */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <NotiLogo size="sm" />
            <span className="font-bold">SendView</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground hidden sm:block">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">Inicia sesión</Link>
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Empieza a <span className="text-primary font-medium">notificar hoy</span>, es gratis
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repeat-password">Confirmar contraseña</Label>
                <Input id="repeat-password" type="password" required value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} className="h-10" />
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>
              )}
              <Button type="submit" className="w-full h-10 gap-2" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : <><span>Crear Cuenta</span><ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground lg:hidden">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
