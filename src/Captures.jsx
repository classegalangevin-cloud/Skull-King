import { useEffect } from 'react'

import { mouvementReduit } from './mouvement.js'

// Trois saynètes jouées au moment où l'on inscrit une prime de capture.
// Contrairement au Kraken et à la Baleine, elles ne laissent aucune trace :
// c'est un éclat, pas un état de la manche. D'où un fondu enchaîné court.
//
//   pirateParSk      le Skull King rit d'avoir pris un pirate
//   sireneParPirate  une herse tombe devant la sirène, capturée
//   skParSirene      la sirène chante et joue de la harpe, victorieuse

const DUREE = 1800

/* ------------------------------------------------------------------ */
/* Pièces communes                                                     */
/* ------------------------------------------------------------------ */

// Un œil en amande, cerné de son trait de khôl et relevé en pointe vers la
// tempe. Tracé une fois, puis reflété pour l'autre côté : c'est ce regard en
// coin qui fait tout le visage.
function Oeil({ x, miroir }) {
  return (
    <g transform={`translate(${x} 96)${miroir ? ' scale(-1 1)' : ''}`}>
      {/* Blanc de l'œil */}
      <path d="M-9 0 C-6 -6, 4 -7, 9 -1 C4 5, -5 5, -9 0 Z" fill="#fdf8ee" />
      {/* Iris vert de mer, pupille, éclat */}
      <circle cx="1" cy="-0.6" r="4" fill="#2f7a6a" />
      <circle cx="1" cy="-0.6" r="1.9" fill="#10201f" />
      <circle cx="-0.4" cy="-2" r="1.1" fill="#ffffff" fillOpacity="0.9" />
      {/* Paupière et cil, qui file vers la tempe */}
      <path
        d="M-9 0 C-6 -6, 4 -7, 9 -1"
        fill="none"
        stroke="#2a1a14"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M8 -1.4 C11 -2.6, 13 -4, 14.5 -6"
        fill="none"
        stroke="#2a1a14"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Sourcil arqué, haut et fin : plus bas ou plus épais, il lui donne
          aussitôt un air renfrogné. */}
      <path
        d="M-7.5 -14.5 C-4 -18.5, 3 -19, 8.5 -15.5"
        fill="none"
        stroke="#7a4a1c"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </g>
  )
}

