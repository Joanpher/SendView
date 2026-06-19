import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NotiLogo } from "@/components/noti-logo"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const params = await searchParams

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center space-y-8">
        <NotiLogo size="lg" className="mx-auto" />

        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Error de autenticación</h1>
          <p className="text-muted-foreground text-sm">
            {params?.error
              ? `Código de error: ${params.error}`
              : "Ocurrió un problema durante la autenticación. Por favor intenta de nuevo."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/login">
            <Button className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" />Volver al inicio de sesión
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button variant="outline" className="w-full sm:w-auto">Crear cuenta</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
