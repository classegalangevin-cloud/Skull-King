import { useEffect } from 'react'

import { mouvementReduit } from './mouvement.js'

// Animation jouée quand le Kraken est déclaré : la bête monte des profondeurs,
// déploie ses huit bras, ouvre deux yeux de braise sous des arcades plissées de
// colère, puis sa masse engloutit l'écran avant de se dissoudre.
//
// D'après une gravure de kraken, dans la chair rouge sombre de l'appli : peau
// tachetée, manteau énorme et ridé, bras enroulés en crosse à la pointe,
// ventouses dorées sur le dessous.

/* ------------------------------------------------------------------ */
/* Les bras                                                            */
/* ------------------------------------------------------------------ */

// Un bras est tracé en « tortue » : on avance pas à pas en faisant tourner le
// cap. « courbe » répartit une flexion douce sur toute la longueur, « boucle »
// la concentre vers la pointe (poids en 3t²), ce qui enroule le bout en crosse.
// Les deux bords relevés au passage donnent un ruban fuselé.
//
// Les ventouses et la bande claire du dessous suivent l'intérieur de la
// courbe, comme sur un vrai poulpe ; les taches sombres et le reflet, le dos.
function traceBras({ x, y, angle, longueur, epaisseur, courbe = 0, boucle = 0, segments = 40 }) {
  const pas = longueur / segments
  const rad = Math.PI / 180
  const sens = Math.sign(courbe + boucle) || 1
  let px = x
  let py = y
  let cap = angle * rad

  const gauche = []
  const droite = []
  const dessous = []
  const axe = []
  const dos = []
  const ventouses = []
  const taches = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const demi = (epaisseur / 2) * Math.pow(1 - 0.9 * t, 1.1)
    const nx = -Math.sin(cap)
    const ny = Math.cos(cap)
    // Côté intérieur de l'enroulement
    const ix = nx * sens
    const iy = ny * sens

    gauche.push([px + nx * demi, py + ny * demi])
    droite.push([px - nx * demi, py - ny * demi])
    dessous.push([px + ix * demi, py + iy * demi])
    axe.push([px + ix * demi * 0.05, py + iy * demi * 0.05])
    dos.push([px - ix * demi * 0.72, py - iy * demi * 0.72])

    // Deux rangées de ventouses en quinconce, qui rapetissent vers la pointe
    if (i % 2 === 1 && t < 0.94) {
      const decal = i % 4 === 1 ? 0.42 : 0.68
      ventouses.push({
        cx: px + ix * demi * decal,
        cy: py + iy * demi * decal,
        r: Math.max(0.9, demi * 0.26),
      })
    }
    if (i % 3 === 0 && t > 0.04 && t < 0.85) {
      taches.push({
        cx: px - ix * demi * 0.42,
        cy: py - iy * demi * 0.42,
        rx: demi * 0.3,
        ry: demi * 0.15,
        a: cap / rad,
      })
    }

    px += Math.cos(cap) * pas
    py += Math.sin(cap) * pas
    cap += ((courbe + boucle * 3 * t * t) * rad) / segments
  }

  // Talon arrondi : un demi-cercle vers l'arrière, pour que la racine du bras
  // ne se termine pas sur une coupe franche.
  const demi0 = epaisseur / 2
  const talon = Array.from({ length: 9 }, (_, k) => {
    const phi = angle * rad + Math.PI * 1.5 - (k * Math.PI) / 8
    return [x + Math.cos(phi) * demi0, y + Math.sin(phi) * demi0]
  })

  const chemin = (pts) => 'M' + pts.map(([X, Y]) => `${X.toFixed(1)} ${Y.toFixed(1)}`).join('L')
  return {
    d: chemin([...gauche, ...droite.reverse(), ...talon]) + 'Z',
    dessous: chemin([...dessous, ...axe.reverse()]) + 'Z',
    reflet: chemin(dos),
    ventouses,
    taches,
  }
}