// Le buste de sirène sert deux fois : prisonnière, puis triomphante. Il est
// donc tracé une seule fois, les bras étant fournis par la scène.
function Sirene({ bras }) {
  return (
    <g>
      {/* Chevelure, derrière le buste */}
      <path
        d="M120 36 C78 36, 58 74, 62 116 C66 158, 52 186, 40 206
           C64 200, 80 186, 88 168 C84 196, 74 214, 62 230
           C92 222, 112 198, 118 168 L122 168
           C128 198, 148 222, 178 230 C166 214, 156 196, 152 168
           C160 186, 176 200, 200 206 C188 186, 174 158, 178 116
           C182 74, 162 36, 120 36 Z"
        fill="url(#sirene-cheveux)"
      />
      {/* Mèches, pour que la masse ne reste pas plate */}
      <g fill="none" stroke="#8f5a1c" strokeOpacity="0.55" strokeWidth="2.4" strokeLinecap="round">
        <path d="M74 96 C70 130, 72 166, 64 196" />
        <path d="M88 74 C78 104, 80 140, 74 168" />
        <path d="M166 96 C170 130, 168 166, 176 196" />
        <path d="M152 74 C162 104, 160 140, 166 168" />
      </g>

      {/* Queue : la masse, puis la trame d'écailles par-dessus */}
      <path
        id="corps-queue"
        d="M96 198 C86 238, 100 272, 132 288 C152 298, 172 298, 186 288
           C166 288, 148 280, 136 264 C120 242, 120 220, 130 198 Z"
        fill="url(#sirene-ecailles)"
      />
      <path
        d="M96 198 C86 238, 100 272, 132 288 C152 298, 172 298, 186 288
           C166 288, 148 280, 136 264 C120 242, 120 220, 130 198 Z"
        fill="url(#trame-ecailles)"
      />
      {/* Nageoire dorsale, le long de la hanche */}
      <path
        d="M94 210 C80 214, 70 226, 66 240 C78 234, 88 230, 96 230 Z"
        fill="url(#sirene-ecailles)"
        fillOpacity="0.85"
      />
      {/* Caudale, en deux lobes */}
      <path
        d="M178 282 C198 258, 224 248, 238 258 C222 264, 206 278, 198 296
           C190 300, 180 294, 178 282 Z"
        fill="url(#sirene-ecailles)"
      />
      <path
        d="M180 290 C196 292, 212 300, 220 300 L184 300 C180 298, 178 294, 180 290 Z"
        fill="url(#sirene-ecailles)"
      />
      <path
        d="M186 276 C202 264, 218 258, 230 258"
        fill="none"
        stroke="#9fe3c4"
        strokeOpacity="0.35"
        strokeWidth="2"
      />

      {/* Buste */}
      <path
        d="M100 128 C100 118, 140 118, 140 128 C144 152, 142 182, 134 206
           L106 206 C98 182, 96 152, 100 128 Z"
        fill="#efdcbe"
      />
      {/* Ombre sous la clavicule, pour donner du volume */}
      <path
        d="M104 140 C112 146, 128 146, 136 140"
        fill="none"
        stroke="#d4bd97"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Haut en coquillages */}
      <g>
        <path d="M97 150 C97 140, 119 140, 119 150 C119 160, 97 160, 97 150 Z" fill="#e6a7b4" />
        <path d="M121 150 C121 140, 143 140, 143 150 C143 160, 121 160, 121 150 Z" fill="#e6a7b4" />
        <g stroke="#b9707f" strokeWidth="1.2" strokeOpacity="0.8">
          <path d="M108 141 L108 159 M102 143 L102 157 M114 143 L114 157" />
          <path d="M132 141 L132 159 M126 143 L126 157 M138 143 L138 157" />
        </g>
      </g>

      {/* Tête */}
      <ellipse cx="120" cy="98" rx="30" ry="34" fill="#f6e7cd" />
      {/* Pommettes */}
      <ellipse cx="104" cy="108" rx="8" ry="5" fill="#e0a191" fillOpacity="0.4" />
      <ellipse cx="136" cy="108" rx="8" ry="5" fill="#e0a191" fillOpacity="0.4" />

      {/* Le tracé de référence file vers la droite : c'est donc l'œil gauche
          qu'on reflète, pour que les deux pointes aillent vers les tempes. */}
      <Oeil x={107} miroir />
      <Oeil x={133} />

      {/* Nez, à peine suggéré */}
      <path
        d="M120 104 C117.5 109, 117.5 111, 120.5 112"
        fill="none"
        stroke="#cfa87f"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Bouche pleine, juste entrouverte : elle chante sans s'égosiller */}
      <path
        d="M110 118 C113.5 113.5, 117.5 115.5, 120 117 C122.5 115.5, 126.5 113.5, 130 118
           C126 119, 114 119, 110 118 Z"
        fill="#9e3241"
      />
      <path
        d="M110 118.6 C114.5 125, 125.5 125, 130 118.6 C125.5 120.6, 114.5 120.6, 110 118.6 Z"
        fill="#c2495a"
      />
      <path d="M112 118.3 C118 119.6, 122 119.6, 128 118.3" fill="#2a0f14" fillOpacity="0.55" />

      {/* Grain de beauté */}
      <circle cx="133" cy="122" r="1.4" fill="#8a5a3a" />

      {/* Diadème */}
      <path
        d="M100 74 L110 62 L120 72 L130 62 L140 74 Z"
        fill="#efc463"
        stroke="#8a5e15"
        strokeWidth="1.5"
      />
      <circle cx="120" cy="70" r="2.6" fill="#2f7a6a" stroke="#8a5e15" strokeWidth="1" />
      {bras}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Les trois scènes                                                    */
/* ------------------------------------------------------------------ */

function SkullKingRit() {
  return (
    <g className="capture-skullking">
      {/* Crâne */}
      <path
        d="M46 176 C46 128, 80 96, 120 96 C160 96, 194 128, 194 176
           C194 202, 182 220, 164 230 L76 230 C58 220, 46 202, 46 176 Z"
        fill="url(#sk-os)"
      />
      {/* Orbites, creusées */}
      <ellipse cx="93" cy="172" rx="22" ry="26" fill="#1b0d08" />
      <ellipse cx="147" cy="172" rx="22" ry="26" fill="#1b0d08" />
      <circle cx="97" cy="178" r="5" fill="#efc463" fillOpacity="0.65" />
      <circle cx="143" cy="178" r="5" fill="#efc463" fillOpacity="0.65" />
      {/* Nez */}
      <path d="M120 190 L132 216 L108 216 Z" fill="#1b0d08" />
      {/* Dents du haut */}
      <g fill="#1b0d08">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={92 + i * 12} y="226" width="4" height="12" rx="1" />
        ))}
      </g>
      {/* Fond de gorge : c'est lui qu'on voit quand la mâchoire s'abaisse */}
      <path d="M78 222 L162 222 L162 262 C162 268, 78 268, 78 262 Z" fill="#160a06" />

      {/* Mâchoire : c'est elle qui rit. Elle descend, elle ne pivote pas —
          une mandibule vue de face s'abaisse, elle ne part pas de travers. */}
      <g className="capture-machoire">
        <path
          d="M76 228 C76 254, 94 272, 120 272 C146 272, 164 254, 164 228 Z"
          fill="url(#sk-os)"
        />
        <g fill="#1b0d08">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={94 + i * 12} y="230" width="4" height="11" rx="1" />
          ))}
        </g>
      </g>
      {/* Couronne, posée par-dessus le crâne */}
      <path
        d="M34 74 L68 100 L120 30 L172 100 L206 74 L196 130 L44 130 Z"
        fill="url(#sk-or)"
        stroke="#8a5e15"
        strokeWidth="2"
      />
    </g>
  )
}

