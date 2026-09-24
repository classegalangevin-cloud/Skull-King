import { useEffect, useRef } from 'react'

import { jouerSon, preparerSon } from '@sons'
import { mouvementReduit } from './mouvement.js'

// Trois saynètes jouées au moment où l'on inscrit une prime de capture.
// Contrairement au Kraken et à la Baleine, elles ne laissent aucune trace :
// c'est un éclat, pas un état de la manche. D'où un fondu enchaîné court.
//
//   pirateParSk      le Skull King rit d'avoir pris un pirate
//   sireneParPirate  une herse tombe devant la sirène, qui s'y agrippe
//   skParSirene      la sirène joue de la harpe et envoûte le Skull King

const DUREE = 1800

// Chaque scène lance elle-même son bruitage, à l'instant où l'image le
// réclame (« son.a », en ms depuis le début de la scène) : la herse qui
// touche le fond, le premier éclat de rire. On le déclenche un poil en
// avance, le temps que le téléphone démarre la lecture.
const AVANCE_SON = 40

/* ------------------------------------------------------------------ */
/* Le fond marin des deux scènes de sirène                             */
/* ------------------------------------------------------------------ */

// Bulles qui montent du fond : positions figées, pour que la scène soit la
// même d'une capture à l'autre.
const BULLES = Array.from({ length: 14 }, (_, i) => ({
  t: ((i * 37) % 100) / 100,
  r: 1.2 + ((i * 7) % 5) * 0.5,
  montee: 0.5 + ((i * 13) % 40) / 100,
  derive: ((i * 23) % 16) - 8,
  retard: ((i * 211) % 2000) / 1000,
  duree: 1.8 + ((i * 17) % 10) / 10,
}))

