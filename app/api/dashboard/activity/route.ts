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
    const limitRaw = url.searchParams.get("limit")
    const limit = Math.min(Math.max(Number.parseInt(limitRaw || "50"), 1), 200)
    const flow = (url.searchParams.get("flow") || "in").toLowerCase()
    const type = (url.searchParams.get("type") || "").toLowerCase()

    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select("id")
      .eq("owner_id", user.id)

    if (appsError) {
      return NextResponse.json({ ok: false, error: appsError.message }, { status: 500 })
    }

    const appIds = (applications || []).map((a) => a.id)

    if (appIds.length === 0) {
      return NextResponse.json({ ok: true, notifications: [] }, { status: 200 })
    }

    if (app_id && !appIds.includes(app_id)) {
      return NextResponse.json({ ok: false, error: "Aplicación no encontrada o sin acceso" }, { status: 404 })
    }

    const fetchLimit = Math.min(Math.max(limit * 3, limit), 200)

    let query = supabase
      .from("notifications")
      .select("*")
      .in("app_id", app_id ? [app_id] : appIds)
      .order("created_at", { ascending: false })
      .limit(fetchLimit)

    if (type) {
      query = query.ilike("type", type)
    }

    const { data: notifications, error: notificationsError } = await query

    if (notificationsError) {
      return NextResponse.json({ ok: false, error: notificationsError.message }, { status: 500 })
    }

    const filtered = (notifications || []).filter((n: any) => {
      const raw = n?.data
      let obj: any = undefined

      if (raw && typeof raw === "object") {
        obj = raw
      } else if (typeof raw === "string") {
        try {
          obj = JSON.parse(raw)
        } catch {
          obj = undefined
        }
      }

      const origin = obj?._wnc_origin
      const isOut = origin === "dashboard"

      if (flow === "out") return isOut
      if (flow === "all") return true
      return !isOut
    })

    const sliced = filtered.slice(0, limit)

    const userPairs = sliced
      .map((n: any) => ({ app_id: n?.app_id as string | undefined, user_id: n?.user_id as string | undefined }))
      .filter((p) => Boolean(p.app_id) && Boolean(p.user_id)) as Array<{ app_id: string; user_id: string }>

    const appIdsForUsers = Array.from(new Set(userPairs.map((p) => p.app_id)))
    const userIdsForUsers = Array.from(new Set(userPairs.map((p) => p.user_id)))

    const emailByAppAndUser = new Map<string, string>()

    if (appIdsForUsers.length > 0 && userIdsForUsers.length > 0) {
      const { data: appUsers } = await supabase
        .from("app_users")
        .select("app_id,external_user_id,email")
        .in("app_id", appIdsForUsers)
        .in("external_user_id", userIdsForUsers)

      for (const u of appUsers || []) {
        if (u?.email) {
          emailByAppAndUser.set(`${u.app_id}::${u.external_user_id}`, u.email)
        }
      }
    }

    const enriched = sliced.map((n: any) => {
      const key = `${n.app_id}::${n.user_id}`
      const user_email = emailByAppAndUser.get(key)
      return user_email ? { ...n, user_email } : n
    })

    return NextResponse.json({ ok: true, notifications: enriched }, { status: 200 })
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
