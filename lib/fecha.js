const TZ = 'America/Mexico_City'

function formatFechaHora(fechaISO) {
  if (!fechaISO) return ''
  try {
    const d = new Date(fechaISO)
    const fecha = d.toLocaleDateString('es-MX', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' })
    const hora = d.toLocaleTimeString('es-MX', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: true })
    return `${fecha} · ${hora}`
  } catch { return '' }
}

function formatFechaCorta(fechaISO) {
  if (!fechaISO) return ''
  try {
    const d = new Date(fechaISO)
    const fecha = d.toLocaleDateString('es-MX', { timeZone: TZ, day: 'numeric', month: 'short' })
    const hora = d.toLocaleTimeString('es-MX', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: true })
    return `${fecha} · ${hora}`
  } catch { return '' }
}

function formatFechaSolo(fechaISO) {
  if (!fechaISO) return ''
  try {
    const d = new Date(fechaISO)
    return d.toLocaleDateString('es-MX', { timeZone: TZ, day: 'numeric', month: 'short' })
  } catch { return '' }
}

module.exports = { formatFechaHora, formatFechaCorta, formatFechaSolo }