// Petit poisson des récifs, tête vers la droite
function Poisson({ x, y, echelle, trajet, sens }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${sens * echelle} ${echelle})`}>
      <g className="fond-poisson" style={{ '--dx': `${trajet}px` }}>
        <path d="M0 0 L-7 -5 L-5.5 0 L-7 5 Z" fill="#c9384e" />
        <path d="M0 0 C4 -6, 12 -6, 17 0 C12 6, 4 6, 0 0 Z" fill="#ef5b6e" />
        <path d="M3 1.5 C7 4.5, 12 4.5, 16 1" fill="#ffb3a6" fillOpacity="0.7" />
        <path d="M6 -4.4 C8 -8, 11 -8, 12 -5" fill="#c9384e" />
        <circle cx="12.6" cy="-1" r="1.1" fill="#1a1016" />
      </g>
    </g>
  )
}

// Rais de lumière tombant de la surface, bulles et, parfois, poissons. Posé
// hors du sujet : il ne grossit pas avec lui, c'est le décor.
function FondMarin({ x, y, l, h, poissons = [] }) {
  return (
    <g>
      {[0.12, 0.38, 0.62, 0.88].map((t, i) => (
        <path
          key={t}
          className="fond-rai"
          style={{ animationDelay: `${-i * 0.8}s` }}
          d={`M${x + l * t + 20} ${y - 120} L${x + l * t + 38} ${y - 120} L${x + l * t - 22} ${y + h} L${x + l * t - 66} ${y + h} Z`}
          fill="url(#mer-rai)"
        />
      ))}
      {poissons.map((p, i) => (
        <Poisson key={i} {...p} />
      ))}
      {BULLES.map((b, i) => (
        <circle
          key={i}
          className="fond-bulle"
          cx={x + l * b.t}
          cy={y + h - 6}
          r={b.r}
          fill="url(#mer-bulle)"
          stroke="#e8fbff"
          strokeOpacity="0.55"
          strokeWidth="0.6"
          style={{
            '--dx': `${b.derive}px`,
            '--dy': `${-h * b.montee}px`,
            animationDelay: `${b.retard}s`,
            animationDuration: `${b.duree}s`,
          }}
        />
      ))}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* La sirène, d'après Alyra                                            */
/* ------------------------------------------------------------------ */

// Longue chevelure blanche qui flotte, couronne de corail et d'étoile de mer,
// bandeau de perles, bustier d'écailles corail, queue turquoise. Proportions
// d'une vraie silhouette : la tête tient dans la largeur des épaules plus de
// deux fois. Le visage change d'humeur selon la scène.

const VISAGE =
  'M102.5 84 C102 70, 109 62, 120 62 C131 62, 138 70, 137.5 84 C137.5 97, 133 108, 127 113 C124 116, 116 116, 113 113 C107 108, 102.5 97, 102.5 84 Z'

const CHEVEUX_DOS =
  'M120 46 C92 44, 76 64, 76 90 C76 114, 68 134, 56 152 C44 170, 34 196, 40 222 C48 210, 56 202, 64 200 C60 216, 62 234, 74 248 C78 232, 86 220, 94 214 L146 214 C154 220, 162 232, 166 248 C178 234, 180 216, 176 200 C184 202, 192 210, 200 222 C206 196, 196 170, 184 152 C172 134, 164 114, 164 90 C164 64, 148 44, 120 46 Z'

// Mèches du côté gauche ; le côté droit en est le reflet
const MECHES_DOS = [
  'M100 56 C86 66, 80 84, 80 104 C80 126, 72 144, 60 162',
  'M92 70 C84 92, 82 118, 74 140 C66 162, 50 180, 44 206',
  'M88 100 C86 130, 78 158, 70 180 C64 196, 64 216, 70 240',
  'M96 120 C94 150, 88 178, 82 200',
]
const REFLETS_DOS = ['M104 54 C92 62, 86 76, 85 92', 'M84 130 C80 150, 70 166, 60 180']

const TORSE =
  'M110 129 C99 132, 88 133, 82 141 C77 148, 78 159, 81 169 C85 183, 92 195, 94 207 L94 218 L146 218 L146 207 C148 195, 155 183, 159 169 C162 159, 163 148, 158 141 C152 133, 141 132, 130 129 Z'

const BUSTIER =
  'M86 153 C92 145, 108 143, 119 153 L120 154 L121 153 C132 143, 148 145, 154 153 C156 163, 152 175, 146 181 C132 185, 108 185, 94 181 C88 175, 84 163, 86 153 Z'

const QUEUE =
  'M94 214 C86 244, 92 272, 120 288 C142 300, 170 300, 190 290 C172 290, 154 284, 144 270 C134 254, 140 234, 146 214 Z'

// Étoile de mer : cinq bras, pointes arrondies par un trait de même couleur
const ETOILE =
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const r = i % 2 ? 4.2 : 10
    return `${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`
  }).join(' ') + ' Z'

// Perles du collier et du bandeau, posées sur une parabole
const arc = (n, x0, largeur, y0, fleche) =>
  Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    return [x0 + largeur * t, y0 + 4 * fleche * t * (1 - t)]
  })
const COLLIER = arc(9, 110, 20, 131, 8)
const BANDEAU = arc(11, 102, 36, 78, -16)

// Forme de l'œil gauche, centré sur l'origine, coin externe à gauche. Sert
// aussi de découpe à l'iris (voir « sirene-oeil-forme »).
const OEIL_FORME = 'M-5 0.4 C-3.2 -2.3, 2.3 -2.8, 5 0 C2.3 2.3, -2.3 2.5, -5 0.4 Z'

const SOURCILS = {
  inquiete: 'M-6.3 -6.2 C-3.6 -7, 0 -8.6, 4.6 -10.4',
  rusee: 'M-6.3 -6.8 C-3.6 -9.4, 1 -9.4, 4.6 -7',
}

// Un œil, tracé à gauche du visage puis reflété pour l'autre. « regard »
// décale l'iris dans le repère de la scène : on l'inverse pour l'œil reflété,
// sinon les deux yeux divergeraient. Rusée, la paupière tombe à mi-course.
function OeilSirene({ miroir, humeur, regard }) {
  const dx = miroir ? -regard[0] : regard[0]
  const dy = regard[1]
  const miClos = humeur === 'rusee'
  return (
    <g transform={`${miroir ? 'translate(240 0) scale(-1 1) ' : ''}translate(111.5 88) scale(1.18)`}>
      {/* Fard lavande sur la paupière */}
      <ellipse cx="0" cy="-2.8" rx="5.6" ry="2.3" fill="#a88fc4" fillOpacity="0.3" />
      <path d={OEIL_FORME} fill="#fbf5f1" />
      <g clipPath="url(#sirene-oeil-forme)">
        <circle cx={0.3 + dx} cy={-0.2 + dy} r="2.7" fill="url(#sirene-iris)" />
        <circle cx={0.3 + dx} cy={-0.2 + dy} r="1.15" fill="#0f2230" />
        <circle cx={-0.5 + dx} cy={-1.1 + dy} r="0.75" fill="#ffffff" />
        {/* Ombre de la paupière sur le globe */}
        <path d="M-5 0.4 C-3.2 -2.3, 2.3 -2.8, 5 0 L5 -0.9 C2.3 -3.5, -3.2 -3.1, -5 -0.5 Z" fill="#8a5a50" fillOpacity="0.35" />
      </g>
      {miClos && <path d="M-5.6 0.5 C-3.2 -1, 2.3 -1.4, 5.4 -0.2 L5.4 -3.8 L-5.6 -3.8 Z" fill="#f1d6c4" />}
      {/* Paupière supérieure, et cils qui filent vers la tempe */}
      <path
        d={miClos ? 'M-5.4 0.5 C-3.2 -1, 2.3 -1.4, 5.3 -0.2' : 'M-5.4 0.5 C-3.2 -2.8, 2.3 -3.3, 5.3 -0.2'}
        fill="none"
        stroke="#2b1d1f"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d={
          miClos
            ? 'M-5.1 0.3 L-7.4 -0.6 M-4 -0.5 L-6 -2.2 M-2.6 -0.9 L-3.8 -3'
            : 'M-5.1 0 L-7.2 -1.4 M-4.2 -1.3 L-6 -3.2 M-2.8 -2.1 L-3.9 -4.3'
        }
        stroke="#2b1d1f"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      {/* Pli de la paupière, paupière inférieure, sourcil */}
      <path d="M-4.3 -2.9 C-1.8 -4.7, 1.8 -4.7, 4.4 -3.1" fill="none" stroke="#c4958a" strokeWidth="0.6" />
      <path d="M-4.4 1.3 C-1.8 2.9, 1.8 2.9, 4.5 0.9" fill="none" stroke="#d2a293" strokeWidth="0.5" />
      <path d={SOURCILS[humeur]} fill="none" stroke="#9b8683" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  )
}

function Bouche({ humeur }) {
  if (humeur === 'rusee') {
    // Elle chante, un coin de la bouche relevé
    return (
      <g>
        <path d="M114.6 106.2 C117 105, 123 104.8, 125.8 105.4 C125 110.6, 115.6 111, 114.6 106.2 Z" fill="#4a1a20" />
        <path d="M116 106.2 C118.4 105.6, 122 105.5, 124.2 105.7 L123.8 107 C121.6 107.4, 118.4 107.4, 116.4 107.2 Z" fill="#fbf6f0" />
        <ellipse cx="120.5" cy="109.2" rx="2.6" ry="0.9" fill="#b04a5a" />
        <path
          d="M113.8 106.2 C116.2 104.3, 118.6 104.3, 120 105 C121.4 104.2, 123.8 104, 126.4 105.2 C123 105.3, 117 105.4, 113.8 106.2 Z"
          fill="#b9525c"
        />
        <path d="M114.6 106.4 C115.4 112.2, 125 112, 125.8 105.6 C124.4 110.8, 116 111.2, 114.6 106.4 Z" fill="#d06c77" />
        <ellipse cx="121" cy="110.9" rx="1.8" ry="0.45" fill="#ffffff" fillOpacity="0.4" />
      </g>
    )
  }
  // Inquiète : lèvres entrouvertes, coins tombants
  return (
    <g>
      <path
        d="M115 106.4 C116.8 105.2, 118.7 105.1, 120 105.8 C121.3 105.1, 123.2 105.2, 125 106.4 C122.8 107, 117.2 107, 115 106.4 Z"
        fill="#b9525c"
      />
      <ellipse cx="120" cy="107.3" rx="2.8" ry="1.1" fill="#4a1a20" />
      <path d="M115.4 107 C117 110.2, 123 110.2, 124.6 107 C122 108.6, 118 108.6, 115.4 107 Z" fill="#d06c77" />
      <ellipse cx="121" cy="108.9" rx="1.6" ry="0.45" fill="#ffffff" fillOpacity="0.4" />
      <path d="M114.8 106.5 L114 107.7 M125.2 106.5 L126 107.7" stroke="#a0555c" strokeWidth="0.5" strokeLinecap="round" />
    </g>
  )
}

function Visage({ humeur, regard }) {
  return (
    <g>
      <path d={VISAGE} fill="url(#sirene-visage)" />
      {/* Ombre des cheveux sur le front, joue droite dans l'ombre */}
      <path
        d="M102.5 84 C102 70, 109 62, 120 62 C131 62, 138 70, 137.5 84 C135 76, 129 71, 120 71 C111 71, 105 76, 102.5 84 Z"
        fill="#8a6050"
        fillOpacity="0.1"
      />
      <path d="M137.5 84 C137.5 97, 133 108, 127 113 C130 104, 133.5 95, 134 84 Z" fill="#b07a68" fillOpacity="0.22" />
      <ellipse cx="120" cy="112" rx="3" ry="1.5" fill="#ffffff" fillOpacity="0.22" />
      <ellipse cx="110.5" cy="97" rx="5" ry="3" fill="url(#sirene-joue)" />
      <ellipse cx="129.5" cy="97" rx="5" ry="3" fill="url(#sirene-joue)" />

      <OeilSirene humeur={humeur} regard={regard} />
      <OeilSirene miroir humeur={humeur} regard={regard} />

      {/* Nez : l'arête dans l'ombre d'un côté, les narines, la pointe */}
      <path d="M122.4 94 C122.8 97, 123.3 99, 123.5 100.6" fill="none" stroke="#d6a594" strokeWidth="0.7" strokeOpacity="0.5" />
      <ellipse cx="120" cy="102.6" rx="2.6" ry="0.7" fill="#c48c7c" fillOpacity="0.45" />
      <path
        d="M117 101.4 C118 102.4, 119 102.2, 120 101.9 C121 102.2, 122 102.4, 123 101.4"
        fill="none"
        stroke="#b57c6e"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <ellipse cx="120" cy="99.8" rx="1.3" ry="0.9" fill="#ffffff" fillOpacity="0.45" />

      <Bouche humeur={humeur} />
    </g>
  )
}

function Sirene({ humeur, regard, bras }) {
  return (
    <g>
      {/* Chevelure, derrière : elle ondule dans l'eau */}
      <g className="sirene-chevelure">
        <path d={CHEVEUX_DOS} fill="url(#sirene-cheveux)" />
        {[false, true].map((miroir) => (
          <g key={miroir} transform={miroir ? 'translate(240 0) scale(-1 1)' : undefined} fill="none" strokeLinecap="round">
            {MECHES_DOS.map((d) => (
              <path key={d} d={d} stroke="#8f9bbd" strokeOpacity="0.55" strokeWidth="1.3" />
            ))}
            {REFLETS_DOS.map((d) => (
              <path key={d} d={d} stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1.2" />
            ))}
          </g>
        ))}
      </g>

      {/* Branches de corail, plantées derrière la tête */}
      <g fill="none" stroke="#c73a2e" strokeLinecap="round">
        <path d="M128 60 C132 48, 138 40, 146 30" strokeWidth="3" />
        <path d="M136 44 C142 42, 148 36, 152 28" strokeWidth="2.4" />
        <path d="M132 50 C126 42, 126 34, 130 26" strokeWidth="2.2" />
        <path d="M141 37 C140 31, 142 26, 146 22" strokeWidth="1.8" />
      </g>
      <g fill="#e8574a">
        <circle cx="146" cy="30" r="1.7" />
        <circle cx="152" cy="28" r="1.5" />
        <circle cx="130" cy="26" r="1.5" />
        <circle cx="146" cy="22" r="1.3" />
      </g>

      {/* Queue : nageoires, masse, écailles, reflet et ombre */}
      <path d="M95 224 C80 228, 70 242, 66 258 C76 252, 86 248, 96 248 Z" fill="url(#sirene-nageoire)" />
      <path d="M146 226 C158 230, 166 240, 170 252 C162 248, 154 246, 146 246 Z" fill="url(#sirene-nageoire)" />
      <g stroke="#d6fff6" strokeOpacity="0.45" strokeWidth="0.7">
        <path d="M95 226 L70 254 M95 228 L78 251 M95 230 L88 249" />
        <path d="M146 228 L168 250 M146 232 L160 247" />
      </g>
      <g className="sirene-caudale">
        <path
          d="M186 288 C198 266, 220 252, 238 254 C228 266, 222 280, 218 294 C226 300, 236 308, 240 318 C220 318, 200 308, 186 296 Z"
          fill="url(#sirene-nageoire)"
        />
        <g stroke="#d6fff6" strokeOpacity="0.5" strokeWidth="0.8">
          <path d="M188 292 L232 257 M188 292 L226 271 M188 292 L220 289 M188 292 L229 305 M188 292 L236 315" />
        </g>
      </g>
      <path d={QUEUE} fill="url(#sirene-queue)" />
      <path d={QUEUE} fill="url(#trame-ecailles)" />
      <path d="M98 224 C92 248, 100 270, 122 284" fill="none" stroke="#c8fff2" strokeOpacity="0.35" strokeWidth="2.5" />
      <path d="M144 224 C136 246, 142 264, 158 278" fill="none" stroke="#0b2233" strokeOpacity="0.35" strokeWidth="5" />

      {/* Cou, et l'ombre du menton */}
      <path d="M113 106 C114 116, 113 124, 109 131 L131 131 C127 124, 126 116, 127 106 Z" fill="url(#sirene-peau)" />
      <path d="M113 110 C116 117, 124 117, 127 110 L127.5 119 C124 122, 116 122, 112.5 119 Z" fill="#a87562" fillOpacity="0.35" />

      {/* Buste : volume par les flancs, clavicules, nombril */}
      <path d={TORSE} fill="url(#sirene-peau)" />
      {[false, true].map((miroir) => (
        <path
          key={miroir}
          transform={miroir ? 'translate(240 0) scale(-1 1)' : undefined}
          d="M82 141 C77 148, 78 159, 81 169 C85 183, 92 195, 94 207 L99 207 C96 194, 89 182, 87 168 C85 158, 85 149, 89 142 Z"
          fill="#b98470"
          fillOpacity="0.25"
        />
      ))}
      <ellipse cx="117" cy="197" rx="8" ry="10" fill="#ffffff" fillOpacity="0.12" />
      <g fill="none" stroke="#cf9f8b" strokeWidth="0.8" strokeLinecap="round">
        <path d="M104 137 C109 139, 113 139.5, 116.5 138.4" />
        <path d="M136 137 C131 139, 127 139.5, 123.5 138.4" />
      </g>
      <path d="M95 183 C108 189, 132 189, 145 183 C139 191, 101 191, 95 183 Z" fill="#b57c6e" fillOpacity="0.3" />
      <ellipse cx="120" cy="202" rx="0.9" ry="1.5" fill="#b57c6e" fillOpacity="0.6" />

      {/* Ceinture d'écailles : la peau devient queue */}
      <path
        d="M94 218 C96 211, 101 211, 103.5 216 C106 210, 111 210, 113.5 215.5 C116 209.5, 121 209.5, 123.5 215.5
           C126 209.5, 131 209.5, 133.5 215.5 C136 210, 141 210, 146 218 L146 226 L94 226 Z"
        fill="url(#sirene-queue)"
      />

      {/* Bustier d'écailles corail, galonné d'or, un coquillage au milieu */}
      <path d={BUSTIER} fill="url(#sirene-corail)" />
      <path d={BUSTIER} fill="url(#trame-ecailles)" />
      <ellipse cx="104" cy="160" rx="8" ry="5" fill="#ffffff" fillOpacity="0.15" />
      <ellipse cx="136" cy="160" rx="8" ry="5" fill="#ffffff" fillOpacity="0.15" />
      <path d="M120 154 C119.5 166, 120 176, 120.5 184" fill="none" stroke="#6e1020" strokeOpacity="0.5" />
      <path
        d="M86 153 C92 145, 108 143, 119 153 L120 154 L121 153 C132 143, 148 145, 154 153"
        fill="none"
        stroke="#efc463"
        strokeWidth="1.6"
      />
      <path d="M94 181 C108 185, 132 185, 146 181" fill="none" stroke="#efc463" strokeWidth="1.2" />
      <path d="M116.5 155 C116.5 151, 123.5 151, 123.5 155 L120 157.5 Z" fill="#fbe7da" stroke="#d49a8a" strokeWidth="0.5" />
      <path d="M120 152 L120 157 M118 152.6 L119.2 156.4 M122 152.6 L120.8 156.4" stroke="#d49a8a" strokeWidth="0.4" />

      {/* Collier de perles */}
      {COLLIER.map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="1.5" fill="#fbf8f0" stroke="#c8bfae" strokeWidth="0.4" />
          <circle cx={x - 0.5} cy={y - 0.5} r="0.45" fill="#ffffff" />
        </g>
      ))}

      {bras}

      <Visage humeur={humeur} regard={regard} />

      {/* Chevelure, devant : raie sur le côté, et deux longues mèches qui
          encadrent le visage avant de tomber sur les épaules */}
      <path
        d="M100 90 C96 64, 106 50, 120 50 C134 50, 144 64, 140 90 C138 80, 132 72, 122 68 C114 72, 106 80, 100 90 Z"
        fill="url(#sirene-cheveux)"
      />
      <g fill="none" strokeLinecap="round">
        <path d="M104 80 C108 66, 116 58, 128 56 M112 72 C118 62, 128 58, 136 62 M136 66 C140 72, 141 80, 140 88" stroke="#8f9bbd" strokeOpacity="0.6" />
        <path d="M108 64 C114 56, 124 54, 132 56" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1.2" />
        {/* Frange : quelques mèches et un liseré plus sombre au ras du front */}
        <path d="M101 86 C104 76, 112 70, 122 68 M104 88 C107 80, 114 74, 124 71 M138 86 C136 78, 130 72, 122 68" stroke="#9aa6c6" strokeOpacity="0.6" strokeWidth="0.8" />
        <path d="M100 90 C106 80, 114 72, 122 68 C132 72, 138 80, 140 90" stroke="#8f9bbd" strokeOpacity="0.6" strokeWidth="0.8" />
      </g>
      <g className="sirene-meche">
        <path
          d="M102 80 C95 98, 93 116, 97 130 C100 144, 94 158, 87 170 C97 166, 103 154, 105 140 C107 124, 104.5 104, 105.5 92 Z"
          fill="url(#sirene-cheveux)"
        />
        <path d="M101 88 C97 104, 97 120, 99 132" fill="none" stroke="#8f9bbd" strokeOpacity="0.6" />
      </g>
      <g className="sirene-meche droite">
        <path
          d="M138 80 C145 100, 148 120, 146 136 C144 154, 150 170, 159 182 C147 180, 140 166, 138 150 C136 132, 135.5 106, 135 92 Z"
          fill="url(#sirene-cheveux)"
        />
        <path d="M140 90 C143 108, 143 126, 141 142" fill="none" stroke="#8f9bbd" strokeOpacity="0.6" />
        <path d="M143 100 C145 116, 145 130, 144 140" fill="none" stroke="#ffffff" strokeOpacity="0.7" />
      </g>

      {/* Bandeau de perles, perles blanches et jais alternées */}
      {BANDEAU.map(([x, y], i) => (
        <circle key={x} cx={x} cy={y} r={i % 2 ? 1.1 : 1.45} fill={i % 2 ? '#2a2530' : '#fbf8f0'} stroke="#8d8494" strokeWidth="0.3" />
      ))}
      {/* Étoile de mer rouge, piquée de points clairs */}
      <g transform="translate(104 60) rotate(-18)">
        <path d={ETOILE} fill="#d8352a" stroke="#d8352a" strokeWidth="2" strokeLinejoin="round" />
        <path d={ETOILE} fill="none" stroke="#8e1a14" strokeOpacity="0.5" strokeWidth="0.6" strokeLinejoin="round" />
        {[0, 1, 2, 3, 4].map((k) => {
          const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5
          return <circle key={k} cx={5.4 * Math.cos(a)} cy={5.4 * Math.sin(a)} r="0.9" fill="#ffb39e" />
        })}
        <circle r="1.4" fill="#ffb39e" />
      </g>
    </g>
  )
}

// Un bras en deux segments arrondis, épaule-coude puis coude-poignet, avec un
// reflet sur le dessus pour lui donner du volume.
function Bras({ haut, bas }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={haut} stroke="#ecc9b4" strokeWidth="10" />
      <path d={bas} stroke="#ecc9b4" strokeWidth="8" />
      <path d={haut} stroke="#f9e6da" strokeOpacity="0.7" strokeWidth="2.6" />
      <path d={bas} stroke="#f9e6da" strokeOpacity="0.7" strokeWidth="2.2" />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Le Skull King                                                       */
/* ------------------------------------------------------------------ */

// Le Skull King de la carte : tricorne noir galonné d'or, dreadlocks à
// perles, barbe tressée, sabres croisés dans le dos. Ici en crâne, les
// orbites allumées comme deux braises.

// Une cutlass, dessinée pointe en haut, poignée à l'origine. Chaque sabre est
// ensuite placé par un groupe extérieur : l'animation vit sur le groupe
// intérieur, sans quoi elle écraserait le placement.
function Sabre() {
  return (
    <g>
      {/* Lame courbe, et son fil qui accroche la lumière */}
      <path
        d="M-6 0 C-8 -90, -4 -200, 16 -310 C6 -236, 8 -120, 6 0 Z"
        fill="url(#sk-acier)"
      />
      <path
        d="M4 -6 C4 -110, 5 -220, 14 -298"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.7"
        strokeWidth="1.2"
      />
      <path className="sk-reflet" d="M-4 -40 C-6 -110, -2 -200, 14 -300" fill="none" stroke="#fff4d6" strokeWidth="3" strokeLinecap="round" />
      {/* Garde et coquille de laiton */}
      <path d="M-18 0 L18 0 C20 4, 18 8, 14 8 L-14 8 C-18 8, -20 4, -18 0 Z" fill="url(#sk-or)" />
      <path d="M15 6 C30 18, 26 42, 6 48" fill="none" stroke="url(#sk-or)" strokeWidth="3.4" strokeLinecap="round" />
      {/* Poignée gainée de cuir, et son pommeau */}
      <rect x="-4.5" y="8" width="9" height="36" rx="2" fill="#3a2416" />
      <g stroke="#1c110a" strokeWidth="1.3">
        {[14, 21, 28, 35].map((y) => (
          <line key={y} x1="-4.5" y1={y} x2="4.5" y2={y + 3} />
        ))}
      </g>
      <circle cx="0" cy="48" r="5.5" fill="url(#sk-or)" stroke="#6b4510" strokeWidth="1" />
    </g>
  )
}

// Dreadlocks, côté gauche ; le côté droit en est le reflet. Chaque mèche porte
// sa perle ou son anneau d'or près de la pointe.
const DREADS = [
  { d: 'M60 106 C46 140, 50 178, 38 218', perle: [40, 204], couleur: '#c9a13a' },
  { d: 'M68 112 C58 152, 64 190, 54 238', perle: [55, 224], couleur: '#8e1f18' },
  { d: 'M76 118 C70 162, 76 198, 68 254', perle: [68, 240], couleur: '#c9a13a' },
]

function Dreads({ miroir }) {
  return (
    <g transform={miroir ? 'translate(240 0) scale(-1 1)' : undefined}>
      <g className={`sk-dreads${miroir ? ' droite' : ''}`}>
        {DREADS.map((m, i) => (
          <g key={i}>
            <path d={m.d} fill="none" stroke="#1f140d" strokeWidth="9" strokeLinecap="round" />
            {/* Torsade : un pointillé plus clair par-dessus la mèche */}
            <path
              d={m.d}
              fill="none"
              stroke="#4b3322"
              strokeWidth="6"
              strokeDasharray="3 4"
              strokeLinecap="round"
            />
            <rect
              x={m.perle[0] - 6}
              y={m.perle[1] - 4}
              width="12"
              height="8"
              rx="3"
              fill={m.couleur}
              stroke="#2a1508"
              strokeWidth="1"
            />
          </g>
        ))}
      </g>
    </g>
  )
}

// Spirale d'hypnose, pour les yeux du Skull King envoûté
const SPIRALE = Array.from({ length: 61 }, (_, i) => {
  const a = (i / 60) * 4 * Math.PI
  const r = 0.8 + a * 0.75
  return `${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`
}).join(' ')

// Orbite en colère : le haut plonge vers le nez. Tracée à gauche, reflétée à
// droite ; la braise est posée au fond, avec son éclat de lentille. La
// spirale et la fumée ne servent que quand la sirène l'envoûte.
function Orbite({ miroir }) {
  return (
    <g transform={miroir ? 'translate(240 0) scale(-1 1)' : undefined}>
      <path
        d="M72 158 C73 147, 90 146, 112 161 C114 177, 106 191, 92 191 C78 191, 70 177, 72 158 Z"
        fill="#0d0504"
      />
      <g transform="translate(94 172)">
        <g className="sk-oeil">
          <circle r="17" fill="#ff3d00" fillOpacity="0.55" filter="url(#sk-flou)" />
          <circle r="10" fill="url(#sk-braise)" />
          {/* Pupille fendue, comme une flamme debout */}
          <path d="M0 -7 C2.4 -3, 2.4 3, 0 7 C-2.4 3, -2.4 -3, 0 -7 Z" fill="#fffbe0" />
        </g>
        <g className="sk-envoute">
          <circle r="14" fill="#2de0c8" fillOpacity="0.45" filter="url(#sk-flou)" />
          <path d={SPIRALE} fill="none" stroke="#8ffff0" strokeWidth="2.2" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.9s" repeatCount="indefinite" />
          </path>
        </g>
        <ellipse className="sk-eclat" rx="46" ry="1.6" fill="#ffe6a8" />
        <g className="sk-fumee" fill="#d9d2c8" filter="url(#sk-flou)">
          <circle cx="-4" cy="-8" r="7" />
          <circle cx="5" cy="-14" r="6" />
        </g>
      </g>
      {/* Arcade sourcilière : un bourrelet d'os qui écrase l'orbite */}
      <path
        d="M62 150 C78 136, 100 142, 118 158 L113 166 C98 152, 82 146, 68 157 Z"
        fill="url(#sk-os-patine)"
      />
      <path d="M68 157 C82 146, 98 152, 113 166" fill="none" stroke="#3b2816" strokeWidth="2" strokeOpacity="0.8" />
    </g>
  )
}

// Bas de chaque dent du haut, de gauche à droite : les crocs descendent
// plus bas que les autres, par-dessus la rangée du bas.
const DENTS_HAUT = [246, 236, 0, 238, 235, 237, 234, 246]

// La tête entière, du bout des dreads à la pointe du tricorne, centrée sur
// x = 120. Elle sert à la fois au rire et à l'envoûtement.
function TeteSkullKing() {
  return (
    <>
      <Dreads />
      <Dreads miroir />

      {/* Crâne, bordé d'un liseré orange : le feu derrière lui */}
      <path
        d="M58 150 C56 108, 86 92, 120 92 C154 92, 184 108, 182 150
           C182 176, 176 192, 168 204 C163 214, 161 222, 160 232 L80 232
           C79 222, 77 214, 72 204 C64 192, 58 176, 58 150 Z"
        fill="url(#sk-os-patine)"
        stroke="#ff7a1a"
        strokeOpacity="0.55"
        strokeWidth="2.5"
      />
      {/* Creux des tempes et des joues, sous les pommettes */}
      <g fill="#5a3f22" fillOpacity="0.35">
        <path d="M60 160 C62 184, 70 200, 80 212 C78 196, 72 182, 72 164 Z" />
        <path d="M180 160 C178 184, 170 200, 160 212 C162 196, 168 182, 168 164 Z" />
        <path d="M90 198 C98 206, 104 214, 106 226 L96 226 C94 214, 92 206, 90 198 Z" />
        <path d="M150 198 C142 206, 136 214, 134 226 L144 226 C146 214, 148 206, 150 198 Z" />
      </g>
      <g fill="none" stroke="#6e4f2c" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7">
        <path d="M68 190 C78 199, 92 201, 104 196" />
        <path d="M172 190 C162 199, 148 201, 136 196" />
      </g>

      <Orbite />
      <Orbite miroir />

      {/* Cavité nasale, en cœur renversé */}
      <path
        d="M120 186 C113 194, 109 204, 112 211 C115 209, 118 207, 120 207
           C122 207, 125 209, 128 211 C131 204, 127 194, 120 186 Z"
        fill="#0d0504"
      />

      {/* Fêlures : une qui descend de la tempe, une sous l'œil gauche */}
      <g fill="none" stroke="#3b2816" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M166 124 L158 138 L165 146 L154 160" />
        <path d="M165 146 L176 150" />
        <path d="M86 192 L82 204 L88 212 L84 222" />
      </g>

      {/* Gorge, visible quand la mâchoire tombe */}
      <path d="M82 222 L158 222 L158 268 C140 274, 100 274, 82 268 Z" fill="#120605" />
      {/* Dents du haut, jaunies et inégales : deux crocs aux coins, une
          en or, une qui manque */}
      <g stroke="#3a2616" strokeWidth="0.9">
        {DENTS_HAUT.map((bas, i) => {
          const x = 86 + i * 8.6
          if (i === 2) return null
          const croc = i === 0 || i === 7
          return (
            <path
              key={i}
              d={
                croc
                  ? `M${x} 224 L${x + 7.6} 224 L${x + 3.8} ${bas} Z`
                  : `M${x} 224 L${x + 7.6} 224 L${x + 7} ${bas} C${x + 5} ${bas + 3}, ${x + 2.6} ${bas + 3}, ${x + 0.6} ${bas} Z`
              }
              fill={i === 5 ? 'url(#sk-or)' : i % 2 ? '#dccb9f' : '#e9dbb6'}
            />
          )
        })}
        <path d="M113 226 L111 231 L114 234" fill="none" strokeWidth="0.8" />
      </g>

      {/* Mâchoire, barbe comprise : c'est elle qui ricane */}
      <g className="capture-machoire">
        {/* Barbe hirsute, sous la mandibule */}
        <path
          d="M76 244 C80 276, 100 294, 120 296 C140 294, 160 276, 164 244
             C156 262, 140 272, 120 272 C100 272, 84 262, 76 244 Z"
          fill="#1f140d"
        />
        <g fill="none" stroke="#3d2a1c" strokeWidth="1.6" strokeLinecap="round">
          <path d="M88 268 L84 282 M98 278 L96 292 M142 278 L144 292 M152 268 L156 282" />
        </g>
        {/* Deux tresses, cerclées d'or */}
        {[110, 130].map((x, t) => (
          <g key={x}>
            {[0, 1, 2, 3].map((k) => (
              <ellipse
                key={k}
                cx={x + (t ? 1 : -1) * k * 1.2}
                cy={294 + k * 8}
                rx="5.5"
                ry="5"
                fill={k % 2 ? '#2b1c12' : '#3a2719'}
                stroke="#150d08"
                strokeWidth="1"
              />
            ))}
            <rect
              x={x + (t ? 1 : -1) * 4 - 6}
              y="322"
              width="12"
              height="7"
              rx="2"
              fill="url(#sk-or)"
              stroke="#6b4510"
              strokeWidth="0.8"
            />
          </g>
        ))}
        {/* Mandibule */}
        <path
          d="M80 232 L81 250 C83 266, 98 277, 112 279 L128 279 C142 277, 157 266, 159 250 L160 232 Z"
          fill="url(#sk-os-patine)"
          stroke="#ff7a1a"
          strokeOpacity="0.4"
          strokeWidth="2"
        />
        <g stroke="#3a2616" strokeWidth="0.9" fill="#e6d7b3">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M${90 + i * 8.6} 243 L${97.6 + i * 8.6} 243 L${97 + i * 8.6} 233 C${95 + i * 8.6} 230.5, ${92.6 + i * 8.6} 230.5, ${90.6 + i * 8.6} 233 Z`}
            />
          ))}
        </g>
        <path d="M92 258 C104 266, 136 266, 148 258" fill="none" stroke="#6e4f2c" strokeWidth="2" strokeOpacity="0.6" />
      </g>

      {/* Ombre du bord du chapeau sur le haut du crâne */}
      <path
        d="M58 118 C80 126, 100 134, 120 146 C140 134, 160 126, 182 118 L182 136 C160 142, 140 150, 120 160 C100 150, 80 142, 58 136 Z"
        fill="#000000"
        fillOpacity="0.35"
      />

      {/* Tricorne : calotte, bandeau rouge, bord relevé galonné d'or */}
      <path d="M64 106 C58 60, 86 28, 120 28 C154 28, 182 60, 176 106 Z" fill="url(#sk-cuir)" />
      <path d="M80 50 C92 38, 108 34, 120 34" fill="none" stroke="#6a5446" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M66 94 C92 86, 148 86, 174 94 L176 106 L64 106 Z" fill="#6b1510" />
      <path
        d="M2 60 C18 86, 56 100, 92 104 L148 104 C184 100, 222 86, 238 60
           C234 96, 206 118, 172 122 C152 124, 134 130, 120 140
           C106 130, 88 124, 68 122 C34 118, 6 96, 2 60 Z"
        fill="url(#sk-cuir)"
      />
      <path
        d="M2 60 C6 96, 34 118, 68 122 C88 124, 106 130, 120 140
           C134 130, 152 124, 172 122 C206 118, 234 96, 238 60"
        fill="none"
        stroke="url(#sk-or)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Emblème : tête de mort et sabres croisés, en or */}
      <g transform="translate(120 72)">
        <g stroke="url(#sk-or)" strokeWidth="3" strokeLinecap="round">
          <line x1="-17" y1="-15" x2="17" y2="15" />
          <line x1="17" y1="-15" x2="-17" y2="15" />
        </g>
        <path d="M-10 -1 C-10 -10, -5 -14, 0 -14 C5 -14, 10 -10, 10 -1 C10 4, 7 6, 6 8 L-6 8 C-7 6, -10 4, -10 -1 Z" fill="url(#sk-or)" stroke="#6b4510" strokeWidth="1" />
        <circle cx="-4" cy="-3" r="2.8" fill="#8e1f18" />
        <circle cx="4" cy="-3" r="2.8" fill="#8e1f18" />
        <path d="M0 1 L-1.6 4.5 L1.6 4.5 Z" fill="#3a2410" />
        <path d="M-4 10 L4 10" stroke="#6b4510" strokeWidth="1.2" />
      </g>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Scène 1 — le Skull King prend un pirate                             */
