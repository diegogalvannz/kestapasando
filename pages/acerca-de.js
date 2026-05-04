import Head from 'next/head'
import Link from 'next/link'

export default function AcercaDe() {
  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', fontFamily:'system-ui,sans-serif' }}>
      <Head>
        <title>Acerca de Kestapasando.com — Quiénes somos</title>
        <meta name="description" content="Kestapasando.com es un medio digital independiente que informa a los jóvenes mexicanos sobre las noticias más relevantes del día, de forma directa y accesible." />
      </Head>

      <header style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#4338ca)', padding:'16px 24px' }}>
        <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'34px', height:'44px', background:'rgba(255,255,255,0.15)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.25)' }}>
            <span style={{ fontSize:'14px', fontWeight:'900', color:'white' }}>?!</span>
          </div>
          <div>
            <div style={{ fontSize:'20px', fontWeight:'900', color:'white', letterSpacing:'-0.5px', lineHeight:1 }}>Kestapasando.com</div>
            <div style={{ width:'110px', height:'2px', background:'linear-gradient(90deg,#818cf8,#ec4899,#f59e0b)', borderRadius:'2px', marginTop:'3px' }}/>
          </div>
        </Link>
      </header>

      <main style={{ maxWidth:'780px', margin:'0 auto', padding:'40px 20px' }}>
        <h1 style={{ fontSize:'32px', fontWeight:'900', color:'#111827', marginBottom:'8px' }}>¿Quiénes somos?</h1>
        <div style={{ width:'60px', height:'4px', background:'linear-gradient(90deg,#4338ca,#ec4899)', borderRadius:'2px', marginBottom:'32px' }}/>

        <p style={{ fontSize:'17px', lineHeight:'1.8', color:'#374151', marginBottom:'20px' }}>
          <strong>Kestapasando.com</strong> es un medio digital independiente con sede en México, enfocado en informar a los jóvenes mexicanos sobre las noticias más relevantes del país y el mundo. Nuestro objetivo es hacer el periodismo accesible: sin tecnicismos, sin rodeos, sin aburrir.
        </p>

        <p style={{ fontSize:'17px', lineHeight:'1.8', color:'#374151', marginBottom:'20px' }}>
          Cubrimos política, economía, tecnología, deportes, entretenimiento e internacional, siempre con una perspectiva que le habla directamente a la generación que creció con internet. Creemos que estar informado no debería ser aburrido ni difícil.
        </p>

        <h2 style={{ fontSize:'22px', fontWeight:'800', color:'#111827', marginTop:'36px', marginBottom:'12px' }}>Nuestra misión</h2>
        <p style={{ fontSize:'17px', lineHeight:'1.8', color:'#374151', marginBottom:'20px' }}>
          Democratizar el acceso a la información en México. Queremos que cualquier persona, independientemente de su nivel educativo o contexto social, pueda entender qué está pasando en su país y en el mundo, y por qué le importa.
        </p>

        <h2 style={{ fontSize:'22px', fontWeight:'800', color:'#111827', marginTop:'36px', marginBottom:'12px' }}>Nuestro contenido</h2>
        <p style={{ fontSize:'17px', lineHeight:'1.8', color:'#374151', marginBottom:'20px' }}>
          Publicamos noticias de forma constante a lo largo del día, cubriendo los temas más importantes de cada momento. Todo nuestro contenido es editorial y editorial — tomamos las noticias del día y las explicamos con contexto, perspectiva y lenguaje claro.
        </p>

        <h2 style={{ fontSize:'22px', fontWeight:'800', color:'#111827', marginTop:'36px', marginBottom:'12px' }}>Publicidad</h2>
        <p style={{ fontSize:'17px', lineHeight:'1.8', color:'#374151', marginBottom:'20px' }}>
          Kestapasando.com se financia a través de publicidad programática (Google AdSense). Los anuncios que aparecen en el sitio son seleccionados automáticamente y no representan el punto de vista editorial del medio.
        </p>

        <h2 style={{ fontSize:'22px', fontWeight:'800', color:'#111827', marginTop:'36px', marginBottom:'12px' }}>Contacto</h2>
        <p style={{ fontSize:'17px', lineHeight:'1.8', color:'#374151', marginBottom:'8px' }}>
          Para sugerencias, correcciones o colaboraciones:
        </p>
        <p style={{ fontSize:'17px', lineHeight:'1.8', color:'#374151', marginBottom:'32px' }}>
          📧 <a href="mailto:contacto@kestapasando.com" style={{ color:'#4338ca', fontWeight:'700' }}>contacto@kestapasando.com</a>
        </p>

        <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:'24px', display:'flex', gap:'20px', flexWrap:'wrap' }}>
          <Link href="/" style={{ color:'#4338ca', fontWeight:'700', fontSize:'14px' }}>← Volver al inicio</Link>
          <Link href="/privacidad" style={{ color:'#6b7280', fontSize:'14px' }}>Aviso de Privacidad</Link>
          <Link href="/terminos" style={{ color:'#6b7280', fontSize:'14px' }}>Términos de Uso</Link>
          <Link href="/contacto" style={{ color:'#6b7280', fontSize:'14px' }}>Contacto</Link>
        </div>
      </main>

      <footer style={{ textAlign:'center', padding:'20px', fontSize:'12px', color:'#94a3b8', borderTop:'1px solid #e5e7eb' }}>
        Kestapasando.com · Medio digital independiente · México
      </footer>
    </div>
  )
}
