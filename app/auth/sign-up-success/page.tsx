import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NotiLogo } from "@/components/noti-logo"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center space-y-8">
        <NotiLogo size="lg" className="mx-auto" />

        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">¡Cuenta creada!</h1>
          <p className="text-muted-foreground">
            Te enviamos un email de confirmación. Haz clic en el enlace para activar tu cuenta y empezar a usar <span className="font-semibold text-foreground">SendView</span>.
          </p>
        </div>

        <div className="bg-card/60 border border-border/60 rounded-xl p-5 text-left space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Próximos pasos</p>
          {[
            "Revisa tu bandeja de entrada",
            "Haz clic en el enlace de confirmación",
            "Accede a tu panel de control",
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>

        <Link href="/auth/login">
          <Button className="gap-2">
            Ir al inicio de sesión <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
