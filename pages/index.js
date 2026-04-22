import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getArticulos } from '../lib/db'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatFechaCorta } from '../lib/fecha'
import { useState, useEffect } from 'react'

const COLORES = {
  mexico:          { bg:'#FEE2E2', text:'#991B1B', acento:'#DC2626' },
  politica:        { bg:'#EDE9FE', text:'#4C1D95', acento:'#7C3AED' },
  tecnologia:      { bg:'#DBEAFE', text:'#1E3A8A', acento:'#2563EB' },
  deportes:        { bg:'#DCFCE7', text:'#14532D', acento:'#16A34A' },
  entretenimiento: { bg:'#FEF9C3', text:'#713F12', acento:'#D97706' },
  internacional:   { bg:'#FFE4E6', text:'#9F1239', acento:'#E11D48' },
}

function RelojFecha() {
  const [ahora, setAhora] = useState(null)
  useEffect(() => {
    setAhora(new Date())
    const interval = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  if (!ahora) return null
  return (
    <div className="reloj-fecha">
      <span style={{ textTransform:'capitalize' }}>{format(ahora, "EEEE d 'de' MMMM yyyy", { locale:es })}</span>
      <span style={{ background:'rgba(255,255,255,0.2)', padding:'2px 10px', borderRadius:'20px', fontWeight:'700', letterSpacing:'1px', fontVariantNumeric:'tabular-nums' }}>
        {format(ahora, 'HH:mm:ss')}
      </span>
    </div>
  )
}

function FotoNoticia({ imagenes, categoria, titulo, altura }) {
  const c = COLORES[categoria] || COLORES.internacional
  const [error, setError] = useState(false)
  const img = imagenes && imagenes.length > 0 ? imagenes[0] : null

  if (img && !error) {
    return (
      <div style={{ width:'100%', height: altura || '200px', overflow:'hidden', borderRadius:'10px 10px 0 0', background:'#f1f5f9' }}>
        <img
          src={`/api/img?url=${encodeURIComponent(img)}`}
          alt={titulo}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          onError={() => setError(true)}
        />
      </div>
    )
  }

  return (
    <div style={{ width:'100%', height: altura || '200px', background:`linear-gradient(135deg, ${c.bg}, ${c.acento}22)`, borderRadius:'10px 10px 0 0', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:'11px', color:c.text, opacity:0.5, fontWeight:'600' }}>sin imagen</span>
    </div>
  )
}

function TarjetaNoticia({ art, altura }) {
  const c = COLORES[art.categoria] || COLORES.internacional
  return (
    <Link href={`/${art.slug}`} style={{ textDecoration:'none', display:'block', height:'100%' }}>
      <div className="tarjeta" style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', height:'100%', display:'flex', flexDirection:'column' }}>
        <FotoNoticia imagenes={art.imagenes} categoria={art.categoria} titulo={art.titulo_reescrito} altura={altura}/>
        <div style={{ padding:'12px', flex:1, display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
            <span style={{ fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'20px', textTransform:'uppercase', background:c.bg, color:c.text }}>
              {art.categoria}
            </span>
            <span style={{ fontSize:'10px', color:'#9ca3af' }}>
              {formatFechaCorta(art.publicado_en || art.creado_en)}
            </span>
          </div>
          <h2 style={{ fontSize: altura === '240px' ? '17px' : '14px', fontWeight:'800', color:'#111827', lineHeight:'1.3', marginBottom:'6px' }}>
            {art.titulo_reescrito}
          </h2>
          <p style={{ fontSize:'12px', color:'#6b7280', lineHeight:'1.5', margin:'0 0 8px', flex:1, display:'-webkit-box', WebkitLineClamp: altura === '240px' ? 3 : 2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {art.resumen}
          </p>
          <span style={{ fontSize:'11px', fontWeight:'700', color:c.acento }}>Leer más →</span>
        </div>
      </div>
    </Link>
  )
}

export default function Home({ articulos, categoriaActiva }) {
  const router = useRouter()

  const cambiarCategoria = (cat) => {
    if (cat === categoriaActiva) router.push('/')
    else router.push(`/?categoria=${cat}`)
  }

  const destacados = articulos.slice(0, 3)
  const resto = articulos.slice(3)

  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:'system-ui,sans-serif' }}>
      <Head>
        <title>¿Qué chingados está pasando?</title>
        <meta name="description" content="Las noticias sin rodeos"/>
      </Head>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .tarjeta { transition:transform 0.2s ease, box-shadow 0.2s ease; animation:fadeIn 0.4s ease forwards; }
        .tarjeta:hover { transform:translateY(-3px); box-shadow:0 10px 30px rgba(0,0,0,0.1); }
        .cat-btn { font-size:12px; font-weight:600; padding:6px 16px; border-radius:20px; cursor:pointer; border:2px solid transparent; transition:all 0.2s; }
        .cat-btn:hover { opacity:0.85; transform:scale(1.03); }
        a { text-decoration:none; }
        .grid-top { display:grid; grid-template-columns:2fr 1fr 1fr; gap:14px; margin-bottom:14px; }
        .grid-resto { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        .reloj-fecha { display:flex; align-items:center; gap:16px; font-size:12px; color:rgba(255,255,255,0.7); }
        .topbar { padding:8px 32px; }
        .header-main { padding:16px 32px 20px; }
        .logo-text { font-size:26px; }
        @media(max-width:900px) {
          .grid-top { grid-template-columns:1fr 1fr; }
          .grid-resto { grid-template-columns:repeat(2,1fr); }
        }
        @media(max-width:600px) {
          .grid-top { grid-template-columns:1fr; }
          .grid-resto { grid-template-columns:1fr; }
        }
        @media(max-width:480px) {
          .topbar { padding:6px 16px; }
          .header-main { padding:12px 16px 16px; }
          .logo-text { font-size:20px; }
          .reloj-fecha { flex-wrap:wrap; gap:6px; }
        }
      `}</style>

      <div className="topbar" style={{ background:'#1e1b4b' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <RelojFecha/>
        </div>
      </div>

      <header className="header-main" style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#4338ca)' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <Link href="/">
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px', cursor:'pointer' }}>
              <div style={{ width:'42px', height:'54px', background:'rgba(255,255,255,0.15)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'1px solid rgba(255,255,255,0.25)' }}>
                <span style={{ fontSize:'18px', fontWeight:'900', color:'white' }}>?!</span>
              </div>
              <div>
                <div className="logo-text" style={{ fontWeight:'900', color:'white', letterSpacing:'-0.5px', lineHeight:1 }}>Kestapasando.com</div>
                <div style={{ width:'140px', height:'2px', background:'linear-gradient(90deg,#818cf8,#ec4899,#f59e0b)', borderRadius:'2px', marginTop:'4px' }}/>
              </div>
            </div>
          </Link>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <button className="cat-btn"
              style={{ background:!categoriaActiva ? 'white' : 'rgba(255,255,255,0.15)', color:!categoriaActiva ? '#1e1b4b' : 'white' }}
              onClick={() => router.push('/')}>
              Todo
            </button>
            {Object.entries(COLORES).map(([cat, c]) => (
              <button key={cat} className="cat-btn"
                style={{ background: categoriaActiva === cat ? c.acento : c.bg, color: categoriaActiva === cat ? 'white' : c.text }}
                onClick={() => cambiarCategoria(cat)}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth:'1200px', margin:'0 auto', padding:'20px 16px' }}>
        {articulos.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <p style={{ color:'#94a3b8', fontSize:'16px' }}>
              {categoriaActiva ? `No hay noticias de ${categoriaActiva} todavía.` : 'Recolectando noticias...'}
            </p>
            {categoriaActiva && <Link href="/" style={{ color:'#6366f1', fontWeight:'700' }}>← Ver todas</Link>}
          </div>
        ) : (
          <>
            <div style={{ fontSize:'11px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'12px' }}>
              {categoriaActiva ? `Noticias de ${categoriaActiva}` : 'Lo más reciente'}
            </div>

            {!categoriaActiva && destacados.length > 0 && (
              <div className="grid-top" style={{ marginBottom:'14px' }}>
                {destacados.map((art, i) => (
                  <TarjetaNoticia key={art.id} art={art} altura={i === 0 ? '240px' : '180px'}/>
                ))}
              </div>
            )}

            {resto.length > 0 && (
              <>
                {!categoriaActiva && (
                  <div style={{ fontSize:'11px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'2px', margin:'4px 0 12px' }}>
                    Más noticias
                  </div>
                )}
                <div className="grid-resto">
                  {(categoriaActiva ? articulos : resto).map(art => (
                    <TarjetaNoticia key={art.id} art={art} altura='160px'/>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <footer style={{ textAlign:'center', padding:'20px', fontSize:'12px', color:'#94a3b8', borderTop:'1px solid #e5e7eb', marginTop:'20px' }}>
        ¿Qué chingados está pasando? · Actualizado cada hora
      </footer>
    </div>
  )
}

export async function getServerSideProps({ query }) {
  try {
    const categoria = query.categoria || null
    const articulos = await getArticulos(20, 0, categoria)
    return {
      props: {
        articulos: JSON.parse(JSON.stringify(articulos)),
        categoriaActiva: categoria
      }
    }
  } catch (error) {
    return { props: { articulos: [], categoriaActiva: null } }
  }
}