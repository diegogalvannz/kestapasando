/**
 * AdSlot — espacio para anuncio de Google AdSense.
 * size: "banner" (320x50) | "rectangle" (300x250) | "leaderboard" (728x90)
 * Muestra placeholder gris hasta que AdSense cargue el anuncio.
 */
export default function AdSlot({ size = 'rectangle', style = {} }) {
  const dims = {
    banner:      { width: '320px', height: '50px', maxWidth: '100%' },
    rectangle:   { width: '300px', height: '250px', maxWidth: '100%' },
    leaderboard: { width: '728px', height: '90px', maxWidth: '100%' },
  }
  const d = dims[size] || dims.rectangle

  return (
    <div
      className="ad-slot"
      style={{
        width: d.width,
        height: d.height,
        maxWidth: '100%',
        margin: '0 auto',
        background: '#f0f0f0',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      <span style={{ fontSize: '11px', color: '#bbb', fontFamily: 'system-ui', userSelect: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
        Publicidad
      </span>
    </div>
  )
}
