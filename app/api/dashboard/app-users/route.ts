import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const app_id = url.searchParams.get("app_id")
    const search = url.searchParams.get("search") || ""
    const limitRaw = url.searchParams.get("limit")
    const limit = Math.min(Math.max(Number.parseInt(limitRaw || "100"), 1), 500)

    if (!app_id) {
      return NextResponse.json({ ok: false, error: "app_id es requerido" }, { status: 400 })
    }

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id")
      .eq("id", app_id)
      .eq("owner_id", user.id)
      .single()

    if (appError || !application) {
      return NextResponse.json({ ok: false, error: "Aplicación no encontrada o sin acceso" }, { status: 404 })
    }

    let query = supabase
      .from("app_users")
      .select("external_user_id, email, created_at")
      .eq("app_id", app_id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (search) {
      query = query.ilike("email", `%${search}%`)
    }

    const { data: appUsers, error: usersError } = await query

    if (usersError) {
      return NextResponse.json({ ok: false, error: usersError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, users: appUsers || [] }, { status: 200 })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error inesperado",
      },
      { status: 500 },
    )
  }
}