/* ------------------------------------------------------------------ */

// Déroulé (2,6 s) : les sabres se croisent, le crâne tombe dessus et fait
// trembler l'écran, les yeux s'embrasent, puis il éclate de rire, sur fond de
// port en flammes.

// Braises qui montent du brasier : positions figées, pour que la scène soit la
// même d'une capture à l'autre.
const BRAISES = Array.from({ length: 18 }, (_, i) => ({
  x: 14 + ((i * 53) % 212),
  y: 250 + ((i * 29) % 60),
  r: 1.2 + ((i * 7) % 5) * 0.45,
  dx: ((i * 37) % 60) - 30,
  dy: -(180 + ((i * 41) % 120)),
  retard: ((i * 173) % 1500) / 1000,
  duree: 1.3 + ((i * 11) % 9) / 10,
}))

// Rayons du brasier, derrière la tête
const RAYONS = Array.from({ length: 14 }, (_, i) => i * (360 / 14))

function SkullKingRit() {
  return (
    <g className="sk-secousse">
      {/* Brasier : halo, rayons qui tournent lentement */}
      <circle cx="120" cy="170" r="150" fill="url(#sk-halo)" className="sk-halo" />
      <g transform="translate(120 170)">
        <g className="sk-rayons">
          {RAYONS.map((a) => (
            <path key={a} d="M-7 0 L7 0 L22 -240 L-22 -240 Z" transform={`rotate(${a})`} fill="#ff8a2a" fillOpacity="0.1" />
          ))}
        </g>
      </g>

      {/* Sabres croisés, qui jaillissent des coins avant le crâne */}
      <g transform="translate(210 286) rotate(-35)">
        <g className="sk-sabre">
          <Sabre />
        </g>
      </g>
      <g transform="translate(30 286) scale(-1 1) rotate(-35)">
        <g className="sk-sabre">
          <Sabre />
        </g>
      </g>

      {/* Onde de choc de l'impact */}
      <circle cx="120" cy="175" r="70" className="sk-onde" fill="none" stroke="#ffb347" strokeWidth="5" />

      <g className="sk-tete">
        <g className="sk-rire">
          <TeteSkullKing />
        </g>
      </g>

      {/* Braises qui s'envolent devant tout le reste */}
      <g>
        {BRAISES.map((b, i) => (
          <circle
            key={i}
            className="sk-braise"
            cx={b.x}
            cy={b.y}
            r={b.r}
            fill={i % 3 ? '#ffb347' : '#ff5a1f'}
            style={{
              '--dx': `${b.dx}px`,
              '--dy': `${b.dy}px`,
              animationDelay: `${b.retard}s`,
              animationDuration: `${b.duree}s`,
            }}
          />
        ))}
      </g>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Scène 2 — la sirène capturée par un pirate                          */
/* ------------------------------------------------------------------ */

// La herse tombe, l'eau tremble, un nuage de sable se soulève, et la sirène
// s'agrippe aux barreaux. Le visage, centré sur x = 120, tient pile entre les
// deux barreaux du milieu : aucun ne le barre.
const BARREAUX = [5, 51, 97, 143, 189, 235]
const TRAVERSES = [18, 200]

// Bulles chassées par la herse quand elle touche le fond
const BULLES_CHOC = Array.from({ length: 12 }, (_, i) => ({
  x: 8 + i * 20 + ((i * 7) % 9),
  r: 1.4 + ((i * 5) % 4) * 0.6,
  dx: ((i * 13) % 20) - 10,
  dy: -(50 + ((i * 29) % 70)),
  retard: 0.88 + ((i * 37) % 12) / 100,
}))

function BrasAgrippe({ miroir }) {
  return (
    <g transform={miroir ? 'translate(240 0) scale(-1 1)' : undefined}>
      <Bras haut="M86 144 C77 154, 69 165, 64 178" bas="M64 178 C59 171, 55 162, 52 154" />
      <ellipse cx="51" cy="149" rx="4.6" ry="5.6" fill="#ecc9b4" />
    </g>
  )
}

// Les doigts passent devant le barreau : ils ne se referment qu'une fois la
// herse tombée.
function Doigts({ miroir }) {
  return (
    <g transform={miroir ? 'translate(240 0) scale(-1 1)' : undefined}>
      {[142.5, 146.2, 149.9, 153.6].map((y) => (
        <rect key={y} x="45" y={y} width="12" height="3.4" rx="1.7" fill="#ecc9b4" stroke="#c3917c" strokeWidth="0.5" />
      ))}
      <ellipse cx="45.6" cy="156.4" rx="2" ry="3" fill="#ecc9b4" stroke="#c3917c" strokeWidth="0.5" />
    </g>
  )
}

function SireneEmprisonnee() {
  return (
    <g className="fer-secousse">
      <g className="fer-sursaut">
        <Sirene
          humeur="inquiete"
          regard={[0, -0.7]}
          bras={
            <>
              <BrasAgrippe />
              <BrasAgrippe miroir />
            </>
          }
        />
      </g>

      {/* La herse : barreaux, traverses rivetées, pointes */}
      <g className="capture-herse">
        <g stroke="url(#herse-fer)" strokeWidth="9" strokeLinecap="butt">
          {BARREAUX.map((x) => (
            <line key={x} x1={x} y1="-30" x2={x} y2="272" />
          ))}
        </g>
        <g stroke="#dfe5e9" strokeOpacity="0.35" strokeWidth="1.4">
          {BARREAUX.map((x) => (
            <line key={x} x1={x - 2.6} y1="-30" x2={x - 2.6} y2="272" />
          ))}
        </g>
        <g stroke="url(#herse-fer)" strokeWidth="13">
          {TRAVERSES.map((y) => (
            <line key={y} x1="-6" y1={y} x2="246" y2={y} />
          ))}
        </g>
        <g fill="#454e55" stroke="#9aa4ab" strokeWidth="0.8">
          {TRAVERSES.flatMap((y) => BARREAUX.map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.4" />))}
        </g>
        <g fill="url(#herse-fer)">
          {BARREAUX.map((x) => (
            <path key={x} d={`M${x - 9} 272 L${x + 9} 272 L${x} 298 Z`} />
          ))}
        </g>
      </g>

      <g className="fer-doigts">
        <Doigts />
        <Doigts miroir />
      </g>

      {/* Sable soulevé et bulles chassées par l'impact */}
      <g fill="#b9a98a">
        {[20, 80, 140, 200].map((x, i) => (
          <ellipse key={x} className="fer-poussiere" cx={x + 10} cy="300" rx="26" ry="9" fillOpacity={0.35 + (i % 2) * 0.15} />
        ))}
      </g>
      {BULLES_CHOC.map((b, i) => (
        <circle
          key={i}
          className="fer-bulle"
          cx={b.x}
          cy="292"
          r={b.r}
          fill="url(#mer-bulle)"
          stroke="#e8fbff"
          strokeOpacity="0.6"
          strokeWidth="0.6"
          style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, animationDelay: `${b.retard}s` }}
        />
      ))}
    </g>
  )
}

function FondPrison() {
  return <FondMarin x={0} y={0} l={240} h={300} />
}

/* ------------------------------------------------------------------ */
/* Scène 3 — le Skull King capturé par la sirène                       */
/* ------------------------------------------------------------------ */

// Elle joue de la harpe et tend la main vers lui. Les notes filent jusqu'au
// Skull King, une portée d'or le ceinture comme une corde, ses braises
// s'éteignent dans un filet de fumée et laissent place à deux spirales : il
// est envoûté, mâchoire pendante, et coule doucement.
//
// Le cadre est élargi (voir « vue ») pour loger le Skull King en haut à
// droite, sans le coller à la chevelure.

// La harpe se tient debout à côté d'elle, sur son propre pied, sans toucher
// le buste : c'est le bras qui va vers les cordes, pas la harpe qui se glisse
// sous le bras. Harpe celtique : colonne légèrement cintrée à l'extérieur,
// console en S, caisse de résonance qui s'évase vers le bas.

// Cordes : elles courent de la console à la caisse, et se raccourcissent à
// mesure que les deux se rejoignent vers la droite.
const CORDES = Array.from({ length: 9 }, (_, i) => {
  const t = 0.06 + (i / 8) * 0.8
  const lerp = (a, b) => a + (b - a) * t
  return { x1: lerp(17, 53), y1: lerp(178, 203), x2: lerp(31, 57), y2: lerp(274, 209) }
})

function Harpe() {
  return (
    <g className="capture-harpe">
      <path d="M-2 280 L50 280 L48 288 L0 288 Z" fill="#8a5e15" />
      {/* Caisse, avec ses ouïes */}
      <path d="M28 284 L46 284 L67 207 L57 202 Z" fill="url(#harpe-or)" stroke="#6e4a10" strokeWidth="0.8" />
      {[
        [43.25, 264],
        [49.5, 244],
        [55.75, 224],
      ].map(([x, y]) => (
        <ellipse key={y} cx={x} cy={y} rx="1.6" ry="2.4" transform={`rotate(17 ${x} ${y})`} fill="#5a3a0c" />
      ))}
      {/* Colonne, et ses perles */}
      <path d="M3 282 L15 282 C13 248, 10 210, 15 176 L5 172 C0 210, 2 248, 3 282 Z" fill="url(#harpe-or)" stroke="#6e4a10" strokeWidth="0.8" />
      {[
        [9, 192],
        [8, 210],
        [8, 228],
        [8.5, 246],
        [9.5, 264],
      ].map(([x, y]) => (
        <circle key={y} cx={x} cy={y} r="1.4" fill="#fbf8f0" />
      ))}
      {/* Console en S, volute en tête de colonne */}
      <path
        d="M2 172 C12 154, 38 162, 50 180 C54 188, 58 196, 64 202 L57 209 C51 203, 46 195, 42 187 C32 172, 17 168, 11 180 Z"
        fill="url(#harpe-or)"
        stroke="#6e4a10"
        strokeWidth="0.8"
      />
      <circle cx="6" cy="172" r="5.5" fill="url(#harpe-or)" stroke="#6e4a10" strokeWidth="0.8" />
      <circle cx="6" cy="172" r="2.2" fill="#6e4a10" fillOpacity="0.5" />
      <g className="mer-cordes" stroke="#fbf1d0" strokeOpacity="0.9" strokeWidth="0.9">
        {CORDES.map((c, i) => (
          <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} />
        ))}
      </g>
      {/* Chevilles, en tête de chaque corde */}
      <g fill="#6e4a10">
        {CORDES.map((c, i) => (
          <circle key={i} cx={c.x1} cy={c.y1} r="0.9" />
        ))}
      </g>
    </g>
  )
}

function BrasHarpiste() {
  return (
    <>
      <Harpe />
      {/* La main gauche : le bras tombe le long du corps, l'avant-bras passe
          par-dessus la console et les doigts pincent les cordes */}
      <Bras haut="M86 144 C82 156, 77 168, 73 180" bas="M73 180 C64 192, 54 202, 45 210" />
      <ellipse cx="41" cy="213" rx="4" ry="5" transform="rotate(50 41 213)" fill="#ecc9b4" />
      <path
        d="M38 210 L32 207 M37 213.5 L31 212.5 M38 217 L32.5 218.5 M43.5 209 L41 204"
        stroke="#ecc9b4"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* La droite se tend vers le Skull King, doigts écartés */}
      <Bras haut="M154 144 C164 140, 172 134, 178 128" bas="M178 128 C182 122, 184 116, 185 110" />
      <ellipse cx="186" cy="105" rx="4" ry="5" transform="rotate(20 186 105)" fill="#ecc9b4" />
      <path
        d="M184.5 101 L182 94 M187 100.5 L186.8 92.5 M189.6 101.4 L191.6 94 M191.4 104 L196 99.4 M183 107 L178 103.5"
        stroke="#ecc9b4"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  )
}

