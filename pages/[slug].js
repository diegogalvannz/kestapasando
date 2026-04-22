import Head from 'next/head'
import Link from 'next/link'
import { getArticuloPorSlug, getArticulos } from '../lib/db'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState, useEffect } from 'react'

const COLORES = {
  mexico:          { bg:'#FEE2E2', text:'#991B1B', acento:'#DC2626' },
  politica:        { bg:'#EDE9FE', text:'#4C1D95', acento:'#7C3AED' },
  tecnologia:      { bg:'#DBEAFE', text:'#1E3A8A', acento:'#2563EB' },
  deportes:        { bg:'#DCFCE7', text:'#14532D', acento:'#16A34A' },
  entretenimiento: { bg:'#FEF9C3', text:'#713F12', acento:'#D97706' },
  internacional:   { bg:'#FFE4E6', text:'#9F1239', acento:'#E11D48' },
}

function CarruselImagenes({ imagenes, fuente_nombre, fuente_url, acento }) {
  const [actual, setActual] = useState(0)
  const imgs = (imagenes || []).filter(Boolean)
  if (!imgs.length) return null

  return (
    <div style={{ marginBottom:'32px' }}>
      <div style={{ position:'relative', borderRadius:'14px', overflow:'hidden', background:'#f1f5f9' }}>
        <img
          src={`/api/img?url=${encodeURIComponent(imgs[actual])}`}
          alt=""
          style={{ width:'100%', maxHeight:'480px', objectFit:'cover', display:'block', animation:'fadeIn 0.4s ease' }}
          onError={(e) => { e.target.parentElement.style.display='none' }}
        />
        {imgs.length > 1 && (
          <>
            <button onClick={() => setActual(a => (a - 1 + imgs.length) % imgs.length)}
              style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.55)', color:'white', border:'none', borderRadius:'50%', width:'38px', height:'38px', fontSize:'20px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              ‹
            </button>
            <button onClick={() => setActual(a => (a + 1) % imgs.length)}
              style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.55)', color:'white', border:'none', borderRadius:'50%', width:'38px', height:'38px', fontSize:'20px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              ›
            </button>
          </>
        )}
        {imgs.length > 1 && (
          <div style={{ position:'absolute', bottom:'12px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'6px' }}>
            {imgs.map((_, i) => (
              <div key={i} onClick={() => setActual(i)}
                style={{ width:'8px', height:'8px', borderRadius:'50%', background: i === actual ? 'white' : 'rgba(255,255,255,0.5)', cursor:'pointer', transition:'all 0.2s' }}/>
            ))}
          </div>
        )}
      </div>
      <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'6px', textAlign:'right' }}>
        Foto: {fuente_url
          ? <a href={fuente_url} target="_blank" rel="noopener noreferrer" style={{ color:acento }}>{fuente_nombre}</a>
          : fuente_nombre}
        {imgs.length > 1 && ` · ${actual + 1}/${imgs.length}`}
      </div>
      {imgs.length > 1 && (
        <div style={{ display:'flex', gap:'8px', marginTop:'10px', overflowX:'auto', paddingBottom:'4px' }}>
          {imgs.map((img, i) => (
            <div key={i} onClick={() => setActual(i)}
              style={{ flexShrink:0, width:'72px', height:'52px', borderRadius:'8px', overflow:'hidden', cursor:'pointer', border:`2px solid ${i === actual ? acento : 'transparent'}`, transition:'all 0.2s' }}>
              <img src={`/api/img?url=${encodeURIComponent(img)}`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={(e) => { e.target.parentElement.style.display='none' }}/>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TarjetaRelacionada({ art }) {
  const c = COLORES[art.categoria] || COLORES.internacional
  return (
    <Link href={`/${art.slug}`} style={{ textDecoration:'none', display:'block' }}>
      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', transition:'transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
        {art.imagenes && art.imagenes.length > 0 ? (
          <div style={{ height:'130px', overflow:'hidden', background:'#f1f5f9' }}>
            <img
              src={`/api/img?url=${encodeURIComponent(art.imagenes[0])}`}
              alt=""
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
              onError={(e) => { e.target.parentElement.style.background = c.bg }}
            />
          </div>
        ) : (
          <div style={{ height:'130px', background:`linear-gradient(135deg,${c.bg},${c.acento}22)` }}/>
        )}
        <div style={{ padding:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
            <span style={{ fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'20px', textTransform:'uppercase', background:c.bg, color:c.text }}>
              {art.categoria}
            </span>
            <span style={{ fontSize:'10px', color:'#9ca3af' }}>
              {art.publicado_en ? format(new Date(art.publicado_en), "d MMM", { locale:es }) : ''}
            </span>
          </div>
          <p style={{ fontSize:'13px', fontWeight:'700', color:'#111827', lineHeight:'1.35', margin:'0 0 6px' }}>
            {art.titulo_reescrito}
          </p>
          <span style={{ fontSize:'11px', fontWeight:'700', color:c.acento }}>Leer →</span>
        </div>
      </div>
    </Link>
  )
}

const REACCIONES = [
  { emoji: '🔥', label: 'En llamas' },
  { emoji: '😂', label: 'Me cagué' },
  { emoji: '😤', label: 'Me enojé' },
  { emoji: '😱', label: 'Me sorprendió' },
  { emoji: '🤔', label: 'Hmm' },
]

function SeccionEmojis({ slug }) {
  const key = `reacciones_${slug}`
  const [contadores, setContadores] = useState(() => {
    if (typeof window === 'undefined') return REACCIONES.map(() => 0)
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null')
      return saved || REACCIONES.map(() => 0)
    } catch { return REACCIONES.map(() => 0) }
  })

  const reaccionar = (i) => {
    setContadores(prev => {
      const nuevo = [...prev]
      nuevo[i] = (nuevo[i] || 0) + 1
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(nuevo))
      }
      return nuevo
    })
  }

  return (
    <div style={{ marginTop:'32px', padding:'20px', background:'#fff', borderRadius:'14px', border:'1px solid #e5e7eb' }}>
      <p style={{ margin:'0 0 14px', fontSize:'13px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'1px' }}>
        ¿Cómo te dejó esta nota?
      </p>
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
        {REACCIONES.map((r, i) => (
          <button key={r.emoji} onClick={() => reaccionar(i)}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', background:'#f8fafc', border:'2px solid #e5e7eb', borderRadius:'12px', padding:'10px 14px', cursor:'pointer', transition:'all 0.15s', minWidth:'64px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.background='#eef2ff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.background='#f8fafc' }}>
            <span style={{ fontSize:'26px', lineHeight:1 }}>{r.emoji}</span>
            <span style={{ fontSize:'11px', fontWeight:'700', color:'#6366f1' }}>{contadores[i] || 0}</span>
            <span style={{ fontSize:'10px', color:'#9ca3af' }}>{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function resaltarPalabras(texto) {
  if (!texto) return texto
  // Resaltar: palabras en mayúscula (sustantivos propios), números con contexto
  const partes = []
  let i = 0
  const re = /\b([A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]{2,}(?:\s+[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]{2,})*|\d{1,3}(?:[,\.]\d{3})*(?:\.\d+)?(?:\s*(?:mil|millones?|billones?|%|pesos?|dólares?|mdd))?)\b/g
  let match
  while ((match = re.exec(texto)) !== null) {
    if (match.index > i) partes.push(texto.slice(i, match.index))
    partes.push(
      <mark key={match.index} style={{ background:'#FFE500', borderRadius:'3px', padding:'0 2px', fontWeight:'inherit' }}>
        {match[0]}
      </mark>
    )
    i = match.index + match[0].length
  }
  if (i < texto.length) partes.push(texto.slice(i))
  return partes.length > 0 ? partes : texto
}

export default function Articulo({ articulo, relacionados }) {
  if (!articulo) {
    return (
      <div style={{ minHeight:'100vh', background:'#f8f9ff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui' }}>
        <p style={{ color:'#94a3b8' }}>Artículo no encontrado.</p>
      </div>
    )
  }

  const c = COLORES[articulo.categoria] || COLORES.internacional

  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:'system-ui,sans-serif' }}>
      <Head>
        <title>{articulo.titulo_reescrito} | ¿Qué chingados está pasando?</title>
        <meta name="description" content={articulo.resumen}/>
      </Head>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .contenido p { margin-bottom:1.3rem; line-height:1.85; color:#374151; font-size:17px; text-align:justify; }
        a { text-decoration:none; }
        .header-slug { padding:16px 32px; }
        .logo-text-slug { font-size:24px; }
        .titulo-articulo { font-size:32px; }
        .grid-relacionados { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        @media(max-width:900px) { .grid-relacionados { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:600px) {
          .header-slug { padding:12px 16px; }
          .logo-text-slug { font-size:20px; }
          .titulo-articulo { font-size:24px; }
          .grid-relacionados { grid-template-columns:repeat(2,1fr); }
          .contenido p { font-size:16px; }
        }
        @media(max-width:400px) { .grid-relacionados { grid-template-columns:1fr; } }
      `}</style>

      <header className="header-slug" style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#4338ca)' }}>
        <Link href="/">
          <div style={{ display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }}>
            <div style={{ width:'38px', height:'50px', background:'rgba(255,255,255,0.15)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.25)' }}>
              <span style={{ fontSize:'16px', fontWeight:'900', color:'white' }}>?!</span>
            </div>
            <div>
              <div className="logo-text-slug" style={{ fontWeight:'900', color:'white', letterSpacing:'-0.5px', lineHeight:1 }}>Kestapasando.com</div>
              <div style={{ width:'120px', height:'2px', background:'linear-gradient(90deg,#818cf8,#ec4899,#f59e0b)', borderRadius:'2px', marginTop:'3px' }}/>
            </div>
          </div>
        </Link>
      </header>

      <main style={{ maxWidth:'800px', margin:'0 auto', padding:'32px 20px', animation:'fadeIn 0.5s ease' }}>

        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
          <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 12px', borderRadius:'20px', textTransform:'uppercase', letterSpacing:'0.5px', background:c.bg, color:c.text }}>
            {articulo.categoria}
          </span>
          <span style={{ fontSize:'12px', color:'#9ca3af' }}>
            {articulo.publicado_en ? format(new Date(articulo.publicado_en), "d 'de' MMMM yyyy · HH:mm", { locale:es }) : ''}
          </span>
        </div>

        <h1 className="titulo-articulo" style={{ fontWeight:'900', color:'#111827', lineHeight:'1.25', marginBottom:'16px' }}>
          {articulo.titulo_reescrito}
        </h1>

        <div style={{ background:c.bg, borderLeft:`4px solid ${c.acento}`, padding:'16px 20px', borderRadius:'0 12px 12px 0', marginBottom:'28px' }}>
          <p style={{ margin:0, fontSize:'16px', color:c.text, lineHeight:'1.6', fontWeight:'500' }}>
            {articulo.resumen}
          </p>
        </div>

        <CarruselImagenes
          imagenes={articulo.imagenes}
          fuente_nombre={articulo.fuente_nombre}
          fuente_url={articulo.fuente_url}
          acento={c.acento}
        />

        <div className="contenido">
          {articulo.cuerpo && articulo.cuerpo.split('\n').map((parrafo, i) => (
            parrafo.trim() ? <p key={i}>{resaltarPalabras(parrafo)}</p> : null
          ))}
        </div>

        <SeccionEmojis slug={articulo.slug} />

        <div style={{ marginTop:'32px', paddingTop:'20px', borderTop:'1px solid #e5e7eb' }}>
          <Link href="/" style={{ fontSize:'14px', fontWeight:'700', color:c.acento }}>
            ← Volver al inicio
          </Link>
        </div>

      </main>

      {relacionados && relacionados.length > 0 && (
        <div style={{ background:'#f1f5f9', borderTop:'2px solid #e5e7eb', padding:'32px 20px 40px' }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
              <div style={{ width:'4px', height:'24px', background:`linear-gradient(180deg,${c.acento},#818cf8)`, borderRadius:'2px' }}/>
              <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#111827', margin:0 }}>
                También te puede interesar
              </h3>
            </div>
            <div className="grid-relacionados">
              {relacionados.map(art => (
                <TarjetaRelacionada key={art.id} art={art}/>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer style={{ textAlign:'center', padding:'20px', fontSize:'12px', color:'#94a3b8', borderTop:'1px solid #e5e7eb' }}>
        ¿Qué chingados está pasando? · Actualizado cada hora
      </footer>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const articulo = await getArticuloPorSlug(params.slug)
    if (!articulo) return { props: { articulo: null, relacionados: [] } }

    const todos = await getArticulos(20, 0, null)
    const relacionados = todos
      .filter(a => a.slug !== params.slug)
      .sort((a, b) => {
        if (a.categoria === articulo.categoria && b.categoria !== articulo.categoria) return -1
        if (b.categoria === articulo.categoria && a.categoria !== articulo.categoria) return 1
        return 0
      })
      .slice(0, 4)

    return {
      props: {
        articulo: JSON.parse(JSON.stringify(articulo)),
        relacionados: JSON.parse(JSON.stringify(relacionados))
      }
    }
  } catch (error) {
    return { props: { articulo: null, relacionados: [] } }
  }
}