import { useEffect } from 'react'

import { mouvementReduit } from './mouvement.js'

// Animation jouée quand le pli « Baleine + fuites » est déclaré : un cachalot
// blanc traverse l'écran de la droite vers la gauche.
//
// Il est dessiné bien plus long et plus haut que le cadre : on ne le voit
// jamais en entier, seulement défiler — le mufle carré couvert de bernacles,
// puis le flanc couturé de cicatrices et hérissé de harpons dont les filins
// traînent encore, puis la caudale. D'après une aquarelle de Moby Dick. Même facture que la scène du Kraken (voile
// plein écran, cri en lettres gothiques, sortie en fondu), mais dans des bleus
// froids pour que les deux incidents ne se confondent jamais.

const DUREE = 2600

/* ------------------------------------------------------------------ */
/* Cicatrices                                                          */
/* ------------------------------------------------------------------ */

// Coups de griffe parallèles : les marques que les calmars géants laissent sur
// le mufle des vieux cachalots. Tracées par grappes plutôt qu'une à une.
function griffures(x, y, longueur, nombre, ecart) {
  return Array.from({ length: nombre }, (_, i) => {
    const dy = (i - (nombre - 1) / 2) * ecart
    return `M ${x} ${y + dy} q ${longueur * 0.45} -10 ${longueur} ${dy * 0.22}`
  })
}

const GRIFFURES = [
  ...griffures(86, -150, 170, 5, 14),
  ...griffures(214, -66, 200, 4, 17),
  ...griffures(140, 16, 150, 6, 12),
  ...griffures(332, -160, 130, 4, 13),
  ...griffures(566, -116, 160, 4, 15),
  ...griffures(772, -58, 140, 3, 16),
  ...griffures(968, -34, 120, 4, 13),
]

// Cicatrices rondes laissées par les ventouses.
const VENTOUSES = [
  { cx: 124, cy: -104, r: 10 },
  { cx: 176, cy: -178, r: 7 },
  { cx: 262, cy: -132, r: 12 },
  { cx: 318, cy: -44, r: 8 },
  { cx: 96, cy: -22, r: 9 },
  { cx: 238, cy: 62, r: 11 },
  { cx: 372, cy: -108, r: 6 },
  { cx: 404, cy: 28, r: 9 },
  { cx: 516, cy: -66, r: 7 },
  { cx: 648, cy: 84, r: 8 },
  { cx: 712, cy: -122, r: 6 },
  { cx: 884, cy: 52, r: 7 },
  { cx: 190, cy: 108, r: 6 },
  { cx: 452, cy: -172, r: 8 },
]

// Entailles profondes, souvenirs de harpons, et deux longues balafres
// refermées. Tracées en chair rosée, avec la ligne sombre de la plaie au
// milieu.
const ENTAILLES = [
  'M 470 -196 l 54 26',
  'M 604 -178 l 46 30',
  'M 836 118 l 58 -22',
  'M 1012 -108 l 40 26',
  'M 690 152 l 44 -18',
  'M 250 -118 C 330 -98, 410 -60, 462 -12',
  'M 700 -96 C 760 -66, 820 -46, 884 -36',
]

// Silhouette du corps, en quelques points, pour semer les détails dessus sans
// déborder : bord du dos et bord du ventre selon x.
const DOS = [[20, -96], [60, -180], [132, -211], [338, -215], [510, -185], [700, -163], [910, -137], [1000, -125], [1100, -90], [1194, -56]]
const VENTRE = [[20, -40], [60, 60], [98, 105], [250, 145], [386, 167], [474, 183], [704, 169], [997, 125], [1100, 92], [1194, 56]]

const interpole = (bord, x) => {
  const i = Math.max(1, bord.findIndex(([bx]) => bx >= x))
  const [x0, y0] = bord[i - 1]
  const [x1, y1] = bord[i]
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
}

