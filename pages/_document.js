import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2109569967612217"
          crossOrigin="anonymous"
        />
        {/* SEO & AdSense quality signals */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta property="og:site_name" content="Kestapasando.com" />
        <meta name="language" content="Spanish" />
        <meta name="geo.region" content="MX" />
        <meta name="geo.country" content="Mexico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
