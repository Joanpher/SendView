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
    const { name, email, type, message } = body

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
        type,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error("[v1] Error creating contact:", error)
      return NextResponse.json({ error: "Failed to create contact" }, { status: 500, headers: corsHeaders })
    }

    // Insert notification so the contact appears in the Actividad feed
    supabase
      .from("notifications")
      .insert({
        app_id: application.id,
        user_id: email,
        title: `Nuevo contacto: ${name}`,
        message,
        type: "info",
        priority: "normal",
        data: {
          contact_name: name,
          contact_email: email,
          project_type: type,
        },
      })
      .then(({ error: notifError }) => {
        if (notifError) console.error("[v1] Error inserting contact notification:", notifError)
      })

    // Send confirmation email to the contact (non-blocking)
    sendNotificationEmail({
      to: email,
      subject: "Gracias por contactarnos",
      title: "Gracias por contactarnos",
      message:
        "Hemos recibido tu consulta y en breve uno de nuestros desarrolladores se pondrá en contacto contigo.\n\nNuestro equipo está revisando tu mensaje y te responderemos a la brevedad posible.\n\nGracias por confiar en JoFi.",
      appName: application.name,
      type: "info",
    }).catch((err) => console.error("[v1] Error sending contact confirmation email:", err))

    return NextResponse.json({ success: true, contact }, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error("[v1] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders })
  }
}
