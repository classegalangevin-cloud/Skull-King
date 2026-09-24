import { useEffect, useMemo, useState } from 'react'
import {
  AVATARS,
  avatarParId,
  Baleine,
  Coche,
  Crane,
  Croix,
  Drapeau,
  Fleche,
  Haut_parleur,
  Kraken,
  Main,
  Moins,
  Muet,
  Piece,
  Plume,
  Plus,
  Poing,
  Sabres,
  SkullKing,
} from './icons.jsx'
import {
  BOULET,
  CHEVROTINE,
  classement,
  PARIS_RASCAL,
  plisAttendus,
  PRIMES,
  RASCAL,
  scoreManche,
  SKULL_KING,
  TOTAL_MANCHES,
  totalPrimes,
} from './scoring.js'
import AnimationKraken, { EmpriseKraken } from './Kraken.jsx'
import AnimationBaleine, { SillageBaleine } from './Baleine.jsx'
import AnimationCapture, { CAPTURES } from './Captures.jsx'
import {
  estSilencieux,
  jouerSon,
  reglerSilence,
  SONS_ACTIFS,
  taireTout,
} from '@sons'

const CLE = 'skull-king-livre-de-bord'

const chargerPartie = () => {
  try {
    const brut = localStorage.getItem(CLE)
    return brut ? JSON.parse(brut) : null
  } catch {
    return null
  }
}

const ligneVide = () => ({
  pari: null,
  plis: null,
  primes: {},
  rascal: 0,
  mise: CHEVROTINE,
})

const nouvelId = () => Math.random().toString(36).slice(2, 9)

/* ------------------------------------------------------------------ */
/* Écran 1 — l'équipage                                                */
/* ------------------------------------------------------------------ */