// Tirage pseudo-aléatoire à graine fixe : la baleine est la même à chaque
// passage.
function alea(graine) {
  let s = graine
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Un point au hasard sur le flanc, à distance des bords
function surLeFlanc(hasard, xMin, xMax, marge = 14) {
  const x = xMin + hasard() * (xMax - xMin)
  const haut = interpole(DOS, x) + marge
  const bas = interpole(VENTRE, x) - marge
  return [x, haut + hasard() * (bas - haut)]
}

// Fines stries, comme sur les vieux cachalots : rouille, blanches ou grises,
// parfois par deux ou trois, parallèles.
const STRIES = (() => {
  const h = alea(7)
  const couleurs = [
    ['#7a4e3e', 0.5],
    ['#ffffff', 0.45],
    ['#56656e', 0.4],
  ]
  const liste = []
  for (let i = 0; i < 90; i++) {
    const [x, y] = surLeFlanc(h, 50, 1170)
    const long = 18 + h() * 70
    const pente = (h() - 0.5) * 0.9
    const courbe = (h() - 0.5) * 10
    const [couleur, opacite] = couleurs[Math.floor(h() * couleurs.length)]
    const nombre = h() < 0.25 ? 3 : h() < 0.4 ? 2 : 1
    for (let k = 0; k < nombre; k++) {
      liste.push({
        d: `M${x.toFixed(0)} ${(y + k * 5).toFixed(0)} q ${(long / 2).toFixed(0)} ${courbe.toFixed(1)} ${long.toFixed(0)} ${(long * pente).toFixed(0)}`,
        couleur,
        opacite,
        largeur: 0.8 + h() * 0.9,
      })
    }
  }
  return liste
})()

// Peau plissée du cachalot, en vaguelettes sur l'arrière du corps
const RIDES = (() => {
  const h = alea(31)
  return Array.from({ length: 70 }, () => {
    const [x, y] = surLeFlanc(h, 470, 1170, 20)
    return `M${x.toFixed(0)} ${y.toFixed(0)} c 8 -3, 16 3, 24 0 s 16 -3, 24 0`
  })
})()

// Taches de lavis sur la peau, claires ou verdâtres, pour casser l'aplat
const LAVIS = (() => {
  const h = alea(97)
  return Array.from({ length: 26 }, (_, i) => {
    const [cx, cy] = surLeFlanc(h, 40, 1170, 30)
    return {
      cx,
      cy,
      rx: 20 + h() * 46,
      ry: 8 + h() * 18,
      a: (h() - 0.5) * 30,
      couleur: i % 3 ? '#8a9a8f' : '#ffffff',
    }
  })
})()

// Bernacles en grappes, surtout autour du mufle
const BERNACLES = (() => {
  const h = alea(53)
  const grappes = [[74, -40], [50, 28], [150, 116], [300, 150], [1150, 30], [120, -150]]
  return grappes.flatMap(([cx, cy]) =>
    Array.from({ length: 7 }, () => ({
      cx: cx + (h() - 0.5) * 34,
      cy: cy + (h() - 0.5) * 26,
      r: 2 + h() * 2.6,
    })),
  )
})()

/* ------------------------------------------------------------------ */
/* Les harpons                                                         */
/* ------------------------------------------------------------------ */

// Harpons restés plantés : une plaie refermée autour de la tige, le fer, la
// hampe de bois, brisée pour certains. Les autres traînent encore leur
// filin, que l'eau fait onduler vers l'arrière. Ils pointent vers le haut et
// l'arrière, couchés par la nage.
const HARPONS = [
  { x: 196, y: -206, angle: -58, longueur: 96, filin: 170 },
  { x: 330, y: -213, angle: -66, longueur: 130, filin: 220 },
  { x: 470, y: -190, angle: -52, longueur: 74, casse: true },
  { x: 612, y: -174, angle: -62, longueur: 118, filin: 200 },
  { x: 760, y: -158, angle: -70, longueur: 104, casse: true },
  { x: 900, y: -138, angle: -48, longueur: 92, filin: 160 },
  { x: 560, y: 20, angle: -28, longueur: 80, filin: 140 },
  { x: 820, y: 60, angle: -22, longueur: 60, casse: true },
  { x: 1060, y: -92, angle: -40, longueur: 70, casse: true },
]

function Harpon({ x, y, angle, longueur, casse }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {/* Plaie : chair refermée en bourrelet autour de la tige */}
      <ellipse cx="0" cy="0" rx="11" ry="6.5" fill="none" stroke="#c4867c" strokeOpacity="0.55" strokeWidth="2.4" />
      <ellipse cx="0" cy="0" rx="6.5" ry="4" fill="#5e2522" fillOpacity="0.8" />
      {/* Fer, douille, puis la hampe et son fil de bois */}
      <line x1="0" y1="0" x2="22" y2="0" stroke="#3b4046" strokeWidth="3.4" strokeLinecap="round" />
      <rect x="18" y="-3.6" width="9" height="7.2" rx="1.5" fill="#2b2f34" />
      <line x1="26" y1="0" x2={longueur} y2="0" stroke="#6b4828" strokeWidth="5.6" strokeLinecap={casse ? 'butt' : 'round'} />
      <line x1="28" y1="-1.2" x2={longueur - 4} y2="-1.2" stroke="#a87c48" strokeOpacity="0.8" strokeWidth="1.2" />
      {casse ? (
        // Hampe brisée : un bout d'échardes
        <path
          d={`M${longueur} -2.8 L${longueur + 7} -1.5 L${longueur + 3} 0 L${longueur + 9} 1.2 L${longueur + 2} 2.8 Z`}
          fill="#8a6236"
        />
      ) : (
        <circle cx={longueur} cy="0" r="3.4" fill="#2b2f34" />
      )}
    </g>
  )
}