// Une croche, dessinée autour de l'origine
function Croche() {
  return (
    <>
      <ellipse cx="0" cy="18" rx="11" ry="8" transform="rotate(-20)" />
      <rect x="8" y="-22" width="4" height="38" rx="2" />
      <path d="M12 -22 C24 -18, 28 -8, 24 2 C26 -8, 20 -14, 12 -12 Z" />
    </>
  )
}

// Notes du chant : elles partent de sa main tendue ou de sa bouche et filent
// vers le Skull King.
const NOTES_CHANT = [
  { x: 188, y: 96, dx: 18, dy: -56, retard: 0.36, s: 0.42, r: -10 },
  { x: 188, y: 96, dx: 36, dy: -30, retard: 0.56, s: 0.34, r: 14 },
  { x: 124, y: 104, dx: 70, dy: -86, retard: 0.46, s: 0.36, r: 8 },
  { x: 188, y: 96, dx: 4, dy: -80, retard: 0.8, s: 0.38, r: -6 },
  { x: 188, y: 96, dx: 28, dy: -66, retard: 1.02, s: 0.32, r: -14 },
  { x: 124, y: 104, dx: 58, dy: -52, retard: 1.16, s: 0.3, r: 6 },
  { x: 188, y: 96, dx: 40, dy: -48, retard: 1.3, s: 0.36, r: 10 },
]