// Un bras dessiné : peau, dessous clair, taches, reflet, puis les ventouses —
// un anneau orangé, un creux sombre, un éclat.
function Bras({ trace, peau, dessous }) {
  return (
    <g>
      <path d={trace.d} fill={`url(#${peau})`} stroke="#160605" strokeOpacity="0.7" strokeWidth="1" />
      <path d={trace.dessous} fill={`url(#${dessous})`} />
      {trace.taches.map((t, i) => (
        <ellipse
          key={i}
          cx={t.cx}
          cy={t.cy}
          rx={t.rx}
          ry={t.ry}
          transform={`rotate(${t.a.toFixed(1)} ${t.cx.toFixed(1)} ${t.cy.toFixed(1)})`}
          fill="#260a07"
          fillOpacity="0.4"
        />
      ))}
      <path d={trace.reflet} fill="none" stroke="#e8a07e" strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round" />
      {trace.ventouses.map((v, i) => (
        <g key={i}>
          <circle cx={v.cx} cy={v.cy} r={v.r} fill="#f0c890" stroke="#4a150c" strokeWidth="0.5" />
          <circle cx={v.cx} cy={v.cy} r={v.r * 0.52} fill="#6e1f14" />
          <circle cx={v.cx - v.r * 0.3} cy={v.cy - v.r * 0.3} r={v.r * 0.22} fill="#fff0d6" />
        </g>
      ))}
    </g>
  )
}

// Les huit bras de la scène : quatre à gauche, reflétés à droite. « arriere »
// passe derrière la tête, « avant » devant. Tous partent de sous les yeux :
//   un bras qui monte derrière le manteau et s'enroule au-dessus,
//   un qui se dresse sur le flanc, à côté de l'œil,
//   deux qui retombent devant, en crosse, dans les coins du bas.
// `retard` décale leur sortie.
const BRAS_GAUCHE = [
  { x: 150, y: 520, angle: -94, longueur: 440, epaisseur: 58, courbe: 50, boucle: -380, retard: 0.1, plan: 'arriere' },
  { x: 140, y: 540, angle: -140, longueur: 250, epaisseur: 48, courbe: 30, boucle: 300, retard: 0.2, plan: 'avant' },
  { x: 170, y: 566, angle: 160, longueur: 210, epaisseur: 54, courbe: -40, boucle: -280, retard: 0.05, plan: 'avant' },
  { x: 150, y: 546, angle: -178, longueur: 190, epaisseur: 46, courbe: -60, boucle: -280, retard: 0.24, plan: 'avant' },
]

const BRAS = [
  ...BRAS_GAUCHE,
  ...BRAS_GAUCHE.map((b) => ({
    ...b,
    x: 400 - b.x,
    angle: 180 - b.angle,
    courbe: -b.courbe,
    boucle: -b.boucle,
    retard: b.retard + 0.07,
  })),
].map((b) => ({ ...b, trace: traceBras(b) }))

const DUREE = 2400

/* ------------------------------------------------------------------ */
/* La tête                                                             */
/* ------------------------------------------------------------------ */

// Un manteau énorme en forme de sac, deux yeux saillants sur des bosses de
// chaque côté, et entre eux un visage court qui se fond aussitôt dans les
// racines des bras. Rien d'humain : pas de front, pas de joues.
const TETE =
  'M200 236 C132 236, 80 288, 78 356 C76 404, 92 436, 108 456 C92 470, 88 500, 104 516 C118 530, 140 530, 152 524 C160 540, 168 552, 176 566 L224 566 C232 552, 240 540, 248 524 C260 530, 282 530, 296 516 C312 500, 308 470, 292 456 C308 436, 324 404, 322 356 C320 288, 268 236, 200 236 Z'

// Grandes taches sombres du manteau
const TACHES_TETE = [
  [150, 300, 18, 12, -20],
  [240, 280, 14, 10, 15],
  [280, 350, 17, 11, 40],
  [118, 372, 13, 9, -35],
  [196, 330, 22, 14, 5],
  [170, 396, 11, 8, 10],
  [240, 404, 14, 9, -15],
  [300, 410, 8, 6, 20],
  [100, 430, 7, 5, -10],
]

// Répartition « tournesol » dans une ellipse : régulière sans être en grille,
// et figée pour que la bête soit la même à chaque fois
const semis = (n, cx, cy, rx, ry, decal = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i + decal) * 2.39996
    const r = Math.sqrt((i + 0.5) / n)
    return [cx + Math.cos(a) * r * rx, cy + Math.sin(a) * r * ry, i]
  })

