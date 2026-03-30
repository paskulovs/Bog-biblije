import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="sr">
      <Head>
        <link rel="icon" href="/images/favicon.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/css/bootstrap-icons.css" rel="stylesheet" />
        <link href="/css/vegas.min.css" rel="stylesheet" />
        <link href="/css/style.css" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
