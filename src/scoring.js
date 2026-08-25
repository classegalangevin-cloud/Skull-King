// Règles de comptage du Skull King
//
// Pari réussi (pari >= 1) : 20 points par pli annoncé.
// Pari réussi à 0        : 10 points par carte distribuée dans la manche.
// Pari raté (pari >= 1)  : -10 points par pli d'écart.
// Pari raté à 0          : -10 points par carte distribuée dans la manche.
// Primes : uniquement si le pari est réussi. Jamais retirées si le pari est raté.

export const TOTAL_MANCHES = 10

export const PRIMES = [
  { id: 'q14jaune', label: '14 Jaune', court: '14', points: 10, max: 1, teinte: 'jaune' },
  { id: 'q14vert', label: '14 Vert', court: '14', points: 10, max: 1, teinte: 'vert' },
  { id: 'q14mauve', label: '14 Mauve', court: '14', points: 20, max: 1, teinte: 'mauve' },
  { id: 'pirateParSk', label: 'Pirate pris par le Skull King', court: 'Pirate', points: 30, max: 5, teinte: 'or' },
  { id: 'skParSirene', label: 'Skull King pris par une Sirène', court: 'Skull King', points: 50, max: 1, teinte: 'or' },
  { id: 'sireneParPirate', label: 'Sirène prise par un Pirate', court: 'Sirène', points: 20, max: 2, teinte: 'or' },
]

export function totalPrimes(primes = {}) {
  return PRIMES.reduce((somme, p) => somme + p.points * (primes[p.id] || 0), 0)
}

// Renvoie le détail du score d'un joueur pour une manche.
export function scoreManche(ligne, manche) {
  const vide = { base: 0, prime: 0, total: 0, reussi: false, complet: false }
  if (!ligne) return vide
  const { pari, plis, primes } = ligne
  if (pari == null || plis == null) return vide

  const reussi = pari === plis
  let base
  if (pari === 0) base = reussi ? 10 * manche : -10 * manche
  else base = reussi ? 20 * pari : -10 * Math.abs(pari - plis)

  const prime = reussi ? totalPrimes(primes) : 0
  return { base, prime, total: base + prime, reussi, complet: true }
}

// Cumul de tous les joueurs jusqu'à la manche courante incluse.
export function classement(joueurs, manches) {
  const lignes = joueurs.map((joueur) => {
    const detail = []
    let cumul = 0
    for (let m = 1; m <= TOTAL_MANCHES; m++) {
      const donnees = manches[m] && manches[m][joueur.id]
      const score = scoreManche(donnees, m)
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
