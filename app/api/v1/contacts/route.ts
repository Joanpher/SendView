import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey } from "@/lib/api-auth"
import { sendNotificationEmail } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin")
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
    Vary: "Origin",
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) })
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request)

  try {
    const apiKey = request.headers.get("x-api-key")

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401, headers: corsHeaders })
    }

    const application = await validateApiKey(apiKey)

    if (!application) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: corsHeaders })
    }

    const body = await request.json()
    const { name, email, phone, type, message } = body

    if (!name || !email || !type || !message) {
      return NextResponse.json(
        { error: "name, email, type, and message are required" },
        { status: 400, headers: corsHeaders },
      )
    }

    const supabase = createAdminClient()

    const { data: contact, error } = await supabase
      .from("contacts")
      .insert({
        app_id: application.id,
        name,
        email,
        phone: phone || null,
        type,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error("[v1] Error creating contact:", error)
      return NextResponse.json({ error: "Failed to create contact" }, { status: 500, headers: corsHeaders })
    }

    const phoneLine = phone ? `\nTeléfono: ${phone}` : ""

    const [notifResult, emailContactResult, emailTeamResult] = await Promise.allSettled([
      supabase.from("notifications").insert({
        app_id: application.id,
        user_id: email,
        title: `Nuevo contacto: ${name}`,
        message,
        type: "info",
        priority: "normal",
        data: {
          contact_name: name,
          contact_email: email,
          contact_phone: phone || null,
          project_type: type,
        },
      }),
      sendNotificationEmail({
        to: email,
        subject: "Gracias por contactarnos",
        title: "Gracias por contactarnos",
        message:
          "Hemos recibido tu consulta y en breve uno de nuestros desarrolladores se pondrá en contacto contigo.\n\nNuestro equipo está revisando tu mensaje y te responderemos a la brevedad posible.\n\nGracias por confiar en JoFi.",
        appName: application.name,
        type: "info",
      }),
      sendNotificationEmail({
        to: "servicejofi@gmail.com",
        subject: `Nuevo contacto: ${name} (${type})`,
        title: "Nuevo contacto desde el formulario",
        message: `Nombre: ${name}\nEmail: ${email}${phoneLine}\nTipo de proyecto: ${type}\n\nMensaje:\n${message}`,
        appName: application.name,
        type: "info",
      }),
    ])

    if (notifResult.status === "rejected") console.error("[v1] Error inserting notification:", notifResult.reason)
    if (emailContactResult.status === "rejected") console.error("[v1] Error sending confirmation email:", emailContactResult.reason)
    if (emailTeamResult.status === "rejected") console.error("[v1] Error sending internal email:", emailTeamResult.reason)

    return NextResponse.json({ success: true, contact }, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error("[v1] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders })
  }
}