// Filin qui traîne derrière un harpon : il part de la douille et ondule vers
// l'arrière (la droite), en retombant un peu.
function Filin({ x, y, angle, filin }) {
  const a = (angle * Math.PI) / 180
  const ax = x + Math.cos(a) * 30
  const ay = y + Math.sin(a) * 30
  const l = filin
  const forme = (s) =>
    `M${ax.toFixed(1)} ${ay.toFixed(1)} C${(ax + l * 0.3).toFixed(1)} ${(ay + 14 * s).toFixed(1)}, ${(ax + l * 0.6).toFixed(1)} ${(ay - 10 * s).toFixed(1)}, ${(ax + l).toFixed(1)} ${(ay + 22).toFixed(1)}`
  return (
    <path d={forme(1)} fill="none" stroke="#b9a582" strokeOpacity="0.8" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="5 2">
      <animate attributeName="d" values={`${forme(1)};${forme(-1)};${forme(1)}`} dur="1.3s" repeatCount="indefinite" />
    </path>
  )
}

/* ------------------------------------------------------------------ */
/* Le souffle                                                          */
/* ------------------------------------------------------------------ */

// Chez le cachalot l'évent est décalé à l'avant gauche du crâne : le souffle
// part en biais vers l'avant, et non droit vers le haut. C'est sa signature.
const JETS = [
  { d: 'M0 0 C -18 -50, -34 -96, -58 -136', largeur: 13 },
  { d: 'M0 0 C -6 -54, -12 -106, -24 -152', largeur: 11 },
  { d: 'M0 0 C -26 -40, -54 -72, -84 -96', largeur: 9 },
]

const GOUTTES = [
  { cx: -70, cy: -150, r: 7 },
  { cx: -32, cy: -168, r: 6 },
  { cx: -96, cy: -108, r: 5 },
  { cx: -52, cy: -186, r: 4.5 },
  { cx: -112, cy: -130, r: 4 },
  { cx: -14, cy: -140, r: 5.5 },
]

/* ------------------------------------------------------------------ */
/* Le sillage, qui reste après le passage                              */
/* ------------------------------------------------------------------ */

