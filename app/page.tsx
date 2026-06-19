import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Shield, Code, ArrowRight, Send, Activity, Bell } from "lucide-react"
import { NotiLogo } from "@/components/noti-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/40 backdrop-blur-sm bg-card/30 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <NotiLogo size="sm" />
          <span className="font-bold text-lg">SendView</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/auth/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
          <Link href="/auth/sign-up"><Button size="sm">Empezar gratis <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button></Link>
        </div>
      </nav>

      {/* Hero — layout asimétrico */}
      <section className="flex-1 grid lg:grid-cols-2 gap-0 min-h-[80vh]">
        {/* Izquierda — texto */}
        <div className="flex flex-col justify-center px-8 md:px-16 py-20 space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">API REST · Webhooks · Emails</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Notifica.<br />
              <span className="text-primary">Sin complicaciones.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Integra SendView en minutos y empieza a enviar notificaciones a tus usuarios desde un panel de control completo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                <Send className="h-4 w-4" />
                Comenzar gratis
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline">Ver documentación</Button>
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-2">
            {[["API Keys", "Seguras"], ["Webhooks", "Tiempo real"], ["Emails", "Incluidos"]].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-muted-foreground">{k}</p>
                <p className="text-sm font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Derecha — mockup visual */}
        <div className="hidden lg:flex items-center justify-center p-12 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
          <div className="relative z-10 w-full max-w-sm space-y-3">
            {/* Fake notification cards */}
            {[
              { type: "success", title: "Pago confirmado", msg: "Tu suscripción fue renovada correctamente.", time: "Ahora" },
              { type: "info",    title: "Nueva versión",   msg: "La versión 2.4.0 ya está disponible.",       time: "2m" },
              { type: "warning", title: "Espacio bajo",    msg: "Tu almacenamiento está al 90%.",             time: "1h" },
            ].map(({ type, title, msg, time }) => {
              const dot: Record<string, string> = { success: "bg-emerald-400", info: "bg-blue-400", warning: "bg-amber-400" }
              return (
                <div key={title} className="bg-card/90 backdrop-blur border border-border/60 rounded-xl p-4 shadow-sm flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot[type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{msg}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{time}</span>
                </div>
              )
            })}
            <div className="flex items-center justify-center gap-2 pt-3 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              3 notificaciones · 2 emails enviados
            </div>
          </div>
        </div>
      </section>

      {/* Features — grid en 3 columnas sin cards iguales */}
      <section className="border-t border-border/40 bg-card/30">
        <div className="container mx-auto px-6 py-16">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-10">Por qué SendView</p>
          <div className="grid md:grid-cols-3 gap-px bg-border/40 rounded-2xl overflow-hidden">
            {[
              { icon: Zap,    bg: "bg-amber-500/10",  iconColor: "text-amber-500",   title: "Integración rápida",    desc: "API REST intuitiva. Tu primera notificación en menos de 5 minutos." },
              { icon: Shield, bg: "bg-primary/10",    iconColor: "text-primary",     title: "Seguro por defecto",    desc: "API Keys, RLS en Supabase y webhooks verificados." },
              { icon: Code,   bg: "bg-emerald-500/10",iconColor: "text-emerald-500", title: "Flexible y escalable",  desc: "Tipos, prioridades, datos JSON y webhooks para cualquier integración." },
            ].map(({ icon: Icon, bg, iconColor, title, desc }) => (
              <div key={title} className={`${bg} p-8 flex flex-col gap-4`}>
                <div className={`w-10 h-10 rounded-xl bg-card/60 flex items-center justify-center ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary py-16 text-center">
        <div className="container mx-auto px-6 space-y-6">
          <NotiLogo size="md" className="mx-auto bg-white/20 shadow-none" />
          <h2 className="text-3xl font-bold text-white">¿Listo para empezar?</h2>
          <p className="text-white/70 max-w-md mx-auto text-sm">Crea tu cuenta gratis y empieza a enviar notificaciones a tus usuarios hoy mismo.</p>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="secondary" className="gap-2 mt-2">
              <Bell className="h-4 w-4" />
              Crear cuenta gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-6 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <NotiLogo size="sm" />
          <span>SendView</span>
        </div>
        <div className="flex gap-4">
          <Link href="/docs" className="hover:text-foreground transition-colors">Documentación</Link>
          <Link href="/auth/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link>
        </div>
      </footer>
    </div>
  )
}