// Petites étoiles d'enchantement au bout des doigts
const ETINCELLES = [
  { x: 190, y: 90, retard: 0.3 },
  { x: 198, y: 97, retard: 0.55 },
  { x: 183, y: 88, retard: 0.8 },
  { x: 195, y: 84, retard: 1.05 },
]

// Portée de musique qui ceinture le Skull King comme une corde : la moitié
// arrière passe derrière la tête, la moitié avant par-dessus. Les deux se
// tracent l'une après l'autre, et la corde se referme.
function Portee({ cy, rx, ry, cote }) {
  return (
    <g transform={`rotate(-8 120 ${cy})`}>
      <g className={`mer-portee ${cote}`} fill="none" stroke="#f3d27a" strokeWidth="3">
        {[-10, -5, 0, 5, 10].map((dy) => (
          <path
            key={dy}
            pathLength="100"
            d={
              cote === 'arriere'
                ? `M${120 - rx} ${cy + dy} A${rx} ${ry} 0 0 1 ${120 + rx} ${cy + dy}`
                : `M${120 + rx} ${cy + dy} A${rx} ${ry} 0 0 1 ${120 - rx} ${cy + dy}`
            }
          />
        ))}
      </g>
    </g>
  )
}

// Bulles lâchées par la bouche du Skull King quand il coule
const BULLES_SK = Array.from({ length: 6 }, (_, i) => ({
  x: 108 + ((i * 11) % 26),
  r: 4 + ((i * 5) % 3) * 2,
  dx: ((i * 17) % 30) - 15,
  dy: -(90 + ((i * 23) % 80)),
  retard: 1.35 + i * 0.16,
}))

// Placement du Skull King dans la scène : réduit, en haut à droite
const PLACE_SK = 'translate(206 26) scale(0.42) translate(-120 -170)'

function SireneQuiChante() {
  return (
    <g>
      <Sirene humeur="rusee" regard={[1.1, -0.9]} bras={<BrasHarpiste />} />

      {ETINCELLES.map((e, i) => (
        <g key={i} transform={`translate(${e.x} ${e.y})`}>
          <path
            className="mer-etincelle"
            style={{ animationDelay: `${e.retard}s` }}
            d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z"
            fill="#e9fff9"
          />
        </g>
      ))}

      <g transform={PLACE_SK}>
        <g className="mer-sk">
          <Portee cy={104} rx={86} ry={18} cote="arriere" />
          <Portee cy={288} rx={60} ry={12} cote="arriere" />
          <TeteSkullKing />
          <Portee cy={104} rx={86} ry={18} cote="avant" />
          <Portee cy={288} rx={60} ry={12} cote="avant" />
          {/* Notes posées sur la portée, une fois la corde refermée */}
          <g className="mer-portee-notes" fill="#f3d27a">
            {[
              [88, 128, -12],
              [132, 132, 8],
              [100, 306, -6],
              [140, 302, 10],
            ].map(([x, y, r]) => (
              <g key={x} transform={`translate(${x} ${y}) rotate(${r}) scale(0.55)`}>
                <Croche />
              </g>
            ))}
          </g>
          {BULLES_SK.map((b, i) => (
            <circle
              key={i}
              className="mer-bulle-sk"
              cx={b.x}
              cy="262"
              r={b.r}
              fill="url(#mer-bulle)"
              stroke="#e8fbff"
              strokeOpacity="0.7"
              strokeWidth="1.2"
              style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, animationDelay: `${b.retard}s` }}
            />
          ))}
        </g>
      </g>

      {/* Notes du chant, devant tout le reste. Le placement reste sur le
          groupe extérieur : une transformation CSS d'animation écraserait
          l'attribut « transform » du même élément. */}
      <g fill="#f3d27a">
        {NOTES_CHANT.map((n, i) => (
          <g key={i} transform={`translate(${n.x} ${n.y})`}>
            <g className="mer-note" style={{ '--dx': `${n.dx}px`, '--dy': `${n.dy}px`, animationDelay: `${n.retard}s` }}>
              <g transform={`scale(${n.s}) rotate(${n.r})`}>
                <Croche />
              </g>
            </g>
          </g>
        ))}
      </g>
    </g>
  )
}

