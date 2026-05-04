import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getArticulos } from '../lib/db'
import { formatFechaCorta } from '../lib/fecha'
import EmojiReacciones from '../components/EmojiReacciones'
import AdSlot from '../components/AdSlot'
import { useState, useEffect, useRef } from 'react'

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
    const t = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  if (!ahora) return null
  const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const d = ahora
  const hh = String(d.getHours()).padStart(2,'0')
  const mm = String(d.getMinutes()).padStart(2,'0')
  const ss = String(d.getSeconds()).padStart(2,'0')
  return (
    <div className="reloj-fecha">
      <span style={{ textTransform:'capitalize' }}>{dias[d.getDay()]} {d.getDate()} de {meses[d.getMonth()]} {d.getFullYear()}</span>
      <span style={{ background:'rgba(255,255,255,0.2)', padding:'2px 10px', borderRadius:'20px', fontWeight:'700', letterSpacing:'1px', fontVariantNumeric:'tabular-nums' }}>
        {hh}:{mm}:{ss}
      </span>
    </div>
  )
}

function FotoNoticia({ imagenes, categoria, titulo, altura, eager }) {
  const c = COLORES[categoria] || COLORES.internacional
  const [error, setError] = useState(false)
  const img = imagenes && imagenes.length > 0 ? imagenes[0] : null
  if (img && !error) {
    return (
      <div style={{ width:'100%', height: altura || '200px', overflow:'hidden', borderRadius:'10px 10px 0 0', background:'#e5e7eb' }}>
        <img
          src={`/api/img?url=${encodeURIComponent(img)}`}
          alt={titulo}
          width="600" height={parseInt(altura)||200}
          loading={eager ? 'eager' : 'lazy'}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          onError={() => setError(true)}
        />
      </div>
    )
  }
  return (
    <div style={{ width:'100%', height: altura || '200px', background:`linear-gradient(135deg,${c.bg},${c.acento}22)`, borderRadius:'10px 10px 0 0', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:'11px', color:c.text, opacity:0.5, fontWeight:'600' }}>sin imagen</span>
    </div>
  )
}

