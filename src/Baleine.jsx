import { useEffect } from 'react'

import { mouvementReduit } from './mouvement.js'

// Animation jouée quand le pli « Baleine + fuites » est déclaré : un cachalot
// blanc traverse l'écran de la droite vers la gauche.
//
// Il est dessiné bien plus long et plus haut que le cadre : on ne le voit
// jamais en entier, seulement défiler — le mufle carré, puis le flanc couturé
// de cicatrices, puis la caudale. Même facture que la scène du Kraken (voile
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

// Entailles profondes, souvenirs de harpons.
const ENTAILLES = [
  'M 470 -196 l 54 26',
  'M 604 -178 l 46 30',
  'M 836 118 l 58 -22',
  'M 1012 -108 l 40 26',
  'M 690 152 l 44 -18',
]

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
          {/* Le cachalot est tracé sur ~1500 unités de long pour 460 de haut, puis
              agrandi : il déborde du cadre en hauteur, et il faut toute la
              traversée pour le voir passer en entier. Il est posé bas dans le
              cadre pour dégager le souffle, qui partirait sinon hors champ. */}
          <g transform="translate(0 430) scale(1.5)">
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

            {/* --- Nageoire pectorale --- */}
            <path
              d="M506 150 C534 206, 590 250, 648 262
                 C620 216, 574 172, 536 142 Z"
              fill="#46555f"
            />

            {/* --- Cicatrices --- */}
            <g className="baleine-cicatrices">
              {GRIFFURES.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.5"
                  strokeWidth="3"
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
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.58"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              ))}
            </g>

            {/* --- Harpon brisé planté dans le dos, et son bout de filin --- */}
            <g>
              <path d="M742 -166 l 26 -74" stroke="#2b1c14" strokeWidth="9" strokeLinecap="round" />
              <path d="M742 -166 l 26 -74" stroke="#8a6a3a" strokeWidth="4" strokeLinecap="round" />
              <path
                d="M768 -240 c 26 -10, 52 4, 64 26 c 10 18, 6 40, -8 54"
                fill="none"
                stroke="#7a6a58"
                strokeOpacity="0.75"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
            </g>

            {/* --- Œil, petit et froid, loin derrière le mufle --- */}
            <ellipse cx="462" cy="44" rx="13" ry="10" fill="#141c22" />
            <circle cx="458" cy="41" r="3.6" fill="#efc463" />

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
