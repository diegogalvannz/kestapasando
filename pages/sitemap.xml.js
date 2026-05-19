import { createClient } from '@supabase/supabase-js'

const SITE = 'https://www.kestapasando.com'

function escaparXml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function generarSitemap(articulos) {
  const staticPages = [
    { url: SITE, changefreq: 'hourly', priority: '1.0' },
    { url: `${SITE}/acerca-de`, changefreq: 'monthly', priority: '0.5' },
    { url: `${SITE}/privacidad`, changefreq: 'monthly', priority: '0.3' },
    { url: `${SITE}/terminos`, changefreq: 'monthly', priority: '0.3' },
    { url: `${SITE}/contacto`, changefreq: 'monthly', priority: '0.3' },
  ]

  const staticUrls = staticPages.map(p => `
  <url>
    <loc>${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')

  const articuloUrls = articulos.map(a => `
  <url>
    <loc>${SITE}/${escaparXml(a.slug)}</loc>
    <lastmod>${a.publicado_en ? a.publicado_en.split('T')[0] : ''}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.8</priority>
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${articuloUrls}
</urlset>`
}

export async function getServerSideProps({ res }) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
    )

    const { data: articulos, error } = await supabase
      .from('articulos')
      .select('slug, publicado_en')
      .eq('publicado', true)
      .order('publicado_en', { ascending: false })
      .limit(1000)

    if (error) console.error('[sitemap] Supabase error:', error)

    const sitemap = generarSitemap(articulos || [])

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200')
    res.write(sitemap)
    res.end()
  } catch (err) {
    console.error('[sitemap] Error:', err)
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>')
    res.end()
  }

  return { props: {} }
}

export default function Sitemap() {
  return null
}