// Le visage est centré sur x = 120 : les barreaux sont placés de part et
// d'autre, jamais dessus.
const BARREAUX = [1, 35, 69, 103, 137, 171, 205, 239]

function SireneEmprisonnee() {
  return (
    <g>
      <Sirene
        bras={
          <>
            {/* Mains agrippées aux barreaux */}
            <path
              d="M100 150 C78 156, 62 172, 56 194 C66 196, 76 190, 84 180"
              fill="none"
              stroke="#e8d8bc"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <path
              d="M140 150 C162 156, 178 172, 184 194 C174 196, 164 190, 156 180"
              fill="none"
              stroke="#e8d8bc"
              strokeWidth="13"
              strokeLinecap="round"
            />
          </>
        }
      />

      {/* La herse, qui tombe devant elle. Les barreaux encadrent le visage
          plutôt que de le barrer : aucun ne passe par le milieu. */}
      <g className="capture-herse">
        <g stroke="url(#herse-fer)" strokeWidth="9" strokeLinecap="butt">
          {BARREAUX.map((x) => (
            <line key={x} x1={x} y1="-30" x2={x} y2="272" />
          ))}
        </g>
        <g stroke="url(#herse-fer)" strokeWidth="13">
          <line x1="0" y1="26" x2="240" y2="26" />
          <line x1="0" y1="132" x2="240" y2="132" />
          <line x1="0" y1="238" x2="240" y2="238" />
        </g>
        {/* Pointes du bas, gardées dans le cadre */}
        <g fill="url(#herse-fer)">
          {BARREAUX.map((x) => (
            <path key={x} d={`M${x - 9} 272 L${x + 9} 272 L${x} 298 Z`} />
          ))}
        </g>
      </g>
    </g>
  )
}

// Cordes de la harpe : elles courent de la console à la caisse, et se
// raccourcissent à mesure que les deux se rejoignent vers la droite.
const CORDES = Array.from({ length: 8 }, (_, i) => {
  const t = 0.06 + (i / 7) * 0.78
  const lerp = (a, b) => a + (b - a) * t
  return {
    x1: lerp(88, 140),
    y1: lerp(160, 186),
    x2: lerp(80, 146),
    y2: lerp(278, 188),
  }
})

