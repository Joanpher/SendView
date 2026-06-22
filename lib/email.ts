import nodemailer from "nodemailer"

export type SmtpConfig = {
  host: string
  port: number
  secure: boolean
  user?: string
  pass?: string
  from: string
}

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST
  const portRaw = process.env.SMTP_PORT
  const from = process.env.SMTP_FROM

  if (!host || !portRaw || !from) {
    return null
  }

  const port = Number.parseInt(portRaw, 10)
  const secure = process.env.SMTP_SECURE === "true" || port === 465

  return {
    host,
    port,
    secure,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from,
  }
}

const TYPE_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  info:    { label: "Información", color: "#3b5bdb", bg: "#eef2ff", border: "#c5d0fa" },
  success: { label: "Éxito",       color: "#2f9e44", bg: "#ebfbee", border: "#b2f2bb" },
  warning: { label: "Advertencia", color: "#e67700", bg: "#fff9db", border: "#ffe066" },
  error:   { label: "Error",       color: "#c92a2a", bg: "#fff5f5", border: "#ffc9c9" },
}

function buildHtml(params: {
  title: string
  message: string
  appName?: string
  type?: string
}): string {
  const { title, message, appName, type = "info" } = params
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.info

  const safeTitle = escapeHtml(title)
  const safeMessage = escapeHtml(message)
  const safeApp = appName ? escapeHtml(appName) : ""

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#d8e6f3;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#d8e6f3;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2f4ac7 0%,#4565e8 100%);border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="${process.env.APP_URL}/img/JoFi-app-icon.png" width="48" height="48" alt="JoFi" style="display:block;border:0;border-radius:10px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.4px;">JoFi <span style="opacity:0.55;font-weight:300;">·</span> SendView</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px 0;">

              <p style="margin:0 0 6px;font-size:15px;color:#64748b;">Hola,</p>
              <p style="margin:0 0 28px;font-size:15px;color:#334155;line-height:1.6;">
                ${safeApp
                  ? `Tienes una nueva notificación de <strong>${safeApp}</strong>:`
                  : "Tienes una nueva notificación:"}
              </p>

              <!-- Tarjeta de notificación -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                      <tr>
                        <td style="background:${style.bg};color:${style.color};border:1px solid ${style.border};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.9px;padding:3px 10px;border-radius:99px;">
                          ${style.label}
                        </td>
                      </tr>
                    </table>
                    <h2 style="margin:0 0 10px;font-size:19px;font-weight:800;color:#0f172a;line-height:1.3;">${safeTitle}</h2>
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;white-space:pre-wrap;">${safeMessage}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;font-size:13px;color:#94a3b8;line-height:1.6;">
                Este es un mensaje automático generado por el sistema. Por favor, no respondas directamente a este correo.
                Si tienes alguna pregunta, contacta al equipo de soporte de <strong style="color:#64748b;">${safeApp || "la aplicación"}</strong>.
              </p>

            </td>
          </tr>

          <!-- Separador -->
          <tr>
            <td style="background:#ffffff;padding:0 40px;">
              <div style="height:1px;background:#e2e8f0;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#ffffff;border-radius:0 0 16px 16px;padding:20px 40px;">
              <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
                Si recibiste este mensaje es porque contactaste al equipo de <strong style="color:#64748b;">jofi.lat</strong>.
              </p>
              <p style="margin:0;font-size:12px;color:#b8cfe0;text-align:center;">
                Si crees que recibiste este correo por error, puedes ignorarlo con seguridad.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin-top:20px;font-size:11px;color:#8eacc5;text-align:center;line-height:1.8;">
          © 2026 JoFi &nbsp;·&nbsp; SendView &nbsp;·&nbsp; Plataforma de notificaciones<br/>
          <span style="color:#a8c4d8;">Este correo fue enviado de forma automática. No respondas a este mensaje.</span>
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendNotificationEmail(params: {
  to: string
  subject: string
  title: string
  message: string
  appName?: string
  type?: string
}) {
  const config = getSmtpConfig()
  if (!config) {
    throw new Error("SMTP is not configured")
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
  })

  const safeApp = params.appName ? ` (${params.appName})` : ""
  const text = `${params.title}${safeApp}\n\n${params.message}`

  await transporter.sendMail({
    from: config.from,
    to: params.to,
    replyTo: config.user,
    subject: params.subject,
    text,
    html: buildHtml(params),
  })
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