// Bulles qui remontent le long des deux bords tant que la Baleine est
// déclarée, pendant du Kraken et de ses tentacules. Celles-ci tiennent les
// quatre coins, d'où des bulles cantonnées aux flancs : les deux incidents
// peuvent être déclarés ensemble sans se chevaucher.
//
// Valeurs choisies à la main plutôt que tirées au hasard, pour que la
// répartition reste la même d'un rendu à l'autre. `retard` est négatif : chaque
// bulle démarre déjà en cours de montée, sinon elles partiraient toutes
// ensemble du bas à l'affichage.
const BULLES = [
  { x: '4%', y: '6%', taille: 13, duree: 13, retard: -2 },
  { x: '11%', y: '22%', taille: 8, duree: 16, retard: -7 },
  { x: '3%', y: '41%', taille: 17, duree: 11, retard: -4 },
  { x: '14%', y: '58%', taille: 10, duree: 15, retard: -11 },
  { x: '6%', y: '73%', taille: 7, duree: 18, retard: -1 },
  { x: '12%', y: '88%', taille: 14, duree: 12, retard: -9 },
  { x: '2%', y: '30%', taille: 6, duree: 20, retard: -14 },
  { x: '9%', y: '65%', taille: 11, duree: 14, retard: -6 },
  { x: '93%', y: '10%', taille: 15, duree: 12, retard: -5 },
  { x: '86%', y: '28%', taille: 9, duree: 17, retard: -13 },
  { x: '96%', y: '46%', taille: 12, duree: 14, retard: -3 },
  { x: '88%', y: '62%', taille: 7, duree: 19, retard: -8 },
  { x: '94%', y: '79%', taille: 16, duree: 11, retard: -10 },
  { x: '84%', y: '92%', taille: 10, duree: 15, retard: -2 },
  { x: '97%', y: '36%', taille: 6, duree: 21, retard: -16 },
  { x: '90%', y: '70%', taille: 13, duree: 13, retard: -12 },
]