function SireneQuiChante() {
  return (
    <g>
      <Sirene
        bras={
          <>
            {/* La main gauche pince les cordes, la droite tient la console */}
            <path
              d="M104 146 C92 168, 92 192, 100 208"
              fill="none"
              stroke="#e8d8bc"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <path
              d="M138 148 C152 158, 154 172, 150 184"
              fill="none"
              stroke="#e8d8bc"
              strokeWidth="13"
              strokeLinecap="round"
            />
          </>
        }
      />

      {/* La harpe, dressée devant elle : colonne, console courbe et caisse */}
      <g className="capture-harpe">
        <path d="M58 276 L80 276 L96 152 L76 148 Z" fill="url(#harpe-bois)" />
        <path
          d="M76 148 C104 134, 142 148, 158 180 L142 188 C130 164, 102 154, 84 162 Z"
          fill="url(#harpe-bois)"
        />
        <path d="M62 280 L84 286 L160 190 L146 180 Z" fill="url(#harpe-bois)" />
        <g stroke="#efc463" strokeOpacity="0.85" strokeWidth="1.8">
          {CORDES.map((c, i) => (
            <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} />
          ))}
        </g>
      </g>

      {/* Notes, qui s'échappent de son chant */}
      <g className="capture-notes" fill="#efc463">
        {[
          { x: 176, y: 116, t: 1, r: -14 },
          { x: 202, y: 86, t: 0.78, r: 12 },
          { x: 162, y: 72, t: 0.62, r: -8 },
        ].map((n, i) => (
          // Le placement reste sur le groupe extérieur : une transformation CSS
          // d'animation écraserait l'attribut « transform » du même élément, et
          // la note irait se coller dans le coin.
          <g key={i} transform={`translate(${n.x} ${n.y}) scale(${n.t}) rotate(${n.r})`}>
            <g className="capture-note" style={{ animationDelay: `${0.34 + i * 0.16}s` }}>
              <ellipse cx="0" cy="18" rx="11" ry="8" transform="rotate(-20)" />
              <rect x="8" y="-22" width="4" height="38" rx="2" />
              <path d="M12 -22 C24 -18, 28 -8, 24 2 C26 -8, 20 -14, 12 -12 Z" />
            </g>
          </g>
        ))}
      </g>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* La scène                                                            */
/* ------------------------------------------------------------------ */

const SCENES = {
  pirateParSk: { titre: 'Pirate capturé !', dessin: SkullKingRit, teinte: 'or' },
  sireneParPirate: { titre: 'Sirène capturée !', dessin: SireneEmprisonnee, teinte: 'fer' },
  skParSirene: { titre: 'Skull King capturé !', dessin: SireneQuiChante, teinte: 'mer' },
}

export const CAPTURES = Object.keys(SCENES)

export default function AnimationCapture({ type, onFini }) {
  const sansAnimation = mouvementReduit()
  const scene = SCENES[type]

  useEffect(() => {
    if (!scene || sansAnimation) {
      onFini()
      return undefined
    }
    const minuteur = setTimeout(onFini, DUREE)
    return () => clearTimeout(minuteur)
  }, [onFini, sansAnimation, scene])

  if (!scene || sansAnimation) return null

  const Dessin = scene.dessin

  return (
    <div className={`capture-scene ${scene.teinte}`} role="presentation">
      <svg className="capture-dessin" viewBox="0 0 240 300" aria-hidden="true">
        <defs>
          <linearGradient id="sk-os" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4e9cf" />
            <stop offset="100%" stopColor="#b99c67" />
          </linearGradient>
          <linearGradient id="sk-or" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6da8e" />
            <stop offset="100%" stopColor="#b07f22" />
          </linearGradient>
          <linearGradient id="sirene-cheveux" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d89a3c" />
            <stop offset="100%" stopColor="#7a4a14" />
          </linearGradient>
          <linearGradient id="sirene-ecailles" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6fc28c" />
            <stop offset="55%" stopColor="#2f7a6a" />
            <stop offset="100%" stopColor="#16362f" />
          </linearGradient>
          {/* Écailles : deux rangs d'arcs décalés d'un demi-pas, posés en
              surimpression sur la queue. Le motif se répète tout seul. */}
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
          <linearGradient id="harpe-bois" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a8762e" />
            <stop offset="100%" stopColor="#54320f" />
          </linearGradient>
        </defs>

        <g className="capture-sujet">
          <Dessin />
        </g>
      </svg>

      <p className="capture-titre">{scene.titre}</p>
    </div>
  )
}
