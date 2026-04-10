export default async function handler(req, res) {
  const { url } = req.query
  if (!url) return res.status(400).end()

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.proceso.com.mx',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      }
    })

    if (!response.ok) return res.status(404).end()

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.send(Buffer.from(buffer))
  } catch (error) {
    res.status(500).end()
  }
}