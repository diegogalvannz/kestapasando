const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function getArticulos(limit = 20, offset = 0, categoria = null) {
  let query = supabase
    .from('articulos')
    .select('id, titulo_reescrito, resumen, categoria, etiquetas, slug, publicado_en, imagenes')
    .eq('publicado', true)
    .order('publicado_en', { ascending: false })
    .range(offset, offset + limit - 1)

  if (categoria) {
    query = query.eq('categoria', categoria)
  }

  const { data, error } = await query
  if (error) { console.error('Supabase error:', error); return [] }
  return data || []
}

async function getArticuloPorSlug(slug) {
  const { data, error } = await supabase
    .from('articulos')
    .select('id, titulo_reescrito, resumen, cuerpo, categoria, etiquetas, slug, publicado_en, imagenes, fuentes(nombre, url)')
    .eq('slug', slug)
    .eq('publicado', true)
    .single()

  if (error) return null
  if (!data) return null
  
  return {
    ...data,
    fuente_nombre: data.fuentes?.nombre,
    fuente_url: data.fuentes?.url
  }
}

module.exports = { getArticulos, getArticuloPorSlug }
