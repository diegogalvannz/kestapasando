import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
)

const DOMAIN_MAP = {
  'jornada.com.mx': 'La Jornada',
  'proceso.com.mx': 'Proceso',
  'sopitas.com': 'Sopitas',
  'animalpolitico.com': 'Animal Político',
  'eluniversal.com.mx': 'El Universal',
  'excelsior.com.mx': 'Excélsior',
  'expansion.mx': 'Expansión',
  'infobae.com': 'Infobae',
  'tvnotas.com.mx': 'TV Notas',
  'bbc.com': 'BBC',
  'bbc.co.uk': 'BBC',
  'theguardian.com': 'The Guardian',
  'aljazeera.com': 'Al Jazeera',
  'theverge.com': 'The Verge',
  'wired.com': 'Wired',
  'techcrunch.com': 'TechCrunch',
  'xataka.com': 'Xataka',
  'gizmodo.com': 'Gizmodo',
  'marca.com': 'Marca',
  'variety.com': 'Variety',
}

function getFuente(url) {
  if (!url) return 'Desconocido'
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return DOMAIN_MAP[hostname] || hostname
  } catch {
    return 'Desconocido'
  }
}

function getHourMX(isoStr) {
  if (!isoStr) return null
  const utcMs = new Date(isoStr.endsWith('Z') || isoStr.includes('+') ? isoStr : isoStr + 'Z').getTime()
  const mxMs = utcMs - 6 * 60 * 60 * 1000
  return new Date(mxMs).getUTCHours()
}

function getTodayStartUTC() {
  const nowUTC = new Date()
  const mxNow = new Date(nowUTC.getTime() - 6 * 60 * 60 * 1000)
  const mxDateStr = mxNow.toISOString().split('T')[0]
  return new Date(mxDateStr + 'T06:00:00.000Z')
}

function getYesterdayStartUTC() {
  const t = getTodayStartUTC()
  return new Date(t.getTime() - 24 * 60 * 60 * 1000)
}

function getWeekStartUTC() {
  const t = getTodayStartUTC()
  return new Date(t.getTime() - 7 * 24 * 60 * 60 * 1000)
}