/* ── Hero card (noticia principal en mobile) ──────────────────────────────── */
function HeroNoticia({ art }) {
  const c = COLORES[art.categoria] || COLORES.internacional
  const img = art.imagenes && art.imagenes.length > 0 ? art.imagenes[0] : null
  return (
    <Link href={`/${art.slug}`} style={{ textDecoration:'none', display:'block' }}>
      <div className="hero-card" style={{ position:'relative', borderRadius:'12px', overflow:'hidden', background:c.bg, boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
        {/* Imagen 16:9 */}
        <div style={{ width:'100%', aspectRatio:'16/9', overflow:'hidden', background:'#e5e7eb' }}>
          {img ? (
            <img
              src={`/api/img?url=${encodeURIComponent(img)}`}
              alt={art.titulo_reescrito}
              width="800" height="450"
              loading="eager"
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            />
          ) : (
            <div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg,${c.bg},${c.acento}33)` }}/>
          )}
        </div>
        {/* Overlay con texto */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)', padding:'32px 16px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
            <span style={{ fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'20px', textTransform:'uppercase', background:c.acento, color:'white' }}>
              {art.categoria}
            </span>
            <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.7)' }}>
              {formatFechaCorta(art.publicado_en || art.creado_en)}
            </span>
          </div>
          <h2 style={{ fontSize:'20px', fontWeight:'900', color:'white', lineHeight:'1.25', margin:'0 0 4px', textShadow:'0 1px 3px rgba(0,0,0,0.5)' }}>
            {art.titulo_reescrito}
          </h2>
          <span style={{ fontSize:'12px', fontWeight:'700', color:'rgba(255,255,255,0.8)' }}>Leer más →</span>
        </div>
      </div>
    </Link>
  )
}

/* ── Card compacta mobile (imagen izquierda, texto derecha) ───────────────── */
function TarjetaCompacta({ art }) {
  const c = COLORES[art.categoria] || COLORES.internacional
  const img = art.imagenes && art.imagenes.length > 0 ? art.imagenes[0] : null
  return (
    <Link href={`/${art.slug}`} style={{ textDecoration:'none', display:'block' }}>
      <div className="tarjeta-compacta" style={{ display:'flex', gap:'10px', background:'white', borderRadius:'10px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
        {/* Imagen 40% */}
        <div style={{ flexShrink:0, width:'40%', minHeight:'90px', maxHeight:'110px', overflow:'hidden', background:'#e5e7eb', borderRadius:'10px 0 0 10px' }}>
          {img ? (
            <img
              src={`/api/img?url=${encodeURIComponent(img)}`}
              alt={art.titulo_reescrito}
              width="160" height="110"
              loading="lazy"
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            />
          ) : (
            <div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg,${c.bg},${c.acento}22)` }}/>
          )}
        </div>
        {/* Texto 60% */}
        <div style={{ flex:1, padding:'10px 12px 10px 0', display:'flex', flexDirection:'column', justifyContent:'space-between', minWidth:0 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px' }}>
              <span style={{ fontSize:'9px', fontWeight:'700', padding:'1px 6px', borderRadius:'20px', textTransform:'uppercase', background:c.bg, color:c.text, flexShrink:0 }}>
                {art.categoria}
              </span>
              <span style={{ fontSize:'9px', color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {formatFechaCorta(art.publicado_en || art.creado_en)}
              </span>
            </div>
            <h3 style={{ fontSize:'14px', fontWeight:'800', color:'#111827', lineHeight:'1.3', margin:0, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {art.titulo_reescrito}
            </h3>
          </div>
          <span style={{ fontSize:'11px', fontWeight:'700', color:c.acento, marginTop:'6px', display:'block' }}>Leer →</span>
        </div>
      </div>
    </Link>
  )
}

/* ── Tarjeta normal para desktop ──────────────────────────────────────────── */
function TarjetaNoticia({ art, altura }) {
  const c = COLORES[art.categoria] || COLORES.internacional
  return (
    <Link href={`/${art.slug}`} style={{ textDecoration:'none', display:'block', height:'100%' }}>
      <div className="tarjeta" style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', height:'100%', display:'flex', flexDirection:'column', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
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
          <EmojiReacciones
            articuloId={art.id}
            contadoresIniciales={{
              reaccion_fuego:    art.reaccion_fuego    || 0,
              reaccion_risa:     art.reaccion_risa     || 0,
              reaccion_sorpresa: art.reaccion_sorpresa || 0,
              reaccion_enojo:    art.reaccion_enojo    || 0,
              reaccion_calavera: art.reaccion_calavera || 0,
            }}
          />
        </div>
      </div>
    </Link>
  )
}

export default function Home({ articulos, categoriaActiva }) {
  const router = useRouter()
  const catRef = useRef(null)

  const cambiarCategoria = (cat) => {
    if (cat === categoriaActiva) router.push('/')
    else router.push(`/?categoria=${cat}`)
  }

  const destacados = articulos.slice(0, 3)
  const resto = articulos.slice(3)

  return (
    <div style={{ minHeight:'100vh', background:'#f8f8f8', fontFamily:'system-ui,sans-serif' }}>
      <Head>
        <title>Kestapasando.com — Las noticias sin rodeos</title>
        <meta name="description" content="Las noticias más cabronas del día en español, sin rodeos y con el estilo que te mereces"/>
      </Head>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .tarjeta { transition:transform 0.2s ease, box-shadow 0.2s ease; animation:fadeIn 0.4s ease forwards; }
        .tarjeta:hover { transform:translateY(-3px); box-shadow:0 10px 30px rgba(0,0,0,0.1) !important; }
        .tarjeta-compacta { transition:box-shadow 0.2s ease; }
        .tarjeta-compacta:hover { box-shadow:0 4px 12px rgba(0,0,0,0.12) !important; }
        .hero-card { transition:transform 0.2s ease; }
        .hero-card:hover { transform:scale(1.01); }
        .cat-btn { font-size:13px; font-weight:600; padding:6px 14px; border-radius:20px; cursor:pointer; border:2px solid transparent; transition:all 0.2s; white-space:nowrap; flex-shrink:0; }
        .cat-btn:hover { opacity:0.85; }
        a { text-decoration:none; }
        /* Desktop grids */
        .grid-top { display:grid; grid-template-columns:2fr 1fr 1fr; gap:14px; margin-bottom:14px; }
        .grid-resto { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        /* Cat scroll */
        .cat-scroll { display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none; padding-bottom:4px; }
        .cat-scroll::-webkit-scrollbar { display:none; }
        /* Reloj */
        .reloj-fecha { display:flex; align-items:center; gap:16px; font-size:12px; color:rgba(255,255,255,0.7); }
        .topbar { padding:8px 32px; }
        .header-main { padding:16px 32px 14px; }
        .logo-text { font-size:26px; }
        /* Ad slot wrapper */
        .ad-wrapper { display:flex; justify-content:center; margin:16px 0; }
        /* Mobile layout */
        .mobile-feed { display:none; }
        .desktop-feed { display:block; }

        @media(max-width:900px) {
          .grid-top { grid-template-columns:1fr 1fr; }
          .grid-resto { grid-template-columns:repeat(2,1fr); }
        }
        @media(max-width:768px) {
          .desktop-feed { display:none; }
          .mobile-feed { display:block; }
          .topbar { padding:6px 12px; }
          .header-main { padding:10px 12px 0; }
          .logo-text { font-size:20px; }
          .reloj-fecha { flex-wrap:wrap; gap:4px; font-size:11px; }
          .cat-btn { font-size:12px; padding:5px 12px; }
        }
        @media(max-width:480px) {
          .logo-text { font-size:18px; }
        }
      `}</style>

      {/* Top bar */}
      <div className="topbar" style={{ background:'#1e1b4b' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <RelojFecha/>
        </div>
      </div>

      {/* Header */}
      <header className="header-main" style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#4338ca)' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <Link href="/">
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px', cursor:'pointer' }}>
              <div style={{ width:'42px', height:'54px', background:'rgba(255,255,255,0.15)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'1px solid rgba(255,255,255,0.25)' }}>
                <span style={{ fontSize:'18px', fontWeight:'900', color:'white' }}>?!</span>
              </div>
              <div>
                <div className="logo-text" style={{ fontWeight:'900', color:'white', letterSpacing:'-0.5px', lineHeight:1 }}>Kestapasando.com</div>
                <div style={{ width:'140px', height:'2px', background:'linear-gradient(90deg,#818cf8,#ec4899,#f59e0b)', borderRadius:'2px', marginTop:'4px' }}/>
              </div>
            </div>
          </Link>
          {/* Categories — horizontal scroll on mobile */}
          <div className="cat-scroll" style={{ paddingBottom:'12px' }}>
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

      <main style={{ maxWidth:'1200px', margin:'0 auto', padding:'16px 12px' }}>
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

            {/* ═══ MOBILE FEED ═══ */}
            <div className="mobile-feed">
              {/* Hero — noticia principal */}
              {!categoriaActiva && articulos.length > 0 && (
                <div style={{ marginBottom:'12px' }}>
                  <HeroNoticia art={articulos[0]}/>
                </div>
              )}

              {/* Ad slot — banner 320x50 después del hero */}
              <div className="ad-wrapper" style={{ marginBottom:'12px' }}>
                <AdSlot size="banner"/>
              </div>

              {/* Lista compacta con anuncios cada 4 noticias */}
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {(categoriaActiva ? articulos : articulos.slice(1)).map((art, i) => (
                  <div key={art.id}>
                    <TarjetaCompacta art={art}/>
                    {/* Anuncio 300x250 cada 4 noticias */}
                    {(i + 1) % 4 === 0 && (
                      <div className="ad-wrapper" style={{ margin:'12px 0' }}>
                        <AdSlot size="rectangle"/>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ DESKTOP FEED ═══ */}
            <div className="desktop-feed">
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
            </div>
          </>
        )}
      </main>

      <footer style={{ textAlign:'center', padding:'20px 16px', fontSize:'12px', color:'#94a3b8', borderTop:'1px solid #e5e7eb', marginTop:'20px' }}>
        <div>Kestapasando.com · Actualizado cada hora</div>
        <div style={{ marginTop:'8px', display:'flex', justifyContent:'center', gap:'16px', flexWrap:'wrap' }}>
          <Link href="/acerca-de" style={{ color:'#94a3b8', textDecoration:'underline' }}>Acerca de</Link>
          <Link href="/privacidad" style={{ color:'#94a3b8', textDecoration:'underline' }}>Privacidad</Link>
          <Link href="/terminos" style={{ color:'#94a3b8', textDecoration:'underline' }}>Términos</Link>
          <Link href="/contacto" style={{ color:'#94a3b8', textDecoration:'underline' }}>Contacto</Link>
        </div>
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