const POISSONS_MER = [
  { x: 6, y: -24, echelle: 1.1, trajet: 60, sens: 1 },
  { x: 250, y: 176, echelle: 0.9, trajet: 50, sens: -1 },
  { x: -2, y: 140, echelle: 0.75, trajet: 40, sens: 1 },
  { x: 180, y: 250, echelle: 0.8, trajet: 36, sens: -1 },
]

function FondChant() {
  return <FondMarin x={-8} y={-44} l={280} h={350} poissons={POISSONS_MER} />
}

/* ------------------------------------------------------------------ */
/* La scène                                                            */
/* ------------------------------------------------------------------ */

const SCENES = {
  // skullking.mp3 : un grondement, puis le grand « HA » 0,75 s après le
  // départ du son. Lancé à 0,25 s, le grondement enfle pendant la chute du
  // crâne et le rire éclate juste après l'embrasement des yeux ; la mâchoire
  // suit chacun de ses éclats (voir styles.css).
  pirateParSk: {
    titre: 'Pirate capturé !',
    dessin: SkullKingRit,
    teinte: 'braise',
    duree: 2900,
    son: { nom: 'skullking', a: 250 },
  },
  // pirate.mp3 : le fracas culmine 0,41 s après le départ du son. Lancé à
  // 0,47 s, il tombe pile quand la herse touche le fond (0,88 s).
  sireneParPirate: {
    titre: 'Sirène capturée !',
    dessin: SireneEmprisonnee,
    fond: FondPrison,
    teinte: 'fer',
    duree: 2400,
    son: { nom: 'pirate', a: 470 },
  },
  skParSirene: {
    titre: 'Skull King capturé !',
    dessin: SireneQuiChante,
    fond: FondChant,
    teinte: 'mer',
    duree: 2800,
    vue: '-8 -44 280 350',
    son: { nom: 'sirene', a: 0 },
  },
}

export const CAPTURES = Object.keys(SCENES)

export default function AnimationCapture({ type, onFini }) {
  const sansAnimation = mouvementReduit()
  const scene = SCENES[type]

  // onFini change à chaque rendu du parent : le garder hors des dépendances,
  // sinon le moindre rendu relancerait les minuteurs — et rejouerait le son.
  const finir = useRef(onFini)
  finir.current = onFini

  useEffect(() => {
    if (!scene) {
      finir.current()
      return undefined
    }
    // Sans animation, le son part tout de suite : il n'a rien à attendre.
    if (sansAnimation) {
      jouerSon(scene.son.nom)
      finir.current()
      return undefined
    }
    preparerSon(scene.son.nom)
    const top = setTimeout(() => jouerSon(scene.son.nom), Math.max(0, scene.son.a - AVANCE_SON))
    const fin = setTimeout(() => finir.current(), scene.duree || DUREE)
    return () => {
      clearTimeout(top)
      clearTimeout(fin)
    }
  }, [sansAnimation, scene])

  if (!scene || sansAnimation) return null

  const Dessin = scene.dessin
  const Fond = scene.fond

  return (
    <div
      className={`capture-scene ${scene.teinte}`}
      style={{ '--duree': `${scene.duree || DUREE}ms`, '--son': `${scene.son.a}ms` }}
      role="presentation"
    >
      <svg className="capture-dessin" viewBox={scene.vue || '0 0 240 300'} aria-hidden="true">
        <defs>
          <linearGradient id="sk-or" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6da8e" />
            <stop offset="100%" stopColor="#b07f22" />
          </linearGradient>
          {/* Os patiné : clair sur le front, bruni vers la mâchoire */}
          <linearGradient id="sk-os-patine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f1e4c3" />
            <stop offset="60%" stopColor="#cdb07a" />
            <stop offset="100%" stopColor="#8c6c3e" />
          </linearGradient>
          <linearGradient id="sk-cuir" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b2e26" />
            <stop offset="100%" stopColor="#120d0a" />
          </linearGradient>
          <linearGradient id="sk-acier" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7d878e" />
            <stop offset="50%" stopColor="#e9edf0" />
            <stop offset="100%" stopColor="#9aa3a9" />
          </linearGradient>
          <radialGradient id="sk-braise">
            <stop offset="0%" stopColor="#fff6c0" />
            <stop offset="35%" stopColor="#ffb000" />
            <stop offset="70%" stopColor="#ff4a00" />
            <stop offset="100%" stopColor="#a01000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sk-halo">
            <stop offset="0%" stopColor="#ff9a3c" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#d9420f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6b0f05" stopOpacity="0" />
          </radialGradient>
          <filter id="sk-flou" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" />
          </filter>

          {/* Sirène : peau, cheveux d'argent, iris bleu, corail, turquoise */}
          <radialGradient id="sirene-visage" cx="0.45" cy="0.4" r="0.7">
            <stop offset="0%" stopColor="#fcebe0" />
            <stop offset="60%" stopColor="#f2d4c2" />
            <stop offset="100%" stopColor="#ddb19c" />
          </radialGradient>
          <linearGradient id="sirene-peau" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8e6d9" />
            <stop offset="100%" stopColor="#e2bba5" />
          </linearGradient>
          <radialGradient id="sirene-joue">
            <stop offset="0%" stopColor="#ec8f88" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ec8f88" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sirene-iris">
            <stop offset="0%" stopColor="#a8e0f2" />
            <stop offset="55%" stopColor="#4d9cc8" />
            <stop offset="100%" stopColor="#1e4f74" />
          </radialGradient>
          <clipPath id="sirene-oeil-forme">
            <path d={OEIL_FORME} />
          </clipPath>
          <linearGradient id="sirene-cheveux" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbfcff" />
            <stop offset="45%" stopColor="#dfe4f0" />
            <stop offset="100%" stopColor="#aeb8d4" />
          </linearGradient>
          <linearGradient id="sirene-corail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef6c60" />
            <stop offset="55%" stopColor="#bf2c3c" />
            <stop offset="100%" stopColor="#7e1627" />
          </linearGradient>
          <linearGradient id="sirene-queue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5ad4bb" />
            <stop offset="45%" stopColor="#2a8f9a" />
            <stop offset="75%" stopColor="#1d5a78" />
            <stop offset="100%" stopColor="#14304a" />
          </linearGradient>
          {/* Nageoires translucides, irisées de mauve vers le bord */}
          <linearGradient id="sirene-nageoire" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7ef0d8" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#2a9fc0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8a6fd0" stopOpacity="0.45" />
          </linearGradient>
          {/* Écailles : deux rangs d'arcs décalés d'un demi-pas, posés en
              surimpression. Le motif se répète tout seul. */}
          <pattern
            id="trame-ecailles"
            x="0"
            y="0"
            width="17"
            height="15"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="#d9f6e4" strokeOpacity="0.32" strokeWidth="1.5">
              <path d="M-8.5 15 C-8.5 6, 8.5 6, 8.5 15" />
              <path d="M8.5 15 C8.5 6, 25.5 6, 25.5 15" />
              <path d="M0 7.5 C0 -1.5, 17 -1.5, 17 7.5" />
            </g>
            <g fill="none" stroke="#0e2a24" strokeOpacity="0.28" strokeWidth="1.5">
              <path d="M-8.5 16.4 C-8.5 7.4, 8.5 7.4, 8.5 16.4" />
              <path d="M8.5 16.4 C8.5 7.4, 25.5 7.4, 25.5 16.4" />
              <path d="M0 8.9 C0 -0.1, 17 -0.1, 17 8.9" />
            </g>
          </pattern>
          <linearGradient id="harpe-or" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f6da8e" />
            <stop offset="50%" stopColor="#c99a3a" />
            <stop offset="100%" stopColor="#7a5214" />
          </linearGradient>
          <linearGradient id="mer-rai" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8fbff" stopOpacity="0" />
            <stop offset="35%" stopColor="#e8fbff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#e8fbff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="mer-bulle" cx="0.35" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#bfefff" stopOpacity="0.08" />
          </radialGradient>
          {/* En coordonnées absolues : les barreaux sont des lignes, dont la
              boîte englobante est plate. Un dégradé en unités relatives ne s'y
              applique pas du tout et la herse resterait invisible. */}
          <linearGradient
            id="herse-fer"
            x1="0"
            y1="0"
            x2="0"
            y2="320"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#aab4bb" />
            <stop offset="45%" stopColor="#6d777e" />
            <stop offset="100%" stopColor="#333b42" />
          </linearGradient>
        </defs>

        {Fond && <Fond />}
        <g className="capture-sujet">
          <Dessin />
        </g>
      </svg>

      <p className="capture-titre">{scene.titre}</p>
    </div>
  )
}
