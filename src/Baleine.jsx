import { useEffect } from 'react'

import { mouvementReduit } from './mouvement.js'

// Animation jouée quand le pli « Baleine + fuites » est déclaré : la bête
// traverse l'écran de la droite vers la gauche en soufflant par son évent.
//
// Même facture que la scène du Kraken — voile plein écran, cri en lettres
// gothiques, sortie en fondu — mais dans des bleus froids plutôt que dans les
// rouges de la pieuvre, pour que les deux incidents ne se confondent jamais.

const DUREE = 2400

// Le souffle : trois jets qui s'ouvrent en éventail au-dessus de l'évent,
// plus quelques gouttes. Tracés une fois, ils sont animés par CSS.
const JETS = [
  { d: 'M0 0 C -4 -26, -6 -50, -2 -74', largeur: 7 },
  { d: 'M0 0 C 2 -28, 10 -52, 22 -70', largeur: 6 },
  { d: 'M0 0 C -2 -24, -14 -44, -28 -58', largeur: 5 },
]

const GOUTTES = [
  { cx: -6, cy: -84, r: 4.2 },
  { cx: 30, cy: -78, r: 3.4 },
  { cx: -36, cy: -66, r: 3 },
  { cx: 12, cy: -92, r: 2.6 },
  { cx: -20, cy: -92, r: 2.2 },
]

// Le sillage : des bulles qui remontent le long des deux bords tant que la
// Baleine est déclarée, pendant du Kraken et de ses tentacules. Celles-ci
// tiennent les quatre coins, d'où des bulles cantonnées aux flancs : les deux
// incidents peuvent être déclarés ensemble sans se chevaucher.
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
            <stop offset="0%" stopColor="#4a7288" />
            <stop offset="45%" stopColor="#28455a" />
            <stop offset="100%" stopColor="#0d1922" />
          </linearGradient>
          <linearGradient id="baleine-souffle" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#cfe6f2" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#cfe6f2" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* La baleine traverse ; tout est dessiné tournée vers la gauche. */}
        <g className="baleine-corps">
          <g transform="translate(70, 300)">
            {/* Le souffle part de l'évent, situé sur le haut du crâne */}
            <g className="baleine-event" transform="translate(58, 22)">
              {JETS.map((jet, i) => (
                <path
                  key={i}
                  className="baleine-jet"
                  d={jet.d}
                  fill="none"
                  stroke="url(#baleine-souffle)"
                  strokeWidth={jet.largeur}
                  strokeLinecap="round"
                  style={{ animationDelay: `${0.9 + i * 0.07}s` }}
                />
              ))}
              {GOUTTES.map((g, i) => (
                <circle
                  key={i}
                  className="baleine-goutte"
                  cx={g.cx}
                  cy={g.cy}
                  r={g.r}
                  fill="#cfe6f2"
                  fillOpacity="0.7"
                  style={{ animationDelay: `${1.05 + i * 0.05}s` }}
                />
              ))}
            </g>

            {/* Corps */}
            <path
              d="M12 60 C22 34, 62 20, 112 22 C168 24, 212 36, 236 58
                 C212 82, 168 94, 112 96 C62 98, 22 86, 12 60 Z"
              fill="url(#baleine-peau)"
            />
            {/* Nageoire caudale */}
            <path
              d="M230 58 C244 50, 258 34, 268 22 C272 18, 278 22, 275 28
                 C268 42, 258 54, 250 58 C258 62, 268 74, 275 88
                 C278 94, 272 98, 268 94 C258 82, 244 66, 230 58 Z"
              fill="url(#baleine-peau)"
            />
            {/* Nageoire pectorale */}
            <path
              d="M96 88 C104 104, 120 116, 136 118 C126 104, 112 92, 102 84 Z"
              fill="#16242e"
            />
            {/* Sillons du ventre */}
            <path
              d="M30 74 C48 86, 74 92, 104 93 M34 62 C54 76, 82 84, 114 85"
              fill="none"
              stroke="#0d1922"
              strokeOpacity="0.5"
              strokeWidth="2"
            />
            {/* Ligne de bouche et œil */}
            <path
              d="M13 66 C34 80, 60 87, 88 89"
              fill="none"
              stroke="#0d1922"
              strokeOpacity="0.75"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <circle cx="44" cy="56" r="4.6" fill="#efc463" />
            <circle cx="42.6" cy="54.6" r="1.6" fill="#0d1922" />
            {/* Reflet doré sur le dos, pour rester dans la palette du jeu */}
            <path
              d="M20 52 C40 30, 86 21, 130 24 C176 27, 210 38, 233 56"
              fill="none"
              stroke="#efc463"
              strokeOpacity="0.4"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>

      <p className="baleine-cri">La Baleine&nbsp;!</p>
    </div>
  )
}
