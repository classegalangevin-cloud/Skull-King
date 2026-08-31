// À lancer APRÈS `capacitor-assets generate --android`, qui réécrit ces deux
// fichiers à chaque passage.
//
// Le gabarit de capacitor-assets applique un retrait de 16,7 % au fond ET à
// l'avant-plan. Sur le fond c'est un bug d'affichage : le dégradé ne couvre
// alors plus toute la zone de 108 dp, et le lanceur laisse voir des coins
// transparents dès qu'il anime ou agrandit l'icône. Sur l'avant-plan, le
// retrait ferait un double rétrécissement, notre crâne étant déjà cadré à 55 %
// par scripts/generer-assets.mjs.
import fs from 'fs'

const XML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`

const cibles = [
  'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
  'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
]

for (const f of cibles) {
  fs.writeFileSync(f, XML)
  console.log('corrige :', f)
}
