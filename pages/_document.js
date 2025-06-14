import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/elasticsearch-icon.svg" />
        <link rel="icon" type="image/png" href="/elasticsearch-icon.png" />
        <meta name="description" content="Elasticsearch Query Compare Tool" />
        <meta name="theme-color" content="#1a73e8" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 