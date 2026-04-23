import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'
import { formatFechaCorta, formatFechaHora } from '../lib/fecha'

const DEFAULT_COSTOS = { railway: 5, vercel: 0, supabase: 0 }
const COSTO_POR_ARTICULO = (800 * 0.80 / 1_000_000) + (500 * 4.0 / 1_000_000)

function minutosDesde(isoStr) {
  if (!isoStr) return Infinity
  const ms = Date.now() - new Date(isoStr.endsWith('Z') || isoStr.includes('+') ? isoStr : isoStr + 'Z').getTime()
  return Math.floor(ms / 60000)
}

function Semaforo({ ultimaPublicacion }) {
  const mins = minutosDesde(ultimaPublicacion)
  let color, label, bg
  if (mins <= 70) {
    color = '#22c55e'; label = 'ACTIVO'; bg = '#052e16'
  } else if (mins <= 150) {
    color = '#eab308'; label = 'LENTO'; bg = '#1c1400'
  } else {
    color = '#ef4444'; label = 'CAÍDO'; bg = '#1f0000'
  }
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', background:bg, border:`2px solid ${color}`, borderRadius:'12px', padding:'16px 20px' }}>
      <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:color, boxShadow:`0 0 12px ${color}`, flexShrink:0 }}/>
      <div>
        <div style={{ fontSize:'20px', fontWeight:'900', color, letterSpacing:'2px' }}>{label}</div>
        <div style={{ fontSize:'12px', color:'#9ca3af', marginTop:'2px' }}>
          {ultimaPublicacion
            ? `Último artículo hace ${mins < 60 ? `${mins} min` : `${Math.floor(mins/60)}h ${mins%60}min`}`
            : 'Sin datos'}
        </div>
      </div>
    </div>
  )
}

function KPI({ label, value, sub, color }) {
  return (
    <div style={{ background:'#1e2130', border:'1px solid #374151', borderRadius:'12px', padding:'20px', display:'flex', flexDirection:'column', gap:'4px' }}>
      <div style={{ fontSize:'12px', color:'#6b7280', textTransform:'uppercase', letterSpacing:'1px', fontWeight:'600' }}>{label}</div>
      <div style={{ fontSize:'32px', fontWeight:'900', color: color || '#f9fafb', lineHeight:'1' }}>{value}</div>
      {sub && <div style={{ fontSize:'12px', color:'#9ca3af' }}>{sub}</div>}
    </div>
  )
}

