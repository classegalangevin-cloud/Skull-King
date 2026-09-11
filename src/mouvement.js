// La feuille de style coupe toutes les animations quand le système demande un
// mouvement réduit. Une scène plein écran resterait alors figée plusieurs
// secondes : les animations s'appuient sur ce test pour se sauter entièrement.
export const mouvementReduit = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
