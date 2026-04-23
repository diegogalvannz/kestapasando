import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const BIENVENIDA_HTML = (nombre) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#1e2130;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b,#312e81,#4338ca);padding:32px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:10px 14px;margin-bottom:12px;">
              <span style="font-size:22px;font-weight:900;color:white;">?!</span>
            </div>
            <div style="font-size:24px;font-weight:900;color:white;letter-spacing:-0.5px;">Kestapasando.com</div>
            <div style="width:120px;height:2px;background:linear-gradient(90deg,#818cf8,#ec4899,#f59e0b);border-radius:2px;margin:8px auto 0;"></div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <div style="font-size:40px;text-align:center;margin-bottom:16px;">🔥</div>
            <h1 style="color:white;font-size:22px;font-weight:800;text-align:center;margin:0 0 12px;">
              ¡Ya quedaste${nombre ? `, ${nombre.split(' ')[0]}` : ''}!
            </h1>
            <p style="color:#9ca3af;font-size:15px;line-height:1.6;text-align:center;margin:0 0 24px;">
              Wey, ya eres parte de la banda de Kestapasando. A partir de mañana te llega tu dosis diaria de las noticias más cabronas del día directo a tu correo.
            </p>
            <div style="background:#111827;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
              <div style="font-size:13px;color:#6b7280;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Tu newsletter llega cada mañana a las</div>
              <div style="font-size:36px;font-weight:900;color:#818cf8;">4:30 AM</div>
              <div style="font-size:12px;color:#6b7280;margin-top:4px;">Hora Ciudad de México 🇲🇽</div>
            </div>
            <p style="color:#9ca3af;font-size:13px;line-height:1.6;text-align:center;margin:0 0 24px;">
              Sin spam, sin mamadas. Solo las noticias que importan en el idioma que entiendes. Y si en algún momento ya no la quieres, te puedes ir cuando quieras sin drama.
            </p>
            <div style="text-align:center;">
              <a href="https://kestapasando.com" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4338ca);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
                Ver las noticias de hoy 🔥
              </a>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #1f2937;text-align:center;">
            <p style="color:#4b5563;font-size:11px;margin:0;">
              ¿Ya no la quieres? <a href="https://kestapasando.com/api/desuscribir?email=${encodeURIComponent('__EMAIL__')}" style="color:#6b7280;">Desuscríbete aquí</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, nombre } = req.body || {}
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Email inválido' })
  }

  const emailLower = email.toLowerCase().trim()

  try {
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('suscriptores')
      .select('id, activo')
      .eq('email', emailLower)
      .single()

    if (existing) {
      if (existing.activo) {
        return res.status(200).json({ ok: true, mensaje: 'Ya estás suscrito' })
      }
      // Reactivate
      await supabase.from('suscriptores').update({ activo: true }).eq('email', emailLower)
      return res.status(200).json({ ok: true, mensaje: 'Bienvenido de vuelta' })
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('suscriptores')
      .insert({ email: emailLower, nombre: nombre?.trim() || null })

    if (insertError) throw insertError

    // Send welcome email
    try {
      await resend.emails.send({
        from: 'Kestapasando <noticias@kestapasando.com>',
        to: emailLower,
        subject: '¡Ya eres parte de Kestapasando! 🔥',
        html: BIENVENIDA_HTML(nombre).replace('__EMAIL__', emailLower),
      })
    } catch (emailErr) {
      console.error('[suscribir] Error enviando bienvenida:', emailErr.message)
      // Don't fail the subscription if email fails
    }

    return res.status(200).json({ ok: true, mensaje: 'Suscrito exitosamente' })
  } catch (err) {
    console.error('[suscribir]', err)
    return res.status(500).json({ error: 'Error interno' })
  }
}