// Mouchetures claires, et papilles : des verrues de chair éclairées dessus,
// ombrées dessous
const MOUCHETURES = semis(50, 200, 350, 110, 100)
const PAPILLES = semis(30, 200, 356, 100, 92, 0.5)

// Plis du manteau, organiques plutôt que parallèles
const PLIS = [
  'M104 400 C120 422, 142 434, 172 440',
  'M296 400 C280 422, 258 434, 228 440',
  'M128 296 C148 284, 170 280, 192 282',
  'M252 274 C272 286, 288 304, 298 328',
  'M204 446 C198 424, 200 402, 208 380',
  'M96 340 C104 360, 108 378, 106 396',
]

// Arcade gauche : un bourrelet de chair qui plonge vers le milieu du visage
const ARCADE = 'M92 476 C102 448, 146 440, 178 476 C168 480, 156 478, 144 474 C126 468, 110 470, 96 482 Z'

// Rayons de l'iris, autour de la pupille
const RAYONS_IRIS = Array.from({ length: 10 }, (_, i) => (i * 36 * Math.PI) / 180)

function Oeil({ miroir }) {
  return (
    <g transform={miroir ? 'translate(400 0) scale(-1 1)' : undefined}>
      {/* Orbite, inclinée : le coin intérieur plonge */}
      <ellipse cx="132" cy="492" rx="25" ry="16" transform="rotate(12 132 492)" fill="#0a0302" />
      <g className="kraken-oeil">
        <circle cx="132" cy="492" r="48" fill="url(#kraken-lueur)" />
        <g transform="rotate(12 132 492)">
          <ellipse cx="132" cy="492" rx="19" ry="11.5" fill="url(#kraken-iris)" />
          <ellipse cx="132" cy="492" rx="19" ry="11.5" fill="none" stroke="#7a3a04" strokeOpacity="0.7" />
          <g stroke="#8a4a08" strokeOpacity="0.4" strokeWidth="0.7">
            {RAYONS_IRIS.map((a) => (
              <line
                key={a}
                x1={132 + Math.cos(a) * 7}
                y1={492 + Math.sin(a) * 4}
                x2={132 + Math.cos(a) * 16}
                y2={492 + Math.sin(a) * 9.5}
              />
            ))}
          </g>
          {/* Pupille en barre horizontale, celle des poulpes */}
          <rect x="120" y="489" width="24" height="6" rx="3" fill="#0b0503" />
        </g>
        <circle cx="125" cy="486" r="2.2" fill="#fff6d8" fillOpacity="0.9" />
      </g>
      {/* Paupière inférieure et ses plis, pattes-d'oie */}
      <path d="M106 504 C120 516, 144 518, 160 506" fill="none" stroke="#140504" strokeOpacity="0.7" strokeWidth="2.2" />
      <path d="M110 514 C124 524, 142 524, 156 516" fill="none" stroke="#140504" strokeOpacity="0.35" strokeWidth="1.4" />
      <path d="M100 484 L88 478 M100 500 L88 506 M102 492 L86 492" stroke="#140504" strokeOpacity="0.4" strokeWidth="1.2" />
      {/* Lueur de l'œil sur l'arcade, puis l'arcade qui l'écrase */}
      <ellipse className="kraken-reflet-oeil" cx="134" cy="474" rx="34" ry="9" fill="#efc463" fillOpacity="0.22" />
      <path d={ARCADE} fill="#57201a" />
      <path d="M92 476 C102 448, 146 440, 178 476" fill="none" stroke="#d98a6a" strokeOpacity="0.55" strokeWidth="1.6" />
      <path
        d="M96 482 C110 470, 126 468, 144 474 C156 478, 168 480, 178 476"
        fill="none"
        stroke="#0e0403"
        strokeOpacity="0.8"
        strokeWidth="2.4"
      />
    </g>
  )
}

