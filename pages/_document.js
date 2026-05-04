import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Ezoic — Privacy & CMP (must load first) */}
        <script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js" />
        <script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js" />
        {/* Ezoic — Main script */}
        <script async src="//www.ezojs.com/ezoic/sa.min.js" />
        {/* Ezoic — Standalone init */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ezstandalone = window.ezstandalone || {}; ezstandalone.cmd = ezstandalone.cmd || [];`
          }}
        />
        {/* Ezoic — Analytics */}
        <script src="//ezoicanalytics.com/analytics.js" />
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