function BarraHora({ porHora }) {
  const max = Math.max(...porHora, 1)
  const ahora = new Date()
  const horaActualMX = new Date(ahora.getTime() - 6*60*60*1000).getUTCHours()
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:'2px', height:'80px' }}>
        {porHora.map((count, h) => (
          <div key={h} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
            <div
              style={{
                width:'100%',
                height: count > 0 ? `${Math.max(6, (count/max)*70)}px` : '2px',
                background: h === horaActualMX ? '#818cf8' : count > 0 ? '#3b82f6' : '#1f2937',
                borderRadius:'2px 2px 0 0',
                transition:'height 0.3s',
              }}
              title={`${h}:00 — ${count} artículos`}
            />
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
        {[0,3,6,9,12,15,18,21].map(h => (
          <span key={h} style={{ fontSize:'9px', color:'#6b7280' }}>{h}h</span>
        ))}
      </div>
    </div>
  )
}

function EditarCostos({ costos, onChange }) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(costos)
  if (!editando) return (
    <button
      onClick={() => { setForm(costos); setEditando(true) }}
      style={{ fontSize:'11px', color:'#6366f1', background:'none', border:'1px solid #374151', borderRadius:'6px', padding:'4px 10px', cursor:'pointer' }}
    >
      ✏️ Editar
    </button>
  )
  return (
    <div style={{ background:'#111827', border:'1px solid #4b5563', borderRadius:'10px', padding:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
      {['railway','vercel','supabase'].map(k => (
        <label key={k} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#d1d5db' }}>
          <span style={{ width:'80px', textTransform:'capitalize' }}>{k}</span>
          <span style={{ color:'#6b7280' }}>$</span>
          <input
            type="number"
            value={form[k]}
            onChange={e => setForm(p => ({...p, [k]: parseFloat(e.target.value)||0}))}
            style={{ width:'80px', background:'#1f2937', border:'1px solid #374151', borderRadius:'6px', padding:'4px 8px', color:'white', fontSize:'13px' }}
          />
          <span style={{ color:'#6b7280' }}>/mes</span>
        </label>
      ))}
      <div style={{ display:'flex', gap:'8px' }}>
        <button onClick={() => { onChange(form); setEditando(false) }}
          style={{ flex:1, background:'#6366f1', color:'white', border:'none', borderRadius:'6px', padding:'8px', cursor:'pointer', fontWeight:'700', fontSize:'13px' }}>
          Guardar
        </button>
        <button onClick={() => setEditando(false)}
          style={{ flex:1, background:'#374151', color:'white', border:'none', borderRadius:'6px', padding:'8px', cursor:'pointer', fontSize:'13px' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

function LoginForm({ onLogin, error }) {
  const [pw, setPw] = useState('')
  const submit = (e) => { e.preventDefault(); onLogin(pw) }
  return (
    <div style={{ minHeight:'100vh', background:'#0f1117', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'#1e2130', border:'1px solid #374151', borderRadius:'16px', padding:'40px', width:'100%', maxWidth:'360px', textAlign:'center' }}>
        <div style={{ fontSize:'32px', marginBottom:'8px' }}>🔒</div>
        <h1 style={{ color:'white', fontSize:'20px', fontWeight:'800', marginBottom:'4px' }}>Dashboard Admin</h1>
        <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'24px' }}>kestapasando.com</p>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            style={{ background:'#111827', border:'1px solid ' + (error?'#ef4444':'#374151'), borderRadius:'8px', padding:'12px 16px', color:'white', fontSize:'15px', outline:'none' }}
          />
          {error && <p style={{ color:'#ef4444', fontSize:'12px', margin:0 }}>Contraseña incorrecta</p>}
          <button type="submit" style={{ background:'#6366f1', color:'white', border:'none', borderRadius:'8px', padding:'12px', fontWeight:'700', fontSize:'15px', cursor:'pointer' }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [auth, setAuth] = useState(null) // null=loading, false=no auth, string=password
  const [loginError, setLoginError] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)
  const [costos, setCostos] = useState(DEFAULT_COSTOS)

  // Load auth + costs from sessionStorage/localStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('dashboard_pw')
      setAuth(saved || false)
      const savedCostos = localStorage.getItem('dashboard_costos')
      if (savedCostos) setCostos(JSON.parse(savedCostos))
    } catch {
      setAuth(false)
    }
  }, [])

  const fetchData = useCallback(async (password) => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard-data', {
        headers: { 'x-dashboard-password': password }
      })
      if (res.status === 401) {
        setAuth(false)
        try { sessionStorage.removeItem('dashboard_pw') } catch {}
        return
      }
      const d = await res.json()
      setData(d)
      setUltimaActualizacion(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch data when authenticated
  useEffect(() => {
    if (auth) fetchData(auth)
  }, [auth, fetchData])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!auth) return
    const t = setInterval(() => fetchData(auth), 60000)
    return () => clearInterval(t)
  }, [auth, fetchData])

  const handleLogin = async (pw) => {
    setLoginError(false)
    // Verify by hitting the API
    try {
      const res = await fetch('/api/dashboard-data', {
        headers: { 'x-dashboard-password': pw }
      })
      if (res.ok) {
        try { sessionStorage.setItem('dashboard_pw', pw) } catch {}
        const d = await res.json()
        setData(d)
        setUltimaActualizacion(new Date())
        setAuth(pw)
      } else {
        setLoginError(true)
      }
    } catch {
      setLoginError(true)
    }
  }

  const guardarCostos = (nuevos) => {
    setCostos(nuevos)
    try { localStorage.setItem('dashboard_costos', JSON.stringify(nuevos)) } catch {}
  }

  if (auth === null) return null // loading

  if (!auth) return <LoginForm onLogin={handleLogin} error={loginError} />

  const totalInfra = (costos.railway || 0) + (costos.vercel || 0) + (costos.supabase || 0)
  const costoAnthropicMes = data ? (data.mes?.costoUSD || 0) : 0
  const totalMes = totalInfra + costoAnthropicMes

  const diffArticulos = data ? data.hoy.total - data.ayer.total : 0

  return (
    <div style={{ minHeight:'100vh', background:'#0f1117', color:'white', fontFamily:'system-ui,sans-serif' }}>
      <Head>
        <title>Dashboard — kestapasando.com</title>
        <meta name="robots" content="noindex,nofollow"/>
      </Head>

      <style>{`
        * { box-sizing: border-box; }
        .grid-kpi { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        @media(max-width:900px) { .grid-kpi { grid-template-columns:repeat(2,1fr); } .grid-2 { grid-template-columns:1fr; } .grid-3 { grid-template-columns:1fr 1fr; } }
        @media(max-width:500px) { .grid-kpi { grid-template-columns:1fr 1fr; } .grid-3 { grid-template-columns:1fr; } }
        .card { background:#1e2130; border:1px solid #374151; border-radius:14px; padding:20px; }
        .section-title { font-size:11px; font-weight:700; color:#6366f1; text-transform:uppercase; letter-spacing:2px; margin-bottom:14px; }
        .tag { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; }
        tr:hover td { background:#111827; }
      `}</style>

      {/* Header */}
      <div style={{ background:'#111827', borderBottom:'1px solid #1f2937', padding:'14px 24px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontSize:'20px' }}>📊</span>
            <div>
              <div style={{ fontWeight:'800', fontSize:'15px' }}>Dashboard</div>
              <div style={{ fontSize:'11px', color:'#6b7280' }}>kestapasando.com · Admin</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            {ultimaActualizacion && (
              <span style={{ fontSize:'11px', color:'#6b7280' }}>
                Actualizado {ultimaActualizacion.toLocaleTimeString('es-MX', {hour:'2-digit',minute:'2-digit',second:'2-digit'})}
              </span>
            )}
            <button
              onClick={() => fetchData(auth)}
              disabled={loading}
              style={{ background:'#1e2130', border:'1px solid #374151', color:'white', borderRadius:'8px', padding:'7px 14px', cursor:'pointer', fontSize:'12px', fontWeight:'600', opacity:loading?0.7:1 }}
            >
              {loading ? '⟳ Cargando...' : '⟳ Refrescar'}
            </button>
            <button
              onClick={() => { try{sessionStorage.removeItem('dashboard_pw')}catch{} setAuth(false) }}
              style={{ background:'none', border:'1px solid #374151', color:'#6b7280', borderRadius:'8px', padding:'7px 12px', cursor:'pointer', fontSize:'12px' }}
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'24px 16px', display:'flex', flexDirection:'column', gap:'28px' }}>

        {/* SECCIÓN 1 — Estado del scraper */}
        <section>
          <div className="section-title">🚦 Estado del scraper</div>
          <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'16px' }}>
            <div style={{ flex:'0 0 auto' }}>
              <Semaforo ultimaPublicacion={data?.ultimaPublicacion} />
            </div>
            <div style={{ flex:1, minWidth:'200px' }}>
              <div className="card" style={{ height:'100%' }}>
                <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'6px' }}>Comparación vs ayer</div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'28px', fontWeight:'900', color: diffArticulos >= 0 ? '#22c55e' : '#ef4444' }}>
                    {diffArticulos >= 0 ? '↑' : '↓'} {Math.abs(diffArticulos)}
                  </span>
                  <div>
                    <div style={{ fontSize:'13px', color:'#d1d5db' }}>artículos vs ayer</div>
                    <div style={{ fontSize:'11px', color:'#9ca3af' }}>Hoy: {data?.hoy.total || 0} · Ayer: {data?.ayer.total || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2 — KPIs principales */}
        <section>
          <div className="section-title">📰 Artículos publicados</div>
          <div className="grid-kpi">
            <KPI label="Hoy" value={data?.hoy.total ?? '—'} sub="artículos" color="#818cf8"/>
            <KPI label="Ayer" value={data?.ayer.total ?? '—'} sub="artículos"/>
            <KPI label="Esta semana" value={data?.semana ?? '—'} sub="artículos"/>
            <KPI label="Este mes" value={data?.mes.total ?? '—'} sub="artículos"/>
          </div>
        </section>

        {/* SECCIÓN 3 — Distribución del día */}
        <section>
          <div className="grid-2">
            {/* Gráfica por hora */}
            <div className="card">
              <div className="section-title">⏰ Artículos por hora (hoy, hora MX)</div>
              {data ? <BarraHora porHora={data.porHora}/> : <div style={{color:'#6b7280',fontSize:'13px'}}>Cargando...</div>}
            </div>

            {/* AI vs fallback */}
            <div className="card">
              <div className="section-title">🤖 IA reescrita vs fallback</div>
              {data ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {[
                    { label:'Con IA (hoy)', val:data.hoy.ai, total:data.hoy.total, color:'#6366f1' },
                    { label:'Fallback (hoy)', val:data.hoy.fallback, total:data.hoy.total, color:'#f59e0b' },
                    { label:'Con IA (ayer)', val:data.ayer.ai, total:data.ayer.total, color:'#818cf8' },
                    { label:'Fallback (ayer)', val:data.ayer.fallback, total:data.ayer.total, color:'#d97706' },
                  ].map(({label,val,total,color}) => (
                    <div key={label}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'4px' }}>
                        <span style={{ color:'#d1d5db' }}>{label}</span>
                        <span style={{ fontWeight:'700', color }}>{val} / {total}</span>
                      </div>
                      <div style={{ background:'#111827', borderRadius:'4px', height:'6px', overflow:'hidden' }}>
                        <div style={{ width:`${total > 0 ? (val/total*100) : 0}%`, height:'100%', background:color, borderRadius:'4px', transition:'width 0.5s' }}/>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop:'4px', padding:'10px', background:'#111827', borderRadius:'8px' }}>
                    <div style={{ fontSize:'11px', color:'#6b7280' }}>
                      {data.hoy.fallback > 0
                        ? '⚠️ Hay artículos fallback hoy — la API de Anthropic puede tener problemas o sin créditos'
                        : '✅ Todos los artículos de hoy fueron reescritos con IA'}
                    </div>
                  </div>
                </div>
              ) : <div style={{color:'#6b7280',fontSize:'13px'}}>Cargando...</div>}
            </div>
          </div>
        </section>

        {/* SECCIÓN 4 — Por fuente */}
        <section>
          <div className="card">
            <div className="section-title">🕷️ Artículos por fuente (hoy)</div>
            {data && data.porFuente.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'8px' }}>
                {data.porFuente.map(({nombre, count}) => (
                  <div key={nombre} style={{ background:'#111827', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'12px', color:'#d1d5db' }}>{nombre}</span>
                    <span style={{ fontWeight:'800', color:'#818cf8', fontSize:'18px' }}>{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color:'#6b7280', fontSize:'13px' }}>
                {data ? 'Sin artículos hoy aún' : 'Cargando...'}
              </div>
            )}
          </div>
        </section>

        {/* SECCIÓN 5 — Costos */}
        <section>
          <div className="section-title">💸 Costos estimados</div>
          <div className="grid-2">
            {/* Costos del mes */}
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <span style={{ fontWeight:'700', fontSize:'14px' }}>Infraestructura mensual</span>
                <EditarCostos costos={costos} onChange={guardarCostos}/>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[
                  { label:'Railway', val:costos.railway, color:'#f59e0b' },
                  { label:'Vercel', val:costos.vercel, color:'#3b82f6' },
                  { label:'Supabase', val:costos.supabase, color:'#22c55e' },
                  { label:'Anthropic API (calculado)', val:costoAnthropicMes, color:'#818cf8' },
                ].map(({label,val,color}) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #1f2937' }}>
                    <span style={{ fontSize:'13px', color:'#d1d5db' }}>{label}</span>
                    <span style={{ fontWeight:'700', color, fontSize:'15px' }}>${val.toFixed(2)}<span style={{fontSize:'10px',color:'#6b7280',fontWeight:'400'}}>/mes</span></span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0 0' }}>
                  <span style={{ fontWeight:'800', color:'white' }}>TOTAL MENSUAL</span>
                  <span style={{ fontWeight:'900', color:'#f9fafb', fontSize:'22px' }}>${totalMes.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Costo de Anthropic hoy */}
            <div className="card">
              <div style={{ fontWeight:'700', fontSize:'14px', marginBottom:'16px' }}>Anthropic API — estimado hoy</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ background:'#111827', borderRadius:'10px', padding:'16px' }}>
                  <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'4px' }}>Artículos reescritos con IA hoy</div>
                  <div style={{ fontSize:'28px', fontWeight:'900', color:'#818cf8' }}>{data?.hoy.ai ?? '—'}</div>
                </div>
                <div style={{ background:'#111827', borderRadius:'10px', padding:'16px' }}>
                  <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'4px' }}>Costo estimado hoy</div>
                  <div style={{ fontSize:'28px', fontWeight:'900', color:'#22c55e' }}>${data ? (data.hoy.costoUSD).toFixed(4) : '—'}</div>
                  <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'2px' }}>Haiku: ~800 tok input + 500 tok output por artículo</div>
                </div>
                <div style={{ background:'#111827', borderRadius:'10px', padding:'16px' }}>
                  <div style={{ fontSize:'11px', color:'#6b7280', marginBottom:'4px' }}>Costo estimado este mes</div>
                  <div style={{ fontSize:'28px', fontWeight:'900', color:'#22c55e' }}>${costoAnthropicMes.toFixed(3)}</div>
                </div>
                <div style={{ fontSize:'11px', color:'#4b5563', lineHeight:'1.5' }}>
                  ⚠️ Estimado basado en artículos con etiquetas (IA reescrita). Precio Haiku: $0.80/MTok input · $4/MTok output.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6 — Últimos artículos */}
        <section>
          <div className="card">
            <div className="section-title">📋 Últimos 10 artículos publicados</div>
            {data && data.ultimos.length > 0 ? (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid #374151' }}>
                      {['ID','Título','Fuente','Fecha/Hora','Categoría','IA'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'8px 10px', color:'#6b7280', fontWeight:'600', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.ultimos.map(a => (
                      <tr key={a.id} style={{ borderBottom:'1px solid #1f2937', cursor:'default' }}>
                        <td style={{ padding:'8px 10px', color:'#6b7280' }}>#{a.id}</td>
                        <td style={{ padding:'8px 10px', color:'#e5e7eb', maxWidth:'280px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.titulo}</td>
                        <td style={{ padding:'8px 10px', color:'#9ca3af', whiteSpace:'nowrap' }}>{a.fuente}</td>
                        <td style={{ padding:'8px 10px', color:'#9ca3af', whiteSpace:'nowrap' }}>{formatFechaCorta(a.publicado_en)}</td>
                        <td style={{ padding:'8px 10px' }}>
                          <span className="tag" style={{ background:'#1e293b', color:'#94a3b8' }}>{a.categoria}</span>
                        </td>
                        <td style={{ padding:'8px 10px' }}>
                          <span className="tag" style={{ background: a.ai ? '#1e1b4b' : '#1c1400', color: a.ai ? '#818cf8' : '#f59e0b' }}>
                            {a.ai ? '🤖 IA' : '📄 fallback'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ color:'#6b7280', fontSize:'13px' }}>{data ? 'Sin artículos' : 'Cargando...'}</div>
            )}
          </div>
        </section>

        {/* SECCIÓN 7 — Resumen del día */}
        <section>
          <div className="section-title">📅 Resumen del día</div>
          <div className="grid-3">
            <div className="card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'40px', fontWeight:'900', color:'#818cf8' }}>{data?.hoy.total ?? '—'}</div>
              <div style={{ fontSize:'13px', color:'#9ca3af', marginTop:'4px' }}>Artículos publicados hoy</div>
              {data && <div style={{ fontSize:'11px', color: diffArticulos >= 0 ? '#22c55e' : '#ef4444', marginTop:'6px', fontWeight:'700' }}>
                {diffArticulos >= 0 ? `+${diffArticulos}` : diffArticulos} vs ayer
              </div>}
            </div>
            <div className="card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'40px', fontWeight:'900', color:'#22c55e' }}>${data ? (data.hoy.costoUSD).toFixed(4) : '—'}</div>
              <div style={{ fontSize:'13px', color:'#9ca3af', marginTop:'4px' }}>Costo estimado hoy</div>
              <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'6px' }}>Solo Anthropic API</div>
            </div>
            <div className="card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'40px', fontWeight:'900', color: data?.hoy.fallback > 0 ? '#f59e0b' : '#22c55e' }}>
                {data ? `${data.hoy.ai}/${data.hoy.total}` : '—'}
              </div>
              <div style={{ fontSize:'13px', color:'#9ca3af', marginTop:'4px' }}>Artículos reescritos con IA</div>
              <div style={{ fontSize:'11px', color: data?.hoy.fallback > 0 ? '#f59e0b' : '#22c55e', marginTop:'6px', fontWeight:'700' }}>
                {data?.hoy.fallback > 0 ? `⚠️ ${data.hoy.fallback} en fallback` : '✅ Sin fallbacks'}
              </div>
            </div>
          </div>
        </section>

        <footer style={{ textAlign:'center', fontSize:'11px', color:'#4b5563', paddingTop:'8px', borderTop:'1px solid #1f2937' }}>
          Dashboard admin · kestapasando.com · Datos en tiempo real desde Supabase · Auto-refresh cada 60 seg
        </footer>
      </div>
    </div>
  )
}
