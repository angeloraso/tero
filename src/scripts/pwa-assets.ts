const fs = require('fs');
const filePath = './src/index.html';
const faviconsHTML = `
  <!--pwa asset references-->
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon-precomposed.png">
  <!-- iPhone ICON -->
  <link rel="apple-touch-icon" sizes="57x57" href="/assets/apple-touch-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="/assets/apple-touch-icon-60x60.png">
  <!-- iPad ICON-->
  <link rel="apple-touch-icon" sizes="72x72" href="/assets/apple-touch-icon-72x72.png">
  <link rel="apple-touch-icon" sizes="76x76" href="/assets/apple-touch-icon-76x76.png">
  <!-- iPhone (Retina) ICON-->
  <link rel="apple-touch-icon" sizes="114x114" href="/assets/apple-touch-icon-114x114.png">
  <link rel="apple-touch-icon" sizes="120x120" href="/assets/apple-touch-icon-120x120.png">
  <!-- iPad (Retina) ICON-->
  <link rel="apple-touch-icon" sizes="144x144" href="/assets/apple-touch-icon-144x144.png">
  <link rel="apple-touch-icon" sizes="152x152" href="/assets/apple-touch-icon-152x152.png">
  <link rel="apple-touch-icon" sizes="167x167" href="/assets/apple-touch-icon-167x167.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon-180x180.png">
  <link rel="apple-touch-icon" sizes="1024x1024" href="/assets/apple-touch-icon-1024x1024.png">

  <!-- https://www.ios-resolution.com/ -->
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-640x1136.png" media="(device-width:  320px) and (device-height:  568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-750x1334.png" media="(device-width:  375px) and (device-height:  667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-828x1792.png" media="(device-width:  414px) and (device-height:  896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1125x2436.png" media="(device-width:  375px) and (device-height:  812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1170x2532.png" media="(device-width:  390px) and (device-height:  844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1242x2208.png" media="(device-width:  414px) and (device-height:  736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1242x2688.png" media="(device-width:  414px) and (device-height:  896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1284x2778.png" media="(device-width:  428px) and (device-height:  926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1536x2048.png" media="(device-width:  768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1620x2160.png" media="(device-width:  810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1668x2224.png" media="(device-width:  834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1668x2388.png" media="(device-width:  834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-2048x2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">

  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1136x640.png" media="(device-width:  320px) and (device-height:  568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1334x750.png" media="(device-width:  375px) and (device-height:  667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-1792x828.png" media="(device-width:  414px) and (device-height:  896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-2436x1125.png" media="(device-width:  375px) and (device-height:  812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-2532x1170.png" media="(device-width:  390px) and (device-height:  844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-2208x1242.png" media="(device-width:  414px) and (device-height:  736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-2688x1242.png" media="(device-width:  414px) and (device-height:  896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-2778x1284.png" media="(device-width:  428px) and (device-height:  926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-2048x1536.png" media="(device-width:  768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-2160x1620.png" media="(device-width:  810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-2224x1668.png" media="(device-width:  834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-2388x1668.png" media="(device-width:  834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
  <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup-image-2732x2048.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
  
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48x48.png">
  <link rel="icon" type="image/png" sizes="228x228" href="/assets/coast-228x228.png">
  <link rel="shortcut icon" href="/assets/favicon.ico">
  <link rel="manifest" href="/assets/manifest.webmanifest">
  <link rel="icon" type="image/png" sizes="50x50" href="/assets/yandex-browser-50x50.png">
  <link rel="yandex-tableau-widget" href="/assets/yandex-browser-manifest.json">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title">
  <meta name="tero">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="msapplication-TileImage" content="/assets/mstile-144x144.png">
  <meta name="msapplication-TileImage" content="/assets/mstile-150x150.png">
  <meta name="msapplication-TileImage" content="/assets/mstile-310x150.png">
  <meta name="msapplication-TileImage" content="/assets/mstile-310x310.png">
  <meta name="msapplication-config" content="/assets/browserconfig.xml">
  <meta name="theme-color" content="#ffffff">
`;

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer el archivo:', err);
    return;
  }

  const assetReferencesExists = /<!--pwa asset references-->/i.test(data);
  let modifiedData;
  let successMsg;
  if (!assetReferencesExists) {
    modifiedData = data.replace('<!--pwa-assets-->', `${faviconsHTML}\n`);
    successMsg = 'Etiquetas agregadas exitosamente al encabezado!';
  } else {
    modifiedData = data.replace(`${faviconsHTML}\n`, '<!--pwa-assets-->');
    successMsg = 'Etiquetas removidas exitosamente del encabezado!';
  }

  fs.writeFile(filePath, modifiedData, 'utf8', err => {
    if (err) {
      console.error('Error al escribir en el archivo:', err);
      return;
    }

    console.log(successMsg);
  });
});