export function SillageBaleine() {
  return (
    <div className="baleine-sillage" aria-hidden="true">
      {BULLES.map((b, i) => (
        <span
          className="bulle"
          key={i}
          style={{
            left: b.x,
            bottom: b.y,
            width: b.taille,
            height: b.taille,
            animationDuration: `${b.duree}s`,
            animationDelay: `${b.retard}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* La traversée                                                        */
/* ------------------------------------------------------------------ */

export default function AnimationBaleine({ onFini }) {
  const sansAnimation = mouvementReduit()

  useEffect(() => {
    if (sansAnimation) {
      onFini()
      return undefined
    }
    const minuteur = setTimeout(onFini, DUREE)
    return () => clearTimeout(minuteur)
  }, [onFini, sansAnimation])

  if (sansAnimation) return null

  return (
    <div className="baleine-scene" role="presentation">
      <svg
        className="baleine-dessin"
        viewBox="0 0 400 640"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="baleine-peau" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2ead9" />
            <stop offset="38%" stopColor="#c6ccca" />
            <stop offset="72%" stopColor="#7d8c95" />
            <stop offset="100%" stopColor="#3f4e58" />
          </linearGradient>
          <linearGradient id="baleine-souffle" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#dff0f8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#dff0f8" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className="baleine-corps">
          {/* Le cachalot est tracé sur ~1500 unités de long pour 460 de haut.
              À cette échelle il tient tout juste en hauteur — dos, ventre et
              caudale visibles — mais reste long de plusieurs largeurs d'écran :
              il faut toute la traversée pour le voir passer en entier. Sa
              position verticale ménage la place du souffle au-dessus. */}
          <g transform="translate(0 371) scale(1.02)">
            {/* --- Le souffle, à l'avant gauche du crâne --- */}
            <g className="baleine-event" transform="translate(46 -186)">
              {JETS.map((jet, i) => (
                <path
                  key={i}
                  className="baleine-jet"
                  d={jet.d}
                  fill="none"
                  stroke="url(#baleine-souffle)"
                  strokeWidth={jet.largeur}
                  strokeLinecap="round"
                  style={{ animationDelay: `${0.16 + i * 0.05}s` }}
                />
              ))}
              {GOUTTES.map((g, i) => (
                <circle
                  key={i}
                  className="baleine-goutte"
                  cx={g.cx}
                  cy={g.cy}
                  r={g.r}
                  fill="#dff0f8"
                  fillOpacity="0.75"
                  style={{ animationDelay: `${0.24 + i * 0.04}s` }}
                />
              ))}
            </g>

            {/* --- Caudale, aux bords déchiquetés --- */}
            <path
              d="M1180 -42 C1252 -74, 1330 -142, 1398 -208
                 C1416 -224, 1440 -214, 1432 -192
                 C1414 -140, 1380 -92, 1344 -58
                 L1360 -40 L1326 -34 L1306 -18
                 C1272 -10, 1238 -4, 1206 0
                 C1238 4, 1272 10, 1306 18
                 L1330 36 L1358 44 L1342 60
                 C1378 94, 1412 142, 1430 194
                 C1438 216, 1414 226, 1396 210
                 C1328 144, 1250 76, 1180 42 Z"
              fill="url(#baleine-peau)"
            />

            {/* --- Mâchoire inférieure, étroite et en retrait --- */}
            <path
              d="M74 74 C154 110, 274 140, 396 156
                 C408 172, 400 186, 382 184
                 C262 168, 138 138, 60 100
                 C48 92, 56 70, 74 74 Z"
              fill="#4a5a64"
            />
            {Array.from({ length: 9 }, (_, i) => {
              const x = 120 + i * 32
              const y = 96 + i * 6.4
              return (
                <path
                  key={i}
                  d={`M${x} ${y} l 7 -13 l 7 13 Z`}
                  fill="#e8e2d2"
                  fillOpacity="0.85"
                />
              )
            })}

            {/* --- Corps : le mufle cubique, la bosse, les jointures --- */}
            <path
              d="M20 -96
                 C18 -162, 54 -204, 132 -211
                 L338 -215
                 C430 -213, 472 -199, 510 -185
                 C654 -171, 812 -155, 910 -137
                 C928 -152, 950 -162, 968 -157
                 C986 -152, 993 -139, 997 -125
                 C1031 -113, 1062 -102, 1092 -92
                 C1124 -82, 1158 -70, 1194 -56
                 L1194 56
                 C1158 70, 1124 82, 1092 92
                 C1062 102, 1031 113, 997 125
                 C904 145, 804 159, 704 169
                 C624 176, 544 181, 474 183
                 C432 185, 402 179, 386 167
                 C302 151, 172 129, 98 105
                 C54 91, 24 58, 20 -96 Z"
              fill="url(#baleine-peau)"
            />

            {/* --- Taches de lavis --- */}
            <g>
              {LAVIS.map((t, i) => (
                <ellipse
                  key={i}
                  cx={t.cx.toFixed(0)}
                  cy={t.cy.toFixed(0)}
                  rx={t.rx.toFixed(0)}
                  ry={t.ry.toFixed(0)}
                  transform={`rotate(${t.a.toFixed(0)} ${t.cx.toFixed(0)} ${t.cy.toFixed(0)})`}
                  fill={t.couleur}
                  fillOpacity="0.12"
                />
              ))}
            </g>

            {/* --- Peau plissée de l'arrière du corps --- */}
            <g fill="none" stroke="#4e5d66" strokeOpacity="0.28" strokeWidth="1.2" strokeLinecap="round">
              {RIDES.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>

            {/* --- Bouche : la commissure file jusque sous l'œil --- */}
            <path
              d="M60 96 C160 130, 290 156, 392 166"
              fill="none"
              stroke="#33424b"
              strokeOpacity="0.7"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* --- Évent, en S à l'avant gauche du crâne --- */}
            <path d="M34 -190 c 6 -4, 12 -2, 16 2 c 4 4, 10 5, 16 2" fill="none" stroke="#2c3a42" strokeWidth="3" strokeLinecap="round" />

            {/* --- Nageoire pectorale, ses rayons et une encoche --- */}
            <path
              d="M506 150 C534 206, 590 250, 648 262
                 C620 216, 574 172, 536 142 Z"
              fill="#46555f"
            />
            <g fill="none" stroke="#2c3a42" strokeOpacity="0.5" strokeWidth="1.2">
              <path d="M522 152 C546 196, 584 232, 628 254 M530 148 C556 186, 590 216, 634 240" />
            </g>
            <path d="M590 236 l 8 10 l 6 -6" fill="none" stroke="#dfe6e8" strokeOpacity="0.5" strokeWidth="2" />

            {/* --- Bosses de la queue, le long du dos --- */}
            <g fill="none" stroke="#e8eef0" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round">
              {[1024, 1060, 1094, 1128, 1160].map((x) => (
                <path key={x} d={`M${x} ${(interpole(DOS, x) + 3).toFixed(0)} q 12 -9 24 0`} />
              ))}
            </g>

            {/* --- Cicatrices --- */}
            <g className="baleine-cicatrices">
              {STRIES.map((s, i) => (
                <path
                  key={`s${i}`}
                  d={s.d}
                  fill="none"
                  stroke={s.couleur}
                  strokeOpacity={s.opacite}
                  strokeWidth={s.largeur.toFixed(2)}
                  strokeLinecap="round"
                />
              ))}
              {GRIFFURES.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.32"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              ))}
              {VENTOUSES.map((v, i) => (
                <circle
                  key={i}
                  cx={v.cx}
                  cy={v.cy}
                  r={v.r}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.42"
                  strokeWidth="2.6"
                />
              ))}
              {ENTAILLES.map((d, i) => (
                <g key={i}>
                  <path d={d} fill="none" stroke="#d9a39a" strokeOpacity="0.6" strokeWidth="7" strokeLinecap="round" />
                  <path d={d} fill="none" stroke="#7d4a44" strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
                </g>
              ))}
            </g>

            {/* --- Bernacles --- */}
            <g>
              {BERNACLES.map((b, i) => (
                <g key={i}>
                  <circle cx={b.cx.toFixed(1)} cy={b.cy.toFixed(1)} r={b.r.toFixed(1)} fill="#d9d4c4" stroke="#6b767c" strokeWidth="0.8" />
                  <circle cx={b.cx.toFixed(1)} cy={b.cy.toFixed(1)} r={(b.r * 0.38).toFixed(1)} fill="#5b6469" />
                </g>
              ))}
            </g>

            {/* --- Harpons plantés, et leurs filins qui traînent --- */}
            {HARPONS.filter((h) => h.filin).map((h, i) => (
              <Filin key={i} {...h} />
            ))}
            {HARPONS.map((h, i) => (
              <Harpon key={i} {...h} />
            ))}

            {/* --- Caudale : cicatrices et encoches --- */}
            <g fill="none" stroke="#7a4e3e" strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round">
              <path d="M1250 -60 q 30 -30 70 -60 M1270 -40 q 40 -30 90 -50 M1262 60 q 40 30 80 60 M1300 40 q 30 30 60 70" />
            </g>

            {/* --- Œil, petit et froid, loin derrière le mufle, dans ses rides --- */}
            <g fill="none" stroke="#2c3a42" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round">
              <path d="M438 38 C448 26, 474 24, 488 36" />
              <path d="M436 52 C450 62, 474 62, 490 50" />
              <path d="M432 30 C446 16, 478 14, 494 28" strokeOpacity="0.3" />
              <path d="M490 44 L504 42 M488 52 L500 58" strokeOpacity="0.35" />
            </g>
            <ellipse cx="462" cy="44" rx="13" ry="10" fill="#141c22" />
            <circle cx="458" cy="41" r="3.6" fill="#efc463" />
            <circle cx="456.5" cy="39.5" r="1.1" fill="#ffffff" fillOpacity="0.8" />

            {/* --- Reflet doré sur le dos, pour rester dans la palette --- */}
            <path
              d="M30 -120 C34 -186, 70 -207, 136 -212
                 L338 -216 C432 -214, 476 -200, 514 -186
                 C656 -172, 814 -156, 912 -138"
              fill="none"
              stroke="#efc463"
              strokeOpacity="0.4"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>

      <p className="baleine-cri">La Baleine&nbsp;!</p>
    </div>
  )
}
