import { useState, useEffect } from 'react'

const EMOJIS = [
  { emoji: '🔥', col: 'reaccion_fuego',    label: 'Está cañón' },
  { emoji: '😂', col: 'reaccion_risa',     label: 'Me dio risa' },
  { emoji: '😮', col: 'reaccion_sorpresa', label: 'No manches' },
  { emoji: '😡', col: 'reaccion_enojo',    label: 'Me cae gordo' },
  { emoji: '💀', col: 'reaccion_calavera', label: 'Me mató' },
]

export default function EmojiReacciones({ articuloId, contadoresIniciales }) {
  const lsKey = `reaccion_${articuloId}`

  const [contadores, setContadores] = useState(contadoresIniciales || {
    reaccion_fuego: 0, reaccion_risa: 0, reaccion_sorpresa: 0,
    reaccion_enojo: 0, reaccion_calavera: 0,
  })
  const [miReaccion, setMiReaccion] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    try {
      const guardada = localStorage.getItem(lsKey)
      if (guardada) setMiReaccion(guardada)
    } catch {}
  }, [lsKey])

  const reaccionar = async (e, emoji, col) => {
    e.preventDefault()
    e.stopPropagation()
    if (cargando) return

    const misma = miReaccion === emoji
    setCargando(true)

    // Optimistic update
    setContadores(prev => {
      const nuevo = { ...prev }
      if (misma) {
        nuevo[col] = Math.max(0, (nuevo[col] || 0) - 1)
      } else {
        nuevo[col] = (nuevo[col] || 0) + 1
        if (miReaccion) {
          const colAnterior = EMOJIS.find(r => r.emoji === miReaccion)?.col
          if (colAnterior) nuevo[colAnterior] = Math.max(0, (nuevo[colAnterior] || 0) - 1)
        }
      }
      return nuevo
    })

    const nuevaReaccion = misma ? null : emoji
    setMiReaccion(nuevaReaccion)
    try { localStorage.setItem(lsKey, nuevaReaccion || '') } catch {}

    try {
      // Si cambia de emoji: decrementar el anterior primero
      if (!misma && miReaccion) {
        const colAnterior = EMOJIS.find(r => r.emoji === miReaccion)?.col
        if (colAnterior) {
          await fetch('/api/reaccionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articuloId, emoji: miReaccion, operacion: 'decrementar' }),
          })
        }
      }

      const op = misma ? 'decrementar' : 'incrementar'
      const res = await fetch('/api/reaccionar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articuloId, emoji, operacion: op }),
      })
      if (res.ok) {
        const data = await res.json()
        setContadores(data)
      }
    } catch {}

    setCargando(false)
  }

  const hayReacciones = EMOJIS.some(({ col }) => (contadores[col] || 0) > 0)

  return (
    <div
      onClick={e => { e.preventDefault(); e.stopPropagation() }}
      style={{ display:'flex', gap:'4px', flexWrap:'wrap', justifyContent:'flex-end', marginTop:'8px' }}
    >
      {EMOJIS.map(({ emoji, col, label }) => {
        const count = contadores[col] || 0
        const seleccionado = miReaccion === emoji
        if (!hayReacciones || count > 0 || seleccionado) {
          return (
            <button
              key={emoji}
              onClick={e => reaccionar(e, emoji, col)}
              title={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                background: seleccionado ? '#eef2ff' : 'rgba(241,245,249,0.9)',
                border: seleccionado ? '1.5px solid #6366f1' : '1.5px solid #e5e7eb',
                borderRadius: '20px',
                padding: '2px 7px 2px 5px',
                cursor: 'pointer',
                fontSize: '13px',
                lineHeight: 1,
                transition: 'all 0.15s',
                opacity: cargando ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!seleccionado) e.currentTarget.style.borderColor = '#a5b4fc' }}
              onMouseLeave={e => { if (!seleccionado) e.currentTarget.style.borderColor = '#e5e7eb' }}
            >
              <span style={{ fontSize:'14px' }}>{emoji}</span>
              {count > 0 && (
                <span style={{ fontSize:'11px', fontWeight:'700', color: seleccionado ? '#6366f1' : '#6b7280' }}>
                  {count}
                </span>
              )}
            </button>
          )
        }
        return null
      })}
    </div>
  )
}