function getMonthStartUTC() {
  const nowUTC = new Date()
  const mxNow = new Date(nowUTC.getTime() - 6 * 60 * 60 * 1000)
  const [year, month] = mxNow.toISOString().split('T')[0].split('-')
  return new Date(`${year}-${month}-01T06:00:00.000Z`)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const password = req.headers['x-dashboard-password']
  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const todayStart = getTodayStartUTC()
    const yesterdayStart = getYesterdayStartUTC()
    const weekStart = getWeekStartUTC()
    const monthStart = getMonthStartUTC()

    const [
      { data: todayArticulos },
      { data: yesterdayArticulos },
      { count: weekCount },
      { count: monthCount },
      { data: ultimos10 },
      { data: suscriptores },
      { data: nuevosHoy },
      { data: nuevosSemana },
      { data: newsletterLogs },
    ] = await Promise.all([
      supabase
        .from('articulos')
        .select('id, url_original, titulo_reescrito, titulo_original, etiquetas, publicado_en, categoria')
        .gte('publicado_en', todayStart.toISOString())
        .order('publicado_en', { ascending: false }),
      supabase
        .from('articulos')
        .select('id, etiquetas')
        .gte('publicado_en', yesterdayStart.toISOString())
        .lt('publicado_en', todayStart.toISOString()),
      supabase
        .from('articulos')
        .select('*', { count: 'exact', head: true })
        .gte('publicado_en', weekStart.toISOString()),
      supabase
        .from('articulos')
        .select('*', { count: 'exact', head: true })
        .gte('publicado_en', monthStart.toISOString()),
      supabase
        .from('articulos')
        .select('id, url_original, titulo_reescrito, etiquetas, publicado_en, categoria')
        .order('publicado_en', { ascending: false })
        .limit(10),
      supabase
        .from('suscriptores')
        .select('id, email, fecha_registro')
        .eq('activo', true)
        .order('fecha_registro', { ascending: false })
        .limit(10),
      supabase
        .from('suscriptores')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
        .gte('fecha_registro', todayStart.toISOString()),
      supabase
        .from('suscriptores')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
        .gte('fecha_registro', weekStart.toISOString()),
      supabase
        .from('newsletter_logs')
        .select('id, fecha_envio, total_suscriptores, emails_enviados, emails_fallidos, articulos_incluidos')
        .order('fecha_envio', { ascending: false })
        .limit(10),
    ])

    const today = todayArticulos || []
    const yesterday = yesterdayArticulos || []

    // AI vs fallback detection: etiquetas non-empty = AI rewritten
    const aiHoy = today.filter(a => a.etiquetas && a.etiquetas.length > 0).length
    const fallbackHoy = today.length - aiHoy

    const aiAyer = yesterday.filter(a => a.etiquetas && a.etiquetas.length > 0).length
    const fallbackAyer = yesterday.length - aiAyer

    // Hour breakdown (MX time) — 0–23
    const porHora = Array(24).fill(0)
    today.forEach(a => {
      const h = getHourMX(a.publicado_en)
      if (h !== null) porHora[h]++
    })

    // Source breakdown today
    const porFuente = {}
    today.forEach(a => {
      const f = getFuente(a.url_original)
      porFuente[f] = (porFuente[f] || 0) + 1
    })
    const porFuenteArr = Object.entries(porFuente)
      .sort((a, b) => b[1] - a[1])
      .map(([nombre, count]) => ({ nombre, count }))

    // Last published timestamp
    const ultimaPublicacion = today.length > 0 ? today[0].publicado_en : null

    // Last 10 articles formatted
    const ultimos = (ultimos10 || []).map(a => ({
      id: a.id,
      titulo: a.titulo_reescrito,
      fuente: getFuente(a.url_original),
      publicado_en: a.publicado_en,
      ai: a.etiquetas && a.etiquetas.length > 0,
      categoria: a.categoria,
    }))

    // Cost estimate (Haiku: $0.80/MTok input, $4/MTok output, ~800 input + 500 output per article)
    const COSTO_POR_ARTICULO = (800 * 0.80 / 1_000_000) + (500 * 4.0 / 1_000_000)
    const costoHoyUSD = aiHoy * COSTO_POR_ARTICULO
    const aiMes = monthCount ? Math.round((monthCount || 0) * (aiHoy / Math.max(today.length, 1))) : aiHoy
    const costoMesUSD = aiMes * COSTO_POR_ARTICULO

    // Subscriber counts require extra queries for total active
    const { count: totalSuscriptores } = await supabase
      .from('suscriptores')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)

    return res.status(200).json({
      hoy: {
        total: today.length,
        ai: aiHoy,
        fallback: fallbackHoy,
        costoUSD: costoHoyUSD,
      },
      ayer: {
        total: yesterday.length,
        ai: aiAyer,
        fallback: fallbackAyer,
      },
      semana: weekCount || 0,
      mes: {
        total: monthCount || 0,
        costoUSD: costoMesUSD,
      },
      porHora,
      porFuente: porFuenteArr,
      ultimaPublicacion,
      ultimos,
      newsletter: {
        totalSuscriptores: totalSuscriptores || 0,
        nuevosHoy: nuevosHoy !== null ? nuevosHoy : 0,
        nuevosSemana: nuevosSemana !== null ? nuevosSemana : 0,
        ultimos10: (suscriptores || []).map(s => ({ email: s.email, fecha_registro: s.fecha_registro })),
        logs: (newsletterLogs || []).map(l => ({
          id: l.id,
          fecha_envio: l.fecha_envio,
          total_suscriptores: l.total_suscriptores,
          emails_enviados: l.emails_enviados,
          emails_fallidos: l.emails_fallidos,
          num_articulos: (l.articulos_incluidos || []).length,
        })),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[dashboard-data]', err)
    return res.status(500).json({ error: err.message })
  }
}
