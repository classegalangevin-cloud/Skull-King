// Icônes tracées à la main, style gravure : trait unique, currentColor.
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

const Svg = ({ children, size = 24, ...reste }) => (
  <svg {...base} width={size} height={size} {...reste}>
    {children}
  </svg>
)

export const Crane = (p) => (
  <Svg {...p}>
    <path d="M5 10.6a7 7 0 0 1 14 0c0 2.4-1.2 4.3-3 5.3v2.3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.3c-1.8-1-3-2.9-3-5.3Z" />
    <circle cx="9.2" cy="10.6" r="1.9" />
    <circle cx="14.8" cy="10.6" r="1.9" />
    <path d="M12 13.4v1.5M10.4 19.2v-2.1M13.6 19.2v-2.1" />
  </Svg>
)

export const SkullKing = (p) => (
  <Svg {...p}>
    <path d="M4 7.2 6.8 9 12 3.6 17.2 9 20 7.2 19 12H5Z" />
    <path d="M6.2 13.4a6 6 0 0 0 2.4 3.6v1.8a1 1 0 0 0 1 1h4.8a1 1 0 0 0 1-1V17a6 6 0 0 0 2.4-3.6" />
    <circle cx="9.6" cy="14.6" r="1.2" />
    <circle cx="14.4" cy="14.6" r="1.2" />
  </Svg>
)

export const Sabres = (p) => (
  <Svg {...p}>
    <path d="M4.5 4.5 15 15M19.5 4.5 9 15" />
    <path d="M15 15l1.6 1.2 2.4 3.3-3.3-2.4L14.5 15.5M9 15l-1.6 1.2-2.4 3.3 3.3-2.4 1.2-1.6" />
    <path d="M3.2 6.4 6 3.6M20.8 6.4 18 3.6" />
  </Svg>
)

export const Sirene = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="4.6" r="2.1" />
    <path d="M12 6.7c-2.3 0-3.6 1.9-3.6 4 0 2.2 1.1 3.4 1.6 5" />
    <path d="M12 6.7c2.3 0 3.6 1.9 3.6 4 0 2.2-1.1 3.4-1.6 5" />
    <path d="M12 15c-1.7 1.4-2.8 3.4-3 5.6 1-1.1 2-1.7 3-1.7s2 .6 3 1.7c-.2-2.2-1.3-4.2-3-5.6Z" />
  </Svg>
)

export const Drapeau = (p) => (
  <Svg {...p}>
    <path d="M6 21V3" />
    <path d="M6 4.4h11.5l-2.4 3.4 2.4 3.4H6" />
  </Svg>
)

export const Poing = (p) => (
  <Svg {...p}>
    <path d="M6 11.4V9a1.6 1.6 0 0 1 3.2 0M9.2 9V7.6a1.6 1.6 0 0 1 3.2 0V9M12.4 9V8a1.6 1.6 0 0 1 3.2 0v3" />
    <path d="M15.6 11V9.8a1.5 1.5 0 0 1 3 0v4.4A6 6 0 0 1 12.6 20h-1.2a5.4 5.4 0 0 1-5.4-5.4v-3.2" />
  </Svg>
)

export const Ancre = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="4.4" r="2.1" />
    <path d="M12 6.5V21M8.4 9.4h7.2" />
    <path d="M4.6 13.2c0 4.1 3.3 7.4 7.4 7.4s7.4-3.3 7.4-7.4" />
    <path d="M4.6 13.2h2.6M19.4 13.2h-2.6" />
  </Svg>
)

export const Perroquet = (p) => (
  <Svg {...p}>
    <path d="M13.6 3.4a3.6 3.6 0 0 0-3.6 3.6c0 3.4-3.4 3.9-3.4 7.3 0 3 2.4 5.3 5.4 5.3 2 0 3.6-.9 4.6-2.4" />
    <path d="M13.6 3.4a3.6 3.6 0 0 1 3.6 3.6l2.6 1.6-2.6 1.3" />
    <circle cx="14.2" cy="6.6" r=".9" />
    <path d="M12 19.6c2.4-1.4 4-3.4 4.8-5.9M6.8 20.6h5.6" />
  </Svg>
)

export const Coffre = (p) => (
  <Svg {...p}>
    <path d="M3.6 10.4a8.4 8.4 0 0 1 16.8 0" />
    <rect x="3.6" y="10.4" width="16.8" height="8" rx="1.2" />
    <path d="M3.6 13.4h16.8" />
    <path d="M12 12.2v3.4" />
  </Svg>
)

export const Roue = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M12 4v3.4M12 16.6V20M4 12h3.4M16.6 12H20M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4" />
  </Svg>
)

export const Bouteille = (p) => (
  <Svg {...p}>
    <path d="M10.2 3h3.6v2.6c0 1.2 2.4 2 2.4 4.6v8.6a2 2 0 0 1-2 2h-4.4a2 2 0 0 1-2-2v-8.6c0-2.6 2.4-3.4 2.4-4.6Z" />
    <path d="M7.8 13h8.4" />
  </Svg>
)

export const Boussole = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="m15 9-1.7 4.3L9 15l1.7-4.3Z" />
  </Svg>
)

export const Navire = (p) => (
  <Svg {...p}>
    <path d="M3.4 15.6h17.2c-1 2.9-3.8 5-7.2 5h-2.8c-3.4 0-6.2-2.1-7.2-5Z" />
    <path d="M12 3v12.6" />
    <path d="M12 4.6h5.4l-1.6 2.6 1.6 2.6H12M12 6.4H7.4l1.4 2.2-1.4 2.2H12" />
  </Svg>
)

export const Piece = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <circle cx="12" cy="12" r="5" />
    <path d="M12 9.6v4.8M10.4 12h3.2" />
  </Svg>
)

export const Carte = (p) => (
  <Svg {...p}>
    <rect x="6" y="3.4" width="12" height="17.2" rx="1.8" />
    <path d="M12 8.4 14 12l-2 3.6L10 12Z" />
  </Svg>
)

export const Plume = (p) => (
  <Svg {...p}>
    <path d="M4 20.4 9.6 14.8" />
    <path d="M9.6 14.8c-2-2 .4-8.4 5-10.4 3-1.3 5.4-.6 5.4-.6s.7 2.4-.6 5.4c-2 4.6-8.4 7-10.4 5Z" />
    <path d="M17.6 6.4 11 13" />
  </Svg>
)

export const Fleche = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
)

export const Croix = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)

export const Plus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const Moins = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
)

export const Coche = (p) => (
  <Svg {...p}>
    <path d="m5 12.8 4.6 4.4L19 6.4" />
  </Svg>
)

// Les huit avatars proposés à l'équipage, dans l'ordre d'attribution.
export const AVATARS = [
  { id: 'crane', nom: 'Crâne', Icone: Crane },
  { id: 'sabres', nom: 'Sabres', Icone: Sabres },
  { id: 'ancre', nom: 'Ancre', Icone: Ancre },
  { id: 'perroquet', nom: 'Perroquet', Icone: Perroquet },
  { id: 'sirene', nom: 'Sirène', Icone: Sirene },
  { id: 'coffre', nom: 'Coffre', Icone: Coffre },
  { id: 'roue', nom: 'Gouvernail', Icone: Roue },
  { id: 'boussole', nom: 'Boussole', Icone: Boussole },
]

export const avatarParId = (id) => (AVATARS.find((a) => a.id === id) || AVATARS[0]).Icone
