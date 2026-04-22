// Mexico City es permanentemente UTC-6 desde 2023 (se eliminó el horario de verano)
const OFFSET_HORAS = 6

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
]
const MESES_CORTOS = [
  'ene.','feb.','mar.','abr.','may.','jun.',
  'jul.','ago.','sep.','oct.','nov.','dic.'
]

// Parsea el timestamp de Supabase siempre como UTC
// (Supabase devuelve sin Z: '2026-04-22T20:37:17.316022' → hay que tratar como UTC)
function parseUTC(fechaISO) {
  if (!fechaISO) return null
  const s = (fechaISO.endsWith('Z') || fechaISO.includes('+')) ? fechaISO : fechaISO + 'Z'
  return new Date(s)
}

// Aplica el offset de Mexico City (UTC-6) al Date UTC
function toMexicoCity(d) {
  return new Date(d.getTime() - OFFSET_HORAS * 60 * 60 * 1000)
}

function hora12(mxD) {
  const h = mxD.getUTCHours()
  const m = mxD.getUTCMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'p.m.' : 'a.m.'
  const h12 = h % 12 || 12
  return `${h12}:${m} ${ampm}`
}

// "22 de abril de 2026 · 2:37 p.m."
function formatFechaHora(fechaISO) {
  if (!fechaISO) return ''
  try {
    const mxD = toMexicoCity(parseUTC(fechaISO))
    const dia = mxD.getUTCDate()
    const mes = MESES[mxD.getUTCMonth()]
    const anio = mxD.getUTCFullYear()
    return `${dia} de ${mes} de ${anio} · ${hora12(mxD)}`
  } catch { return '' }
}

// "22 abr. · 2:37 p.m."
function formatFechaCorta(fechaISO) {
  if (!fechaISO) return ''
  try {
    const mxD = toMexicoCity(parseUTC(fechaISO))
    const dia = mxD.getUTCDate()
    const mes = MESES_CORTOS[mxD.getUTCMonth()]
    return `${dia} ${mes} · ${hora12(mxD)}`
  } catch { return '' }
}

// "22 abr."
function formatFechaSolo(fechaISO) {
  if (!fechaISO) return ''
  try {
    const mxD = toMexicoCity(parseUTC(fechaISO))
    return `${mxD.getUTCDate()} ${MESES_CORTOS[mxD.getUTCMonth()]}`
  } catch { return '' }
}

module.exports = { formatFechaHora, formatFechaCorta, formatFechaSolo }
