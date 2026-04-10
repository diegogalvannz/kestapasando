const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://localhost/qcep_db'
})

async function getArticulos(limit = 20, offset = 0, categoria = null) {
  let query, params
  if (categoria) {
    query = `
      SELECT id, titulo_reescrito, resumen, categoria, etiquetas, slug, publicado_en, imagenes
      FROM articulos
      WHERE publicado = true AND categoria = $1
      ORDER BY publicado_en DESC
      LIMIT $2 OFFSET $3
    `
    params = [categoria, limit, offset]
  } else {
    query = `
      SELECT id, titulo_reescrito, resumen, categoria, etiquetas, slug, publicado_en, imagenes
      FROM articulos
      WHERE publicado = true
      ORDER BY publicado_en DESC
      LIMIT $1 OFFSET $2
    `
    params = [limit, offset]
  }
  const result = await pool.query(query, params)
  return result.rows
}

async function getArticuloPorSlug(slug) {
  const result = await pool.query(`
    SELECT a.id, a.titulo_reescrito, a.resumen, a.cuerpo, a.categoria,
           a.etiquetas, a.slug, a.publicado_en, a.imagenes,
           f.nombre as fuente_nombre, f.url as fuente_url
    FROM articulos a
    LEFT JOIN fuentes f ON a.fuente_id = f.id
    WHERE a.slug = $1 AND a.publicado = true
  `, [slug])
  return result.rows[0] || null
}

module.exports = { getArticulos, getArticuloPorSlug }