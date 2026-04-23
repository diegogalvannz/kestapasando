import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  const email = req.query.email || req.body?.email
  if (!email) {
    return res.status(400).send('<html><body style="font-family:system-ui;text-align:center;padding:60px;background:#0f1117;color:white"><h2>❌ Falta el email</h2></body></html>')
  }

  try {
    await supabase
      .from('suscriptores')
      .update({ activo: false })
      .eq('email', email.toLowerCase().trim())

    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Desuscripción — Kestapasando</title></head>
      <body style="margin:0;padding:0;background:#0f1117;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
        <div style="text-align:center;padding:40px;max-width:400px;">
          <div style="font-size:48px;margin-bottom:16px;">👋</div>
          <h1 style="color:white;font-size:22px;font-weight:800;margin-bottom:12px;">Ya te fuiste, sin drama</h1>
          <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin-bottom:24px;">
            Tu correo <strong style="color:#e5e7eb">${email}</strong> fue removido de la lista. No recibirás más correos de Kestapasando.
          </p>
          <a href="https://kestapasando.com" style="display:inline-block;background:#1e2130;color:#818cf8;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;border:1px solid #374151;">
            Volver al sitio
          </a>
        </div>
      </body>
      </html>
    `)
  } catch (err) {
    console.error('[desuscribir]', err)
    return res.status(500).send('<html><body style="font-family:system-ui;text-align:center;padding:60px;background:#0f1117;color:white"><h2>Error interno</h2></body></html>')
  }
}
