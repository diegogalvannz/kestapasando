import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const COLUMNAS = {
  '🔥': 'reaccion_fuego',
  '😂': 'reaccion_risa',
  '😮': 'reaccion_sorpresa',
  '😡': 'reaccion_enojo',
  '💀': 'reaccion_calavera',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { articuloId, emoji, operacion } = req.body
  if (!articuloId || !emoji) return res.status(400).json({ error: 'Faltan parámetros' })

  const col = COLUMNAS[emoji]
  if (!col) return res.status(400).json({ error: 'Emoji inválido' })

  try {
    if (operacion === 'decrementar') {
      await supabase.rpc('decrementar_reaccion', { articulo_id: articuloId, col })
    } else {
      await supabase.rpc('incrementar_reaccion', { articulo_id: articuloId, col })
    }

    // Devolver contadores actualizados
    const { data, error } = await supabase
      .from('articulos')
      .select('reaccion_fuego, reaccion_risa, reaccion_sorpresa, reaccion_enojo, reaccion_calavera')
      .eq('id', articuloId)
      .single()

    if (error) throw error
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
