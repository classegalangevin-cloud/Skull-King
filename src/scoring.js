// Règles de comptage du Skull King
//
// Deux systèmes, au choix en début de partie.
//
// SKULL KING (classique)
//   Pari réussi (pari >= 1) : 20 points par pli annoncé.
//   Pari réussi à 0         : 10 points par carte distribuée dans la manche.
//   Pari raté (pari >= 1)   : -10 points par pli d'écart.
//   Pari raté à 0           : -10 points par carte distribuée dans la manche.
//   Primes : acquises quoi qu'il arrive. Cette édition des règles ne les
//   conditionne plus à la réussite du pari, contrairement aux précédentes.
//
// RASCAL
//   Chaque joueur joue le même potentiel, quelle que soit sa mise :
//   10 points par carte distribuée. Ce qu'il en touche dépend de sa précision.
//     Coup direct (mise exacte)  : la totalité.
//     Frappe à revers (écart 1)  : la moitié.
//     Échec cuisant (écart >= 2) : rien.
//   Les primes suivent le même barème : entières, à moitié, ou perdues.

export const TOTAL_MANCHES = 10

export const SKULL_KING = 'skullking'
export const RASCAL = 'rascal'

// Règle optionnelle de Rascal, annoncée après la mise et révélée au
// « Yo-ho-ho ! » : la chevrotine suit le barème habituel, le boulet de canon
// mise gros — 15 points par carte, mais rien du tout hors du coup direct.
export const CHEVROTINE = 'chevrotine'
export const BOULET = 'boulet'

// Deux situations annulent un pli : personne ne le remporte.
//
//  - le Kraken, qui engloutit le pli où il est joué ;
//  - la Baleine accompagnée de fuites, un pli sans aucune carte à numéro.
//
// Le jeu ne contient qu'un Kraken et qu'une Baleine, mais ils peuvent sortir
// dans deux plis différents d'une même manche : chacun compte alors pour un
// pli en moins. Le total est borné à zéro, faute de quoi une manche courte
// (une seule carte, deux incidents déclarés) descendrait en négatif.
export const plisAttendus = (manche, kraken, baleine) =>
  Math.max(0, manche - (kraken ? 1 : 0) - (baleine ? 1 : 0))

export const PRIMES = [
  { id: 'q14jaune', label: '14 Jaune', points: 10, max: 1, teinte: 'jaune' },
  { id: 'q14vert', label: '14 Vert', points: 10, max: 1, teinte: 'vert' },
  { id: 'q14mauve', label: '14 Mauve', points: 10, max: 1, teinte: 'mauve' },
  { id: 'q14noir', label: '14 Noir (atout)', points: 20, max: 1, teinte: 'noir' },
  { id: 'sireneParPirate', label: 'Sirène capturée par un pirate', points: 20, max: 2, teinte: 'or' },
  { id: 'pirateParSk', label: 'Pirate capturé par le Skull King', points: 30, max: 6, teinte: 'or' },
  { id: 'skParSirene', label: 'Skull King capturé par une sirène', points: 40, max: 1, teinte: 'or' },
]

// Pouvoir de Rascal le Flambeur : « Pariez 0, 10 ou 20 points. Gagnez-les si
// vous misez correctement, perdez-les si vous échouez ! » C'est donc une mise
// à quitte ou double, et non une prime : elle se gagne ou se perd en bloc,
// sans suivre le barème progressif du mode Rascal.
export const PARIS_RASCAL = [0, 10, 20]

export function totalPrimes(primes = {}) {
  return PRIMES.reduce((somme, p) => somme + p.points * (primes[p.id] || 0), 0)
}

// Renvoie le détail du score d'un joueur pour une manche.
export function scoreManche(ligne, manche, mode = SKULL_KING) {
  const vide = {
    base: 0,
    prime: 0,
    rascal: 0,
    total: 0,
    reussi: false,
    ecart: null,
    complet: false,
  }
  if (!ligne) return vide
  const { pari, plis, primes } = ligne
  if (pari == null || plis == null) return vide

  const ecart = Math.abs(pari - plis)
  const reussi = ecart === 0
  const brutPrimes = totalPrimes(primes)
  const pariRascal = ligne.rascal ? (reussi ? ligne.rascal : -ligne.rascal) : 0

  if (mode === RASCAL) {
    const boulet = ligne.mise === BOULET
    const potentiel = (boulet ? 15 : 10) * manche
    // Le boulet de canon ne connaît pas la demi-mesure : hors du coup direct,
    // ni points de mise ni primes.
    let base = 0
    let part = 0
    if (reussi) {
      base = potentiel
      part = 1
    } else if (!boulet && ecart === 1) {
      base = potentiel / 2
      part = 0.5
    }
    const prime = brutPrimes * part
    return {
      base,
      prime,
      rascal: pariRascal,
      total: base + prime + pariRascal,
      reussi,
      ecart,
      complet: true,
    }
  }

  let base
  if (pari === 0) base = reussi ? 10 * manche : -10 * manche
  else base = reussi ? 20 * pari : -10 * ecart

  return {
    base,
    prime: brutPrimes,
    rascal: pariRascal,
    total: base + brutPrimes + pariRascal,
    reussi,
    ecart,
    complet: true,
  }
}

// Cumul de tous les joueurs jusqu'à la manche courante incluse.
export function classement(joueurs, manches, mode = SKULL_KING) {
  const lignes = joueurs.map((joueur) => {
    const detail = []
    let cumul = 0
    for (let m = 1; m <= TOTAL_MANCHES; m++) {
      const donnees = manches[m] && manches[m][joueur.id]
      const score = scoreManche(donnees, m, mode)
      if (score.complet) {
        cumul += score.total
        detail.push({ manche: m, ...score, cumul, pari: donnees.pari, plis: donnees.plis })
      }
    }
    return { joueur, total: cumul, detail }
  })

  const tries = [...lignes].sort((a, b) => b.total - a.total)
  let rangCourant = 0
  let precedent = null
  tries.forEach((ligne, index) => {
    if (ligne.total !== precedent) {
      rangCourant = index + 1
      precedent = ligne.total
    }
    ligne.rang = rangCourant
  })
  return tries
}
