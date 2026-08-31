import { useEffect } from 'react'

// Animation jouée quand le Kraken est déclaré : la bête monte des profondeurs,
// referme ses tentacules et engloutit l'écran avant de se dissoudre.
//
// Les tentacules sont tracées en « tortue » : on avance pas à pas en faisant
// tourner le cap un peu plus fort à chaque pas, ce qui les enroule vers la
// pointe. On relève les deux bords au passage pour obtenir un ruban fuselé,
// impossible à obtenir proprement avec un simple trait d'épaisseur constante.
function traceTentacule({ x, y, angle, longueur, epaisseur, courbure, segments = 32 }) {
  const pas = longueur / segments
  const dCourbure = (courbure * Math.PI) / 180
  let px = x
  let py = y
  let cap = (angle * Math.PI) / 180

  const gauche = []
  const droite = []
  const ventouses = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const demi = (epaisseur / 2) * Math.pow(1 - t, 0.8)
    const nx = -Math.sin(cap)
    const ny = Math.cos(cap)

    gauche.push([px + nx * demi, py + ny * demi])
    droite.push([px - nx * demi, py - ny * demi])

    if (i % 3 === 1 && t < 0.86) {
      ventouses.push({
        cx: px + nx * demi * 0.4,
        cy: py + ny * demi * 0.4,
        r: Math.max(1.1, demi * 0.19),
      })
    }

    px += Math.cos(cap) * pas
    py += Math.sin(cap) * pas
    cap += (dCourbure * (0.35 + 1.6 * t)) / segments
  }

  const contour = [...gauche, ...droite.reverse()]
  const d =
    'M' + contour.map(([X, Y]) => `${X.toFixed(1)} ${Y.toFixed(1)}`).join('L') + 'Z'

  return { d, ventouses }
}

// Bases réparties sur le bas du cadre, un peu sous le bord pour que les
// tentacules semblent sortir de l'eau noire. `retard` décale leur sortie.
const TENTACULES = [
  { x: 14, angle: -70, longueur: 395, epaisseur: 44, courbure: 82, retard: 0.16 },
  { x: 84, angle: -79, longueur: 500, epaisseur: 54, courbure: -64, retard: 0.0 },
  { x: 150, angle: -87, longueur: 425, epaisseur: 42, courbure: 58, retard: 0.22 },
  { x: 250, angle: -93, longueur: 450, epaisseur: 44, courbure: -58, retard: 0.1 },
  { x: 316, angle: -101, longueur: 505, epaisseur: 54, courbure: 66, retard: 0.05 },
  { x: 386, angle: -110, longueur: 390, epaisseur: 44, courbure: -82, retard: 0.19 },
]

const BASE_Y = 656
const DUREE = 2400

// Deux tentacules par coin, soit huit au total, qui restent agrippées à l'écran
// tant que le Kraken est déclaré : un rappel permanent qu'un pli a été retiré.
// Elles sont tracées dans un carré de 200, puis le même dessin est retourné par
// CSS pour les quatre coins — d'où une seule géométrie à décrire.
const GRIFFE = [
  { x: -20, y: 30, angle: 15, longueur: 210, epaisseur: 30, courbure: 64 },
  { x: 30, y: -20, angle: 75, longueur: 210, epaisseur: 30, courbure: -64 },
].map((t) => traceTentacule(t))

const COINS = ['hg', 'hd', 'bg', 'bd']

export function EmpriseKraken() {
  return (
    <div className="kraken-emprise" aria-hidden="true">
      {/* Dégradé déclaré une seule fois, partagé par les quatre coins. */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="emprise-chair" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8a3626" />
            <stop offset="65%" stopColor="#54201a" />
            <stop offset="100%" stopColor="#2a100c" />
          </linearGradient>
        </defs>
      </svg>

      {COINS.map((coin) => (
        <svg className={`kraken-griffe ${coin}`} viewBox="0 0 200 200" key={coin}>
          {GRIFFE.map(({ d, ventouses }, i) => (
            <g key={i}>
              <path d={d} fill="url(#emprise-chair)" />
              <path d={d} fill="none" stroke="#efc463" strokeOpacity="0.5" strokeWidth="1.4" />
              {ventouses.map((v, j) => (
                <circle key={j} cx={v.cx} cy={v.cy} r={v.r} fill="#efc463" fillOpacity="0.26" />
              ))}
            </g>
          ))}
        </svg>
      ))}
    </div>
  )
}

// La feuille de style coupe toutes les animations en « mouvement réduit » :
// la scène resterait figée à l'écran pendant deux secondes. On la saute donc
// entièrement, le Kraken est simplement coché.
const mouvementReduit = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

  return (
    <div className="kraken-scene" role="presentation">
      <svg
        className="kraken-dessin"
        viewBox="0 0 400 640"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="kraken-chair" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#120706" />
            <stop offset="55%" stopColor="#3d1712" />
            <stop offset="100%" stopColor="#6d2a1e" />
          </linearGradient>
          <radialGradient id="kraken-lueur">
            <stop offset="0%" stopColor="#efc463" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#efc463" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="kraken-corps">
          {TENTACULES.map((t, i) => {
            const { d, ventouses } = traceTentacule({ ...t, y: BASE_Y })
            return (
              <g
                className="kraken-bras"
                key={i}
                style={{
                  transformOrigin: `${t.x}px ${BASE_Y}px`,
                  animationDelay: `${t.retard}s`,
                }}
              >
                <path d={d} fill="url(#kraken-chair)" />
                <path d={d} fill="none" stroke="#efc463" strokeOpacity="0.22" strokeWidth="1.2" />
                {ventouses.map((v, j) => (
                  <circle key={j} cx={v.cx} cy={v.cy} r={v.r} fill="#efc463" fillOpacity="0.16" />
                ))}
              </g>
            )
          })}

          {/* La masse et la tête, qui affleurent sous les bras */}
          <ellipse cx="200" cy="668" rx="215" ry="104" fill="#120706" />
          <path
            d="M116 640c0-52 38-92 84-92s84 40 84 92Z"
            fill="url(#kraken-chair)"
            opacity="0.95"
          />

          <g className="kraken-yeux">
            <circle cx="168" cy="596" r="34" fill="url(#kraken-lueur)" />
            <circle cx="232" cy="596" r="34" fill="url(#kraken-lueur)" />
            <ellipse cx="168" cy="596" rx="9" ry="11" fill="#efc463" />
            <ellipse cx="232" cy="596" rx="9" ry="11" fill="#efc463" />
            <ellipse cx="168" cy="596" rx="2.6" ry="9" fill="#120706" />
            <ellipse cx="232" cy="596" rx="2.6" ry="9" fill="#120706" />
          </g>
        </g>
      </svg>

      <p className="kraken-cri">Le Kraken&nbsp;!</p>
    </div>
  )
}
