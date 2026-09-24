// Bruitages — version Android uniquement.
//
// La build web reçoit à la place src/sons-muet.js, via une redirection déclarée
// dans vite.config.js : les MP3 ne sont donc même pas empaquetés pour le site.

import baleine from './sons/baleine.mp3'
import kraken from './sons/kraken.mp3'
import manche from './sons/manche.mp3'
import pirate from './sons/pirate.mp3'
import podium from './sons/podium.mp3'
import sirene from './sons/sirene.mp3'
import skullking from './sons/skullking.mp3'
import yohoho from './sons/yohoho.mp3'

export const SONS_ACTIFS = true

const FICHIERS = { baleine, kraken, manche, pirate, podium, sirene, skullking, yohoho }

const CLE_SILENCE = 'skull-king-silence'

const lireSilence = () => {
  try {
    return localStorage.getItem(CLE_SILENCE) === '1'
  } catch {
    return false
  }
}

let silencieux = lireSilence()
const pretsAJouer = {}

export const estSilencieux = () => silencieux

export function reglerSilence(valeur) {
  silencieux = Boolean(valeur)
  try {
    localStorage.setItem(CLE_SILENCE, silencieux ? '1' : '0')
  } catch {
    /* stockage indisponible : le réglage vaut pour la session */
  }
}

// Un élément par bruitage, préparé une fois. On rejoue en remettant la tête de
// lecture à zéro plutôt qu'en recréant un objet : c'est instantané, et deux
// déclenchements rapprochés ne se superposent pas.
function element(nom) {
  if (!pretsAJouer[nom]) {
    const audio = new Audio(FICHIERS[nom])
    audio.preload = 'auto'
    pretsAJouer[nom] = audio
  }
  return pretsAJouer[nom]
}

// Charge un bruitage à l'avance, quand on sait qu'il va servir sous peu :
// une saynète le prépare dès son ouverture et le joue au bon moment.
export function preparerSon(nom) {
  if (FICHIERS[nom]) element(nom)
}

export function jouerSon(nom) {
  if (silencieux || !FICHIERS[nom]) return
  try {
    const audio = element(nom)
    audio.currentTime = 0
    // Android refuse la lecture tant qu'aucun geste n'a eu lieu : tous nos
    // bruitages suivent un appui, mais on avale le refus par précaution.
    const promesse = audio.play()
    if (promesse && promesse.catch) promesse.catch(() => {})
  } catch {
    /* lecture impossible : le jeu continue sans le son */
  }
}

// Coupe net ce qui est en cours — utilisé quand on active le silence.
export function taireTout() {
  Object.values(pretsAJouer).forEach((audio) => {
    try {
      audio.pause()
      audio.currentTime = 0
    } catch {
      /* rien à faire */
    }
  })
}
