import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

const SUBJECTS = [
  'Lo que te perdiste mientras dormías 🔥',
  '8 cosas que pasaron hoy y no sabías 💀',
  'Tu dosis de noticias cabronas del día 😤',
  'Wey, esto pasó hoy y hay que hablar 🫠',
  'Las noticias más chin... del día 🔥',
  'El mundo no para, y tú tampoco debería 💀',
]

function getRandomSubject() {
  return SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]
}

function buildNewsletterHtml(articulos, emailDestinatario) {
  const articulosHtml = articulos.map(art => {
    const imagen = art.imagenes?.[0] || null
    const resumen = (art.resumen || '').slice(0, 150) + ((art.resumen || '').length > 150 ? '...' : '')
    const url = `https://kestapasando.com/${art.slug}`
    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:#1e2130;border-radius:12px;overflow:hidden;">
        ${imagen ? `
        <tr>
          <td>
            <img src="${imagen}" alt="" width="560" style="width:100%;max-width:560px;height:200px;object-fit:cover;display:block;" onerror="this.style.display='none'"/>
          </td>
        </tr>` : ''}
        <tr>
          <td style="padding:16px 20px;">
            <div style="margin-bottom:6px;">
              <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase;background:#312e81;color:#a5b4fc;">${art.categoria || 'noticias'}</span>
            </div>
            <h2 style="color:white;font-size:16px;font-weight:800;margin:0 0 8px;line-height:1.3;">${art.titulo_reescrito || ''}</h2>
            <p style="color:#9ca3af;font-size:13px;line-height:1.5;margin:0 0 12px;">${resumen}</p>
            <a href="${url}" style="display:inline-block;background:#6366f1;color:white;text-decoration:none;padding:8px 16px;border-radius:8px;font-weight:700;font-size:12px;">
              Leer más →
            </a>
          </td>
        </tr>
      </table>
    `
  }).join('')

  const unsubLink = `https://kestapasando.com/api/desuscribir?email=${encodeURIComponent(emailDestinatario)}`

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b,#312e81,#4338ca);padding:28px 32px;border-radius:16px 16px 0 0;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:8px 12px;margin-bottom:10px;">
              <span style="font-size:18px;font-weight:900;color:white;">?!</span>
            </div>
            <div style="font-size:20px;font-weight:900;color:white;">Kestapasando.com</div>
            <div style="width:100px;height:2px;background:linear-gradient(90deg,#818cf8,#ec4899,#f59e0b);border-radius:2px;margin:8px auto 0;"></div>
            <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:8px 0 0;">Las noticias más cabronas del día 🔥</p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:24px 0;">
            ${articulosHtml}
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="background:#1e2130;border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;">
            <p style="color:#9ca3af;font-size:13px;margin:0 0 12px;">¿Quieres ver todas las noticias?</p>
            <a href="https://kestapasando.com" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4338ca);color:white;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">
              Ver todo en Kestapasando 🔥
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px;text-align:center;">
            <p style="color:#4b5563;font-size:11px;margin:0;">
              Recibiste este correo porque te suscribiste a Kestapasando.com<br>
              <a href="${unsubLink}" style="color:#6b7280;">Desuscribirme</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`
}

export default async function handler(req, res) {
  // Auth: Vercel cron sends authorization header, also support x-cron-secret
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers['authorization']
  const cronHeader = req.headers['x-cron-secret']

  const validAuth =
    cronHeader === cronSecret ||
    (authHeader && authHeader === `Bearer ${cronSecret}`)

  if (!validAuth) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    // Get last 24h articles
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: articulos } = await supabase
      .from('articulos')
      .select('id, titulo_reescrito, resumen, cuerpo, categoria, slug, imagenes, publicado_en')
      .gte('publicado_en', since)
      .eq('publicado', true)
      .order('publicado_en', { ascending: false })
      .limit(8)

    if (!articulos || articulos.length === 0) {
      return res.status(200).json({ ok: true, mensaje: 'Sin artículos en las últimas 24h' })
    }

    // Get active subscribers
    const { data: suscriptores } = await supabase
      .from('suscriptores')
      .select('email')
      .eq('activo', true)

    if (!suscriptores || suscriptores.length === 0) {
      return res.status(200).json({ ok: true, mensaje: 'Sin suscriptores activos' })
    }

    const subject = getRandomSubject()
    let enviados = 0
    let fallidos = 0

    // Send in batches of 50
    const BATCH = 50
    for (let i = 0; i < suscriptores.length; i += BATCH) {
      const batch = suscriptores.slice(i, i + BATCH)
      await Promise.all(batch.map(async (s) => {
        try {
          await resend.emails.send({
            from: 'Kestapasando <noticias@kestapasando.com>',
            to: s.email,
            subject,
            html: buildNewsletterHtml(articulos, s.email),
          })
          enviados++
        } catch (e) {
          console.error(`[newsletter] Error enviando a ${s.email}:`, e.message)
          fallidos++
        }
      }))
    }

    // Log the send
    await supabase.from('newsletter_logs').insert({
      total_suscriptores: suscriptores.length,
      emails_enviados: enviados,
      emails_fallidos: fallidos,
      articulos_incluidos: articulos.map(a => ({ id: a.id, titulo: a.titulo_reescrito, slug: a.slug })),
    })

    return res.status(200).json({
      ok: true,
      enviados,
      fallidos,
      articulos: articulos.length,
      suscriptores: suscriptores.length,
    })
  } catch (err) {
    console.error('[send-newsletter]', err)
    return res.status(500).json({ error: err.message })
  }
}