function Equipage({ onDemarrer, equipagePrecedent }) {
  const [joueurs, setJoueurs] = useState(
    equipagePrecedent ||
      [0, 1, 2].map((i) => ({ id: nouvelId(), nom: '', avatar: AVATARS[i].id })),
  )

  const ajouter = () => {
    if (joueurs.length >= 8) return
    const pris = new Set(joueurs.map((j) => j.avatar))
    const libre = AVATARS.find((a) => !pris.has(a.id)) || AVATARS[0]
    setJoueurs([...joueurs, { id: nouvelId(), nom: '', avatar: libre.id }])
  }

  const retirer = (id) => setJoueurs(joueurs.filter((j) => j.id !== id))

  const renommer = (id, nom) =>
    setJoueurs(joueurs.map((j) => (j.id === id ? { ...j, nom } : j)))

  const changerAvatar = (id) => {
    setJoueurs(
      joueurs.map((j) => {
        if (j.id !== id) return j
        const index = AVATARS.findIndex((a) => a.id === j.avatar)
        return { ...j, avatar: AVATARS[(index + 1) % AVATARS.length].id }
      }),
    )
  }

  const [mode, setMode] = useState(SKULL_KING)
  const [optionRascal, setOptionRascal] = useState(false)

  const pret = joueurs.length >= 2

  const demarrer = () =>
    onDemarrer(
      joueurs.map((j, i) => ({ ...j, nom: j.nom.trim() || `Moussaillon ${i + 1}` })),
      mode,
      mode === RASCAL && optionRascal,
    )

  return (
    <>
      <div className="accueil">
        <div className="blason">
          <SkullKing size={54} />
        </div>
        <h1 className="enseigne">
          Skull<span>King</span>
        </h1>
        <p className="sous-enseigne">Livre de bord</p>
      </div>

      <div className="panneau">
        <div className="bandeau">
          <h2>L&apos;équipage</h2>
          <span className="discret">{joueurs.length} / 8</span>
        </div>

        {joueurs.map((joueur, i) => {
          const Avatar = avatarParId(joueur.avatar)
          return (
            <div className="rang-joueur" key={joueur.id}>
              <button
                className="jeton-avatar"
                onClick={() => changerAvatar(joueur.id)}
                aria-label={`Changer l'emblème du joueur ${i + 1}`}
              >
                <Avatar size={24} />
              </button>
              <input
                className="champ"
                value={joueur.nom}
                onChange={(e) => renommer(joueur.id, e.target.value)}
                placeholder={`Moussaillon ${i + 1}`}
                maxLength={14}
                aria-label={`Nom du joueur ${i + 1}`}
              />
              <button
                className="icone-bouton"
                onClick={() => retirer(joueur.id)}
                disabled={joueurs.length <= 2}
                aria-label={`Retirer le joueur ${i + 1}`}
              >
                <Croix size={18} />
              </button>
            </div>
          )
        })}

        <hr className="filet" />

        <button className="bouton sobre" onClick={ajouter} disabled={joueurs.length >= 8}>
          <Plus size={16} /> Embarquer un joueur
        </button>
      </div>

      <div className="panneau">
        <p className="eyebrow">Le comptage appliqué</p>
        <hr className="filet" />

        <div className="choix-mode">
          <button
            className={'carte-mode' + (mode === SKULL_KING ? ' actif' : '')}
            onClick={() => setMode(SKULL_KING)}
            aria-pressed={mode === SKULL_KING}
          >
            <b>Skull King</b>
            <small>Le comptage classique, pour les audacieux.</small>
          </button>
          <button
            className={'carte-mode' + (mode === RASCAL ? ' actif' : '')}
            onClick={() => setMode(RASCAL)}
            aria-pressed={mode === RASCAL}
          >
            <b>Rascal</b>
            <small>Même potentiel pour tous, la précision décide.</small>
          </button>
        </div>

        <p className="discret" style={{ marginBottom: 0 }}>
          {mode === SKULL_KING ? (
            <>
              Pari tenu : 20 points par pli annoncé. Pari à zéro tenu : 10 points par carte de
              la manche. Pari manqué : −10 points par pli d&apos;écart, ou −10 par carte si le
              pari était à zéro. Les primes sont acquises dans tous les cas.
            </>
          ) : (
            <>
              10 points par carte distribuée sont en jeu pour chacun, quelle que soit la mise.
              Coup direct : tout. Frappe à revers, un pli d&apos;écart : la moitié. Échec
              cuisant, deux ou plus : rien. Les primes suivent le même barème.
            </>
          )}
        </p>

        {mode === RASCAL && (
          <>
            <hr className="filet" />
            <button
              className={'bascule-option' + (optionRascal ? ' actif' : '')}
              onClick={() => setOptionRascal(!optionRascal)}
              aria-pressed={optionRascal}
            >
              <span className="voyant-option" />
              <span>
                <b>Chevrotine ou boulet de canon</b>
                <small>
                  Règle optionnelle : chacun annonce après la mise. Le boulet rapporte 15 points
                  par carte sur un coup direct, et rien du tout sinon.
                </small>
              </span>
            </button>
          </>
        )}
      </div>

      <div className="barre">
        <div className="dedans">
          <button className="bouton or" onClick={demarrer} disabled={!pret}>
            <Sabres size={18} /> Larguer les amarres
          </button>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Sélecteur de jetons 0 … n                                           */
/* ------------------------------------------------------------------ */

// Coupe-son. Absent de la version web, qui n'embarque aucun bruitage.
function BoutonSon({ silence, onBasculer }) {
  if (!SONS_ACTIFS) return null
  return (
    <button
      type="button"
      className={'puce-son' + (silence ? ' coupe' : '')}
      onClick={onBasculer}
      aria-pressed={silence}
      aria-label={silence ? 'Rétablir les bruitages' : 'Couper les bruitages'}
      title={silence ? 'Rétablir les bruitages' : 'Couper les bruitages'}
    >
      {silence ? <Muet size={17} /> : <Haut_parleur size={17} />}
    </button>
  )
}

function Jetons({ max, valeur, onChoisir }) {
  return (
    <div className="jetons">
      {Array.from({ length: max + 1 }, (_, n) => (
        <button
          key={n}
          className={'jeton' + (valeur === n ? ' choisi' : '')}
          onClick={() => onChoisir(n)}
          aria-label={n === 0 ? 'Zéro' : String(n)}
          aria-pressed={valeur === n}
        >
          {n === 0 ? <Poing size={20} /> : n}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Primes d'une manche                                                 */
/* ------------------------------------------------------------------ */

function Primes({ primes, onChanger, rascal, onRascal, mode, ecart, onCapture }) {
  const [ouvert, setOuvert] = useState(false)
  const somme = totalPrimes(primes)

  // En mode Rascal, les primes suivent la précision de la mise : entières sur
  // un coup direct, à moitié sur une frappe à revers, perdues au-delà.
  const avisRascal =
    mode === RASCAL && ecart != null && somme > 0
      ? ecart === 0
        ? null
        : ecart === 1
          ? 'Frappe à revers : ces primes comptent pour moitié.'
          : 'Échec cuisant : ces primes ne comptent pas.'
      : null

  return (
    <>
      <button className="bascule-primes" onClick={() => setOuvert(!ouvert)}>
        <Piece size={16} />
        {somme > 0 ? `Primes : +${somme}` : 'Primes'}
        <Fleche
          size={14}
          style={{ transform: ouvert ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}
        />
      </button>

      {ouvert && (
        <div className="liste-primes">
          {PRIMES.map((prime) => {
            const n = primes[prime.id] || 0
            const modifier = (delta) => {
              const suivant = Math.min(prime.max, Math.max(0, n + delta))
              onChanger({ ...primes, [prime.id]: suivant })
              // Les captures ont droit à leur saynète, mais seulement quand on
              // en ajoute une : la retirer ne doit pas rejouer la scène.
              if (suivant > n) onCapture(prime.id)
            }
            return (
              <div className="ligne-prime" key={prime.id}>
                <span className={`etiquette-prime ${prime.teinte}`}>
                  <b>{prime.label}</b>
                  <small>+{prime.points} pts</small>
                </span>
                {prime.max === 1 ? (
                  <button
                    className={'jeton' + (n ? ' choisi' : '')}
                    onClick={() => modifier(n ? -1 : 1)}
                    aria-pressed={n === 1}
                    aria-label={prime.label}
                  >
                    {n ? <Coche size={18} /> : <Croix size={16} />}
                  </button>
                ) : (
                  <span className="pas">
                    <button
                      className="icone-bouton"
                      onClick={() => modifier(-1)}
                      disabled={n === 0}
                      aria-label={`Retirer une prime ${prime.label}`}
                    >
                      <Moins size={16} />
                    </button>
                    <span className="valeur">{n}</span>
                    <button
                      className="icone-bouton"
                      onClick={() => modifier(1)}
                      disabled={n >= prime.max}
                      aria-label={`Ajouter une prime ${prime.label}`}
                    >
                      <Plus size={16} />
                    </button>
                  </span>
                )}
              </div>
            )
          })}
          {/* Pouvoir de Rascal le Flambeur : une mise à quitte ou double,
              gagnée si le pari est tenu, perdue sinon. */}
          <div className="ligne-prime pari-rascal">
            <span className="etiquette-prime or">
              <b>Pari Rascal</b>
              <small>Gagné si le pari est tenu, perdu sinon</small>
            </span>
            <span className="choix-rascal">
              {PARIS_RASCAL.map((valeur) => (
                <button
                  key={valeur}
                  className={'jeton' + (rascal === valeur ? ' choisi' : '')}
                  onClick={() => onRascal(valeur)}
                  aria-pressed={rascal === valeur}
                  aria-label={valeur === 0 ? 'Aucun pari Rascal' : `Parier ${valeur} points`}
                >
                  {valeur === 0 ? <Croix size={15} /> : valeur}
                </button>
              ))}
            </span>
          </div>

          {avisRascal && <p className="avis-primes">{avisRascal}</p>}
        </div>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Écran 2 — la manche                                                 */
/* ------------------------------------------------------------------ */

function Manche({ partie, setPartie }) {
  const { joueurs, manche, etape, manches } = partie
  const lignes = manches[manche] || {}
  const krakens = partie.krakens || {}
  const baleines = partie.baleines || {}
  const kraken = Boolean(krakens[manche])
  const baleine = Boolean(baleines[manche])
  const donneur = joueurs[(manche - 1) % joueurs.length]
  // Pari ouvert à la saisie : un seul à la fois, refermé aussitôt choisi,
  // pour que le voisin ne lise pas le jeton sélectionné.
  const [pariOuvert, setPariOuvert] = useState(null)
  const [krakenEnScene, setKrakenEnScene] = useState(false)
  const [baleineEnScene, setBaleineEnScene] = useState(false)
  // Saynète de capture en cours, s'il y en a une : elle ne laisse aucune trace.
  const [capture, setCapture] = useState(null)

  const mode = partie.mode || SKULL_KING
  const optionRascal = Boolean(partie.optionRascal)

  // Le compteur sert de clé de rendu : deux captures d'affilée remontent la
  // scène à neuf, et l'animation rejoue depuis le début. La saynète joue
  // elle-même son bruitage, calé sur l'image.
  const declencherCapture = (idPrime) => {
    if (!CAPTURES.includes(idPrime)) return
    setCapture((precedente) => ({ type: idPrime, n: (precedente ? precedente.n : 0) + 1 }))
  }

  const majLigne = (idJoueur, champs) =>
    setPartie({
      ...partie,
      manches: {
        ...manches,
        [manche]: {
          ...lignes,
          [idJoueur]: { ...(lignes[idJoueur] || ligneVide()), ...champs },
        },
      },
    })

  const tousParisPris = joueurs.every((j) => lignes[j.id] && lignes[j.id].pari != null)
  const plisPoses = joueurs.reduce((s, j) => s + ((lignes[j.id] && lignes[j.id].plis) || 0), 0)
  const plisComplets = joueurs.every((j) => lignes[j.id] && lignes[j.id].plis != null)
  const attendus = plisAttendus(manche, kraken, baleine)
  const compteJuste = plisComplets && plisPoses === attendus

  // Déclarer un incident retire un pli à répartir : les décomptes déjà saisis
  // qui dépassent le nouveau maximum sont ramenés dessus, sans quoi ils
  // resteraient sur un jeton qui n'existe plus.
  const declarer = (prochainKraken, prochaineBaleine) => {
    const plafond = plisAttendus(manche, prochainKraken, prochaineBaleine)
    const corrigees = {}
    joueurs.forEach((j) => {
      const ligne = lignes[j.id]
      if (!ligne) return
      corrigees[j.id] =
        ligne.plis != null && ligne.plis > plafond ? { ...ligne, plis: plafond } : ligne
    })

    setPartie({
      ...partie,
      krakens: { ...krakens, [manche]: prochainKraken },
      baleines: { ...baleines, [manche]: prochaineBaleine },
      manches: { ...manches, [manche]: { ...lignes, ...corrigees } },
    })
  }

  const basculerKraken = () => {
    const actif = !kraken
    declarer(actif, baleine)
    if (actif) {
      jouerSon('kraken')
      setKrakenEnScene(true)
    }
  }

  const basculerBaleine = () => {
    const actif = !baleine
    declarer(kraken, actif)
    if (actif) {
      jouerSon('baleine')
      setBaleineEnScene(true)
    }
  }

  const valider = () => {
    if (manche === TOTAL_MANCHES) {
      jouerSon('podium')
      setPartie({ ...partie, etape: 'fin' })
    } else {
      jouerSon('manche')
      setPartie({ ...partie, etape: 'bilan' })
    }
  }

  const mancheSuivante = () =>
    setPartie({ ...partie, manche: manche + 1, etape: 'paris' })

  /* --- Bilan de fin de manche --- */
  if (etape === 'bilan') {
    const table = classement(joueurs, manches, mode)
    const resultats = joueurs
      .map((joueur) => ({
        joueur,
        ...scoreManche(lignes[joueur.id], manche, mode),
        cumul: table.find((l) => l.joueur.id === joueur.id).total,
      }))
      .sort((a, b) => b.cumul - a.cumul)

    return (
      <>
        <div className="panneau">
          <div className="bandeau">
            <div>
              <p className="eyebrow">Butin de la manche</p>
              <h2>Manche {manche}</h2>
            </div>
          </div>

          <table className="tableau">
            <thead>
              <tr>
                <th>Joueur</th>
                <th>Pari</th>
                <th>Plis</th>
                <th>Manche</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map(({ joueur, base, prime, total, reussi, cumul }) => {
                const Avatar = avatarParId(joueur.avatar)
                const ligne = lignes[joueur.id]
                return (
                  <tr key={joueur.id}>
                    <td>
                      <span className="cellule-joueur">
                        <span className="puce">
                          <Avatar size={15} />
                        </span>
                        {joueur.nom}
                      </span>
                    </td>
                    <td>{ligne.pari}</td>
                    <td style={{ color: reussi ? 'var(--or-vif)' : '#e78a7a' }}>{ligne.plis}</td>
                    <td className={total >= 0 ? 'gain' : 'perte'}>
                      {total >= 0 ? '+' : ''}
                      {total}
                      {prime > 0 && (
                        <small style={{ display: 'block', color: 'var(--or)' }}>
                          dont {base >= 0 ? '+' : ''}
                          {prime} de primes
                        </small>
                      )}
                    </td>
                    <td className="total">{cumul}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="barre">
          <div className="dedans">
            <div className="duo">
              <button
                className="bouton sobre"
                onClick={() => setPartie({ ...partie, etape: 'plis' })}
              >
                <Plume size={15} /> Corriger
              </button>
              <button className="bouton or" onClick={mancheSuivante}>
                Manche {manche + 1} <Fleche size={16} />
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  /* --- Paris et plis --- */
  return (
    <>
      {krakenEnScene && <AnimationKraken onFini={() => setKrakenEnScene(false)} />}
      {baleineEnScene && <AnimationBaleine onFini={() => setBaleineEnScene(false)} />}
      {capture && (
        <AnimationCapture
          key={capture.n}
          type={capture.type}
          onFini={() => setCapture(null)}
        />
      )}
      {/* Les tentacules s'installent une fois la bête passée, et restent
          agrippées tant que le Kraken est déclaré sur la manche. */}
      {kraken && !krakenEnScene && <EmpriseKraken />}
      {baleine && !baleineEnScene && <SillageBaleine />}

      <div className="bandeau">
        <div>
          <p className="eyebrow">{etape === 'plis' ? 'Décompte des plis' : 'Les paris'}</p>
          <h2>Manche {manche}</h2>
          {/* Les deux incidents qui annulent un pli, côte à côte sur leur
              propre rangée : à trois éléments, le titre les repousserait à la
              ligne de façon désordonnée dès que le numéro de manche s'allonge. */}
          <div className="incidents">
            <button
              type="button"
              className={'puce-kraken' + (kraken ? ' actif' : '')}
              onClick={basculerKraken}
              aria-pressed={kraken}
              aria-label={
                kraken
                  ? `Kraken déclaré : un pli englouti, ${attendus} à répartir. Toucher pour annuler.`
                  : 'Déclarer le Kraken : il engloutit un pli de la manche.'
              }
            >
              <Kraken size={17} />
              Kraken
            </button>

            <button
              type="button"
              className={'puce-kraken puce-baleine' + (baleine ? ' actif' : '')}
              onClick={basculerBaleine}
              aria-pressed={baleine}
              aria-label={
                baleine
                  ? `Baleine et fuites déclarées : un pli annulé, ${attendus} à répartir. Toucher pour annuler.`
                  : 'Déclarer un pli Baleine avec fuites : il ne revient à personne.'
              }
            >
              <Baleine size={17} />
              Baleine sans pli
            </button>
          </div>
        </div>
        <div
          className="compteur-cartes"
          aria-label={`${manche} carte${manche > 1 ? 's' : ''} par joueur`}
        >
          {Array.from({ length: manche }, (_, i) => (
            <span className="mini-carte" key={i} />
          ))}
        </div>
      </div>

      <p className="discret" style={{ marginTop: -6, marginBottom: 12 }}>
        {manche} carte{manche > 1 ? 's' : ''} par joueur — {donneur.nom} distribue.
        {etape === 'paris' && ' Chacun saisit son pari à l’abri des regards.'}
      </p>

      {etape === 'plis' && (
        <div
          className={
            'jauge' + (compteJuste ? ' juste' : plisPoses > attendus ? ' trop' : '')
          }
        >
          <span>
            {['Plis attribués', kraken && 'Kraken', baleine && 'Baleine']
              .filter(Boolean)
              .join(' · ')}
          </span>
          <span>
            {plisPoses} / {attendus}
          </span>
        </div>
      )}

      {joueurs.map((joueur) => {
        const Avatar = avatarParId(joueur.avatar)
        const ligne = lignes[joueur.id] || ligneVide()
        const scelle = ligne.pari != null

        return (
          <div
            className={'carte-joueur' + (etape === 'paris' && scelle ? ' actif' : '')}
            key={joueur.id}
          >
            <div className="entete-joueur">
              <span className="jeton-avatar" style={{ width: 34, height: 34 }}>
                <Avatar size={19} />
              </span>
              <span className="nom-joueur">{joueur.nom}</span>

              {etape === 'paris' &&
                (scelle ? (
                  <button
                    className="etat scelle"
                    onClick={() => setPariOuvert(pariOuvert === joueur.id ? null : joueur.id)}
                  >
                    <Crane size={16} /> Scellé
                  </button>
                ) : (
                  <span className="etat">À parier</span>
                ))}

              {etape === 'reveal' && (
                <span className="pari-revele retourne">
                  {ligne.pari === 0 ? <Poing size={26} /> : ligne.pari}
                </span>
              )}

              {etape === 'plis' && (
                <span className="rappel-pari">
                  Pari&nbsp;
                  <b style={{ color: 'var(--or-vif)', fontSize: 19 }}>{ligne.pari}</b>
                </span>
              )}
            </div>

            {etape === 'paris' && (!scelle || pariOuvert === joueur.id) && (
              <Jetons
                max={manche}
                valeur={pariOuvert === joueur.id ? ligne.pari : null}
                onChoisir={(n) => {
                  majLigne(joueur.id, { pari: n })
                  setPariOuvert(null)
                }}
              />
            )}

            {etape === 'plis' && (
              <>
                <Jetons
                  max={attendus}
                  valeur={ligne.plis}
                  onChoisir={(n) => majLigne(joueur.id, { plis: n })}
                />
                {mode === RASCAL && optionRascal && (
                  <div className="choix-mise">
                    <button
                      className={'puce-mise' + (ligne.mise !== BOULET ? ' actif' : '')}
                      onClick={() => majLigne(joueur.id, { mise: CHEVROTINE })}
                      aria-pressed={ligne.mise !== BOULET}
                    >
                      <Main size={16} /> Chevrotine
                    </button>
                    <button
                      className={'puce-mise' + (ligne.mise === BOULET ? ' actif' : '')}
                      onClick={() => majLigne(joueur.id, { mise: BOULET })}
                      aria-pressed={ligne.mise === BOULET}
                    >
                      <Poing size={16} /> Boulet
                    </button>
                  </div>
                )}

                <Primes
                  primes={ligne.primes}
                  onChanger={(primes) => majLigne(joueur.id, { primes })}
                  rascal={ligne.rascal || 0}
                  onRascal={(rascal) => majLigne(joueur.id, { rascal })}
                  mode={mode}
                  ecart={
                    ligne.plis != null && ligne.pari != null
                      ? Math.abs(ligne.pari - ligne.plis)
                      : null
                  }
                  onCapture={declencherCapture}
                />
              </>
            )}
          </div>
        )
      })}

      {etape === 'plis' && (
        <button
          className="bouton sobre"
          style={{ marginTop: 12 }}
          onClick={() => setPartie({ ...partie, etape: 'paris' })}
        >
          <Plume size={15} /> Revenir aux paris
        </button>
      )}

      <div className="barre">
        <div className="dedans">
          {etape === 'paris' && (
            <button
              className="bouton or"
              onClick={() => {
                jouerSon('yohoho')
                setPartie({ ...partie, etape: 'reveal' })
              }}
              disabled={!tousParisPris}
            >
              <span className="yoho">Yo-ho-ho&nbsp;!</span>
            </button>
          )}

          {etape === 'reveal' && (
            <div className="duo">
              <button
                className="bouton sobre"
                onClick={() => setPartie({ ...partie, etape: 'paris' })}
              >
                <Plume size={15} /> Corriger
              </button>
              <button
                className="bouton or"
                onClick={() => setPartie({ ...partie, etape: 'plis' })}
              >
                Aux plis <Fleche size={16} />
              </button>
            </div>
          )}

          {etape === 'plis' && (
            <button className="bouton or" onClick={valider} disabled={!compteJuste}>
              {compteJuste ? (
                <>
                  <Coche size={17} /> Inscrire la manche
                </>
              ) : (
                `${plisPoses} pli${plisPoses > 1 ? 's' : ''} sur ${attendus} attribué${
                  plisPoses > 1 ? 's' : ''
                }`
              )}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Écran 3 — le tableau des scores                                     */
/* ------------------------------------------------------------------ */

function Scores({ partie, complet }) {
  const [ouvert, setOuvert] = useState(null)
  const table = useMemo(
    () => classement(partie.joueurs, partie.manches, partie.mode || SKULL_KING),
    [partie.joueurs, partie.manches, partie.mode],
  )

  return (
    <div className="panneau">
      <div className="bandeau">
        <div>
          <p className="eyebrow">{complet ? 'Partie terminée' : 'En cours'}</p>
          <h2>Le tableau</h2>
        </div>
        <span className="discret">
          {Math.min(partie.manche, TOTAL_MANCHES)} / {TOTAL_MANCHES} manches
        </span>
      </div>

      <table className="tableau">
        <thead>
          <tr>
            <th>Joueur</th>
            <th>Manches</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {table.map(({ joueur, total, detail, rang }) => {
            const Avatar = avatarParId(joueur.avatar)
            const estOuvert = ouvert === joueur.id
            return (
              <tr key={joueur.id} onClick={() => setOuvert(estOuvert ? null : joueur.id)}>
                <td>
                  <span className="cellule-joueur">
                    <span className="rang">{rang}</span>
                    <span className="puce">
                      <Avatar size={15} />
                    </span>
                    {joueur.nom}
                  </span>
                  {estOuvert && (
                    <div className="detail-manches">
                      {detail.length === 0 && (
                        <span className="discret">Aucune manche inscrite.</span>
                      )}
                      {detail.map((d) => (
                        <div className="ligne-manche" key={d.manche}>
                          <span className="m">M{d.manche}</span>
                          <span>
                            pari {d.pari} · plis {d.plis}
                            {d.prime > 0 && ` · primes +${d.prime}`}
                          </span>
                          <span className={'pts ' + (d.total >= 0 ? 'gain' : 'perte')}>
                            {d.total >= 0 ? '+' : ''}
                            {d.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td>{detail.length}</td>
                <td className="total">{total}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="discret" style={{ marginTop: 12, marginBottom: 0 }}>
        Touchez un joueur pour ouvrir le détail de ses manches.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Écran 4 — fin de partie                                             */
/* ------------------------------------------------------------------ */

function Fin({ partie, onRejouer, onNouvelle }) {
  const table = classement(partie.joueurs, partie.manches, partie.mode || SKULL_KING)
  const vainqueurs = table.filter((l) => l.rang === 1)
  const Avatar = avatarParId(vainqueurs[0].joueur.avatar)

  return (
    <>
      <div className="panneau podium">
        <div className="blason">
          <SkullKing size={48} />
        </div>
        <p className="eyebrow" style={{ marginTop: 10 }}>
          {vainqueurs.length > 1 ? 'Équipages à égalité' : 'Maître du navire'}
        </p>
        <h1 className="vainqueur">{vainqueurs.map((v) => v.joueur.nom).join(' & ')}</h1>
        <p className="discret" style={{ letterSpacing: '.2em' }}>
          {vainqueurs[0].total} points
        </p>
        <div style={{ color: 'var(--or)', marginTop: 6 }}>
          <Avatar size={30} />
        </div>
      </div>

      <Scores partie={partie} complet />

      <div className="barre">
        <div className="dedans">
          <div className="duo">
            <button className="bouton sobre" onClick={onNouvelle}>
              <Drapeau size={15} /> Nouvel équipage
            </button>
            <button className="bouton or" onClick={onRejouer}>
              <Sabres size={16} /> Rejouer
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Application                                                         */
/* ------------------------------------------------------------------ */

export default function App() {
  const [partie, setPartie] = useState(chargerPartie)
  const [vue, setVue] = useState('manche')
  // Le réglage vit dans le module audio et dans le stockage local ; cette copie
  // ne sert qu'à redessiner le bouton.
  const [silence, setSilence] = useState(estSilencieux)

  const basculerSon = () => {
    const coupe = !silence
    reglerSilence(coupe)
    if (coupe) taireTout()
    setSilence(coupe)
  }

  useEffect(() => {
    try {
      if (partie) localStorage.setItem(CLE, JSON.stringify(partie))
      else localStorage.removeItem(CLE)
    } catch {
      /* stockage indisponible : la partie reste en mémoire */
    }
  }, [partie])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [partie && partie.manche, partie && partie.etape, vue])

  // Sur téléphone, l'écran ne doit pas s'éteindre entre deux manches.
  const enPartie = partie !== null
  useEffect(() => {
    if (!enPartie || !('wakeLock' in navigator)) return
    let verrou = null
    let abandonne = false

    const demander = async () => {
      try {
        verrou = await navigator.wakeLock.request('screen')
      } catch {
        /* refusé par le navigateur ou batterie trop faible */
      }
    }
    const reprendre = () => {
      if (document.visibilityState === 'visible' && !abandonne) demander()
    }

    demander()
    document.addEventListener('visibilitychange', reprendre)
    return () => {
      abandonne = true
      document.removeEventListener('visibilitychange', reprendre)
      if (verrou) verrou.release().catch(() => {})
    }
  }, [enPartie])

  const demarrer = (joueurs, mode = SKULL_KING, optionRascal = false) => {
    setPartie({
      joueurs,
      mode,
      optionRascal,
      manche: 1,
      etape: 'paris',
      manches: {},
      krakens: {},
      baleines: {},
    })
    setVue('manche')
  }

  // Rejouer garde l'équipage et le mode de comptage de la partie qui s'achève.
  const rejouer = () =>
    demarrer(partie.joueurs, partie.mode || SKULL_KING, Boolean(partie.optionRascal))

  const nouvelle = () => setPartie(null)

  const abandonner = () => {
    if (window.confirm('Abandonner la partie en cours ?')) setPartie(null)
  }

  if (!partie) {
    return (
      <div className="appli">
        <Equipage onDemarrer={demarrer} />
      </div>
    )
  }

  if (partie.etape === 'fin') {
    return (
      <div className="appli">
        {/* Le podium sort de la barre d'onglets : le coupe-son y est reposé
            pour rester accessible pendant la fanfare. */}
        <div className="coin-son">
          <BoutonSon silence={silence} onBasculer={basculerSon} />
        </div>
        <Fin partie={partie} onRejouer={rejouer} onNouvelle={nouvelle} />
      </div>
    )
  }

  return (
    <div className="appli">
      <div className="onglets">
        <button
          className={'onglet' + (vue === 'manche' ? ' actif' : '')}
          onClick={() => setVue('manche')}
        >
          Manche {partie.manche}
        </button>
        <button
          className={'onglet' + (vue === 'scores' ? ' actif' : '')}
          onClick={() => setVue('scores')}
        >
          Le tableau
        </button>
        <BoutonSon silence={silence} onBasculer={basculerSon} />
      </div>

      {vue === 'manche' ? (
        <Manche partie={partie} setPartie={setPartie} />
      ) : (
        <>
          <Scores partie={partie} />
          <button className="bouton sobre" style={{ marginTop: 12 }} onClick={abandonner}>
            <Croix size={15} /> Abandonner la partie
          </button>
        </>
      )}

      <p className="pied">Skull King · Livre de bord</p>
    </div>
  )
}
