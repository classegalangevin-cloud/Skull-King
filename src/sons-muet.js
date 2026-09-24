// Version web : aucun bruitage, et surtout aucun import de MP3, pour que le
// site reste léger. vite.config.js redirige '@sons' vers ce fichier quand la
// build n'est pas destinée à Android.
//
// Même signature que src/sons.js : le reste du code n'a pas à savoir lequel
// des deux il utilise.

export const SONS_ACTIFS = false

export const estSilencieux = () => true

export function reglerSilence() {}

export function preparerSon() {}

export function jouerSon() {}

export function taireTout() {}
