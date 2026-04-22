import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
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
    const fnName = operacion === 'decrementar' ? 'decrementar_reaccion' : 'incrementar_reaccion'
    const { error: rpcError } = await supabase.rpc(fnName, { articulo_id: articuloId, col })
    if (rpcError) {
      console.error('[reaccionar] rpc error:', rpcError)
      return res.status(500).json({ error: rpcError.message })
    }

    // Devolver contadores actualizados
    const { data, error } = await supabase
      .from('articulos')
      .select('reaccion_fuego, reaccion_risa, reaccion_sorpresa, reaccion_enojo, reaccion_calavera')
      .eq('id', articuloId)
      .single()

    if (error) {
      console.error('[reaccionar] select error:', error)
      throw error
    }
    return res.status(200).json(data)
  } catch (err) {
    console.error('[reaccionar] catch:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
