// Génère les images sources de l'appli Android (icône + écran de démarrage)
// à partir de public/icone-512.png, puis @capacitor/assets les décline
// dans toutes les tailles Android. Relancer après tout changement d'icône :
//   node scripts/generer-assets.mjs && npx capacitor-assets generate --android
import sharp from 'sharp'
import fs from 'fs'

const SRC = 'public/icone-512.png'
const TAILLE = 1024
fs.mkdirSync('assets', { recursive: true })

// 1) icon.png — l'artwork complet, agrandi proprement en 1024
await sharp(SRC).resize(TAILLE, TAILLE, { kernel: 'lanczos3' }).png().toFile('assets/icon.png')

// 2) Fond de l'icône adaptative : dégradé radial sombre reprenant les teintes
//    de l'artwork. (Surtout pas un flou de l'icône : ça laisse une tache dorée.)
const degrade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${TAILLE}" height="${TAILLE}">
  <defs>
    <radialGradient id="g" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#4A211A"/>
      <stop offset="60%" stop-color="#331711"/>
      <stop offset="100%" stop-color="#25100D"/>
    </radialGradient>
  </defs>
  <rect width="${TAILLE}" height="${TAILLE}" fill="url(#g)"/>
</svg>`)
await sharp(degrade).png().toFile('assets/icon-background.png')

// 3) Avant-plan : le crâne doré seul, replié dans la zone sûre (62 % du cadre)
//    pour ne pas être rogné par les masques ronds/carrés d'Android.
//    (Le XML adaptatif n'applique aucun inset : le cadrage est fait ici.)
//    On isole l'artwork du fond sombre par seuillage de luminosité.
const INTERNE = Math.round(TAILLE * 0.55)
const src = await sharp(SRC)
  .resize(INTERNE, INTERNE, { kernel: 'lanczos3' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
//    Le canal vert sépare nettement les éléments : fond rouge sombre 13→29,
//    cercle décoratif jusqu'à 61, doré du crâne 106→209. On coupe dans l'écart
//    61→106, avec une transition douce pour garder l'anticrénelage des contours.
const px = src.data
const BAS = 70
const HAUT = 95
for (let i = 0; i < px.length; i += 4) {
  const vert = px[i + 1]
  if (vert <= BAS) px[i + 3] = 0
  else if (vert < HAUT) px[i + 3] = Math.round(((vert - BAS) / (HAUT - BAS)) * 255)
}
const craneSeul = await sharp(px, {
  raw: { width: INTERNE, height: INTERNE, channels: 4 },
}).png().toBuffer()

await sharp({
  create: { width: TAILLE, height: TAILLE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: craneSeul, gravity: 'center' }])
  .png()
  .toFile('assets/icon-foreground.png')

// 4) Écran de démarrage : le logo centré sur le fond sombre de l'appli.
const FOND = { r: 0x0b, g: 0x09, b: 0x08, alpha: 1 }
const logo = await sharp(SRC).resize(760, 760, { kernel: 'lanczos3' }).png().toBuffer()
for (const nom of ['assets/splash.png', 'assets/splash-dark.png']) {
  await sharp({ create: { width: 2732, height: 2732, channels: 4, background: FOND } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(nom)
}

console.log('Images generees :', fs.readdirSync('assets').join(', '))