function Tete() {
  return (
    <g>
      <path d={TETE} fill="url(#kraken-tete)" stroke="#160605" strokeOpacity="0.7" strokeWidth="1.2" />
      {/* Reflet sur le dôme */}
      <ellipse cx="160" cy="290" rx="46" ry="18" transform="rotate(-22 160 290)" fill="#ffffff" fillOpacity="0.1" />
      {TACHES_TETE.map(([cx, cy, rx, ry, a], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${a} ${cx} ${cy})`} fill="#260a07" fillOpacity="0.38" />
      ))}
      {MOUCHETURES.map(([cx, cy, i]) => (
        <circle key={i} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={0.8 + (i % 4) * 0.35} fill="#f3c7a8" fillOpacity="0.14" />
      ))}
      {PAPILLES.map(([cx, cy, i]) => {
        const r = 2.2 + (i % 3) * 0.8
        return (
          <g key={i}>
            <circle cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={r} fill="#7a2e22" />
            <path
              d={`M${(cx - r).toFixed(1)} ${cy.toFixed(1)} A${r} ${r} 0 0 0 ${(cx + r).toFixed(1)} ${cy.toFixed(1)}`}
              fill="none"
              stroke="#140504"
              strokeOpacity="0.55"
              strokeWidth="0.9"
            />
            <circle cx={(cx - r * 0.3).toFixed(1)} cy={(cy - r * 0.35).toFixed(1)} r={r * 0.3} fill="#e08a6a" fillOpacity="0.35" />
          </g>
        )
      })}
      {PLIS.map((d) => (
        <g key={d}>
          <path d={d} fill="none" stroke="#e08a6a" strokeOpacity="0.2" strokeWidth="1" transform="translate(0 -2)" />
          <path d={d} fill="none" stroke="#1a0706" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
      {/* Veines */}
      <g fill="none" stroke="#1a0706" strokeOpacity="0.32" strokeWidth="0.9" strokeLinecap="round">
        <path d="M170 246 C176 266, 168 286, 178 308 M176 278 C188 284, 194 294, 198 304" />
        <path d="M248 252 C242 272, 252 292, 244 314 M246 284 C236 290, 230 300, 228 310" />
        <path d="M112 318 C124 332, 122 350, 132 364" />
        <path d="M292 330 C280 344, 284 360, 274 374" />
      </g>

      {/* Visage : plis de colère entre les yeux, racines des bras */}
      <g fill="none" stroke="#140504" strokeLinecap="round">
        <path d="M184 468 C190 484, 192 500, 190 516 M216 468 C210 484, 208 500, 210 516" strokeOpacity="0.55" strokeWidth="1.8" />
        <path d="M200 450 L200 478" strokeOpacity="0.45" strokeWidth="1.4" />
        <path d="M176 506 C180 524, 182 540, 180 556 M224 506 C220 524, 218 540, 220 556" strokeOpacity="0.4" strokeWidth="1.5" />
        <path d="M156 538 C172 548, 188 552, 200 552 C212 552, 228 548, 244 538" strokeOpacity="0.45" strokeWidth="1.8" />
      </g>
      {/* Bec, luisant entre les bras */}
      <ellipse cx="200" cy="578" rx="21" ry="11" fill="#050307" />
      <path d="M187 572 C190 586, 195 596, 200 604 C205 596, 210 586, 213 572 C206 578, 194 578, 187 572 Z" fill="#241510" />
      <path d="M191 576 C194 586, 197 592, 200 598" fill="none" stroke="#8a664c" strokeOpacity="0.6" strokeWidth="1.2" />

      <Oeil />
      <Oeil miroir />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* L'emprise, qui reste après le passage                               */
/* ------------------------------------------------------------------ */

// Seize tentacules restent agrippées à l'écran tant que le Kraken est déclaré :
// un rappel permanent qu'un pli a été retiré. Deux géométries suffisent, que le
// CSS retourne et fait pivoter pour couvrir les huit bords du cadre.
//
//   COIN  quatre coins, deux tentacules chacun : l'une vient du bord latéral,
//         l'autre du bord horizontal, et elles se croisent dans l'angle.
//   BORD  milieu des quatre côtés, deux tentacules entrant de face.
//
// Les tentacules de bord passent au beau milieu des panneaux : elles sont plus
// courtes et nettement plus discrètes que celles des coins, sans quoi seize
// bras finiraient par rendre le texte illisible.
const COIN = [
  { x: -20, y: 30, angle: 15, longueur: 210, epaisseur: 30, courbe: 22, boucle: 60, segments: 30 },
  { x: 30, y: -20, angle: 75, longueur: 210, epaisseur: 30, courbe: -22, boucle: -60, segments: 30 },
].map((t) => traceBras(t))

const BORD = [
  { x: -24, y: 62, angle: -20, longueur: 168, epaisseur: 24, courbe: 19, boucle: 46, segments: 26 },
  { x: -24, y: 138, angle: 20, longueur: 168, epaisseur: 22, courbe: -19, boucle: -46, segments: 26 },
].map((t) => traceBras(t))

const ANCRAGES = [
  { classe: 'hg', trace: COIN },
  { classe: 'hd', trace: COIN },
  { classe: 'bg', trace: COIN },
  { classe: 'bd', trace: COIN },
  { classe: 'bord g', trace: BORD },
  { classe: 'bord d', trace: BORD },
  { classe: 'bord h', trace: BORD },
  { classe: 'bord b', trace: BORD },
]

// Dégradés partagés par les bras de la scène et ceux de l'emprise
function DegradesBras({ prefixe }) {
  return (
    <>
      <linearGradient id={`${prefixe}-peau`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#9a3a2a" />
        <stop offset="45%" stopColor="#5e2219" />
        <stop offset="100%" stopColor="#2a100c" />
      </linearGradient>
      <linearGradient id={`${prefixe}-dessous`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#d98a66" />
        <stop offset="100%" stopColor="#8a3a28" />
      </linearGradient>
    </>
  )
}

export function EmpriseKraken() {
  return (
    <div className="kraken-emprise" aria-hidden="true">
      {/* Dégradés déclarés une seule fois, partagés par toutes les tentacules. */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <DegradesBras prefixe="emprise" />
        </defs>
      </svg>

      {ANCRAGES.map(({ classe, trace }) => (
        <svg className={`kraken-griffe ${classe}`} viewBox="0 0 200 200" key={classe}>
          {trace.map((t, i) => (
            <Bras key={i} trace={t} peau="emprise-peau" dessous="emprise-dessous" />
          ))}
        </svg>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* La scène                                                            */
/* ------------------------------------------------------------------ */

export default function AnimationKraken({ onFini }) {
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

  // Un bras : il se déploie depuis sa base, puis ondule sans fin.
  const bras = (b, i) => (
    <g
      className="kraken-bras"
      key={i}
      style={{ transformOrigin: `${b.x}px ${b.y}px`, animationDelay: `${b.retard}s` }}
    >
      <g
        className="kraken-ondule"
        style={{ transformOrigin: `${b.x}px ${b.y}px`, animationDelay: `${-i * 0.37}s` }}
      >
        <Bras trace={b.trace} peau="kraken-bras-peau" dessous="kraken-bras-dessous" />
      </g>
    </g>
  )

  return (
    <div className="kraken-scene" role="presentation">
      <svg
        className="kraken-dessin"
        viewBox="0 0 400 640"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <DegradesBras prefixe="kraken-bras" />
          <radialGradient id="kraken-tete" cx="0.42" cy="0.28" r="0.8">
            <stop offset="0%" stopColor="#b0543c" />
            <stop offset="35%" stopColor="#6d2a1e" />
            <stop offset="70%" stopColor="#3d1712" />
            <stop offset="100%" stopColor="#140706" />
          </radialGradient>
          <radialGradient id="kraken-lueur">
            <stop offset="0%" stopColor="#efc463" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#d9861a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d9861a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="kraken-iris" cx="0.45" cy="0.45" r="0.6">
            <stop offset="0%" stopColor="#fff3b0" />
            <stop offset="40%" stopColor="#efc463" />
            <stop offset="80%" stopColor="#d9861a" />
            <stop offset="100%" stopColor="#7a3a04" />
          </radialGradient>
        </defs>

        <g className="kraken-corps">
          {/* La masse sombre qui remonte des profondeurs */}
          <ellipse cx="200" cy="676" rx="230" ry="110" fill="#120706" />
          {BRAS.filter((b) => b.plan === 'arriere').map(bras)}
          <Tete />
          {BRAS.filter((b) => b.plan === 'avant').map((b, i) => bras(b, i + 4))}
        </g>
      </svg>

      <p className="kraken-cri">Le Kraken&nbsp;!</p>
    </div>
  )
}
