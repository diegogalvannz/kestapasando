import { useState, useEffect } from 'react'

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState('idle') // idle | loading | ok | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    try {
      if (localStorage.getItem('newsletter_suscrito') === 'true') return
      if (sessionStorage.getItem('newsletter_popup_visto') === 'true') return
    } catch {}

    const t = setTimeout(() => {
      setVisible(true)
      try { sessionStorage.setItem('newsletter_popup_visto', 'true') } catch {}
    }, 8000)
    return () => clearTimeout(t)
  }, [])

  const cerrar = () => setVisible(false)

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) cerrar()
  }

  const suscribir = async (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Pon un correo válido, wey')
      setEstado('error')
      return
    }
    setEstado('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setEstado('ok')
        try { localStorage.setItem('newsletter_suscrito', 'true') } catch {}
        setTimeout(() => setVisible(false), 3500)
      } else {
        setEstado('error')
        setErrorMsg(data.error || 'Algo salió mal, intenta de nuevo')
      }
    } catch {
      setEstado('error')
      setErrorMsg('Sin conexión, intenta de nuevo')
    }
  }

  if (!visible) return null

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .nl-input:focus { outline:none; border-color:#6366f1 !important; }
      `}</style>

      <div style={{
        background: 'linear-gradient(145deg,#1e2130,#111827)',
        border: '1px solid #374151',
        borderRadius: '20px',
        maxWidth: '460px',
        width: '100%',
        padding: '36px 32px',
        position: 'relative',
        animation: 'slideUp 0.35s ease',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Close button */}
        <button
          onClick={cerrar}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: '#9ca3af', borderRadius: '50%',
            width: '28px', height: '28px', cursor: 'pointer',
            fontSize: '16px', lineHeight: '1', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>

        {/* Accent bar top */}
        <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg,#6366f1,#ec4899,#f59e0b)', borderRadius: '2px', margin: '0 auto 20px' }}/>

        {estado === 'ok' ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤙</div>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: '0 0 10px' }}>¡Ya quedaste!</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Mañana a las 4:30 AM te llega tu primera dosis de noticias cabronas. No falles. 🔥
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>🔥</div>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '900', margin: '0 0 10px', lineHeight: '1.2' }}>
                ¿Te quedas sin saber qué pasó hoy?
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                Recibe cada mañana las noticias más cabronas del día directo a tu correo. Sin spam, sin mamadas.
              </p>
            </div>

            <form onSubmit={suscribir} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="email"
                className="nl-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                disabled={estado === 'loading'}
                style={{
                  background: '#0f1117',
                  border: `1.5px solid ${estado === 'error' ? '#ef4444' : '#374151'}`,
                  borderRadius: '10px',
                  padding: '13px 16px',
                  color: 'white',
                  fontSize: '15px',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
              />
              {estado === 'error' && errorMsg && (
                <p style={{ color: '#f87171', fontSize: '12px', margin: 0 }}>{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={estado === 'loading'}
                style={{
                  background: estado === 'loading'
                    ? '#4338ca'
                    : 'linear-gradient(135deg,#6366f1,#4338ca)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontWeight: '800',
                  fontSize: '15px',
                  cursor: estado === 'loading' ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: estado === 'loading' ? 0.8 : 1,
                }}
              >
                {estado === 'loading' ? 'Guardando...' : 'Quiero enterarme 🔥'}
              </button>
            </form>

            <p style={{ color: '#4b5563', fontSize: '11px', textAlign: 'center', margin: '12px 0 0' }}>
              Gratis. Te puedes ir cuando quieras.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
