import { useEffect, useMemo, useState } from 'react'
import {
  AVATARS,
  avatarParId,
  Coche,
  Crane,
  Croix,
  Drapeau,
  Fleche,
  Moins,
  Piece,
  Plume,
  Plus,
  Poing,
  Sabres,
  SkullKing,
} from './icons.jsx'
import { classement, PRIMES, scoreManche, TOTAL_MANCHES, totalPrimes } from './scoring.js'

const CLE = 'skull-king-livre-de-bord'

const chargerPartie = () => {
  try {
    const brut = localStorage.getItem(CLE)
    return brut ? JSON.parse(brut) : null
  } catch {
    return null
  }
}

const ligneVide = () => ({ pari: null, plis: null, primes: {} })

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

  const pret = joueurs.length >= 2

  const demarrer = () =>
    onDemarrer(
      joueurs.map((j, i) => ({ ...j, nom: j.nom.trim() || `Moussaillon ${i + 1}` })),
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
        <p className="discret" style={{ margin: 0 }}>
          Pari tenu : 20 points par pli annoncé. Pari à zéro tenu : 10 points par carte de la
          manche. Pari manqué : −10 points par pli d&apos;écart, ou −10 par carte si le pari
          était à zéro. Les primes ne comptent que si le pari est tenu.
        </p>
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

function Primes({ primes, onChanger, actives }) {
  const [ouvert, setOuvert] = useState(false)
  const somme = totalPrimes(primes)

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
          {!actives && somme > 0 && (
            <p className="avis-primes">Pari manqué : ces primes ne seront pas comptées.</p>
          )}
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
  const donneur = joueurs[(manche - 1) % joueurs.length]
  // Pari ouvert à la saisie : un seul à la fois, refermé aussitôt choisi,
  // pour que le voisin ne lise pas le jeton sélectionné.
  const [pariOuvert, setPariOuvert] = useState(null)

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
  const compteJuste = plisComplets && plisPoses === manche

  const valider = () => {
    if (manche === TOTAL_MANCHES) setPartie({ ...partie, etape: 'fin' })
    else setPartie({ ...partie, etape: 'bilan' })
  }

  const mancheSuivante = () =>
    setPartie({ ...partie, manche: manche + 1, etape: 'paris' })

  /* --- Bilan de fin de manche --- */
  if (etape === 'bilan') {
    const table = classement(joueurs, manches)
    const resultats = joueurs
      .map((joueur) => ({
        joueur,
        ...scoreManche(lignes[joueur.id], manche),
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
      <div className="bandeau">
        <div>
          <p className="eyebrow">{etape === 'plis' ? 'Décompte des plis' : 'Les paris'}</p>
          <h2>Manche {manche}</h2>
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
            'jauge' + (compteJuste ? ' juste' : plisPoses > manche ? ' trop' : '')
          }
        >
          <span>Plis attribués</span>
          <span>
            {plisPoses} / {manche}
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
                  max={manche}
                  valeur={ligne.plis}
                  onChoisir={(n) => majLigne(joueur.id, { plis: n })}
                />
                <Primes
                  primes={ligne.primes}
                  actives={ligne.plis != null && ligne.plis === ligne.pari}
                  onChanger={(primes) => majLigne(joueur.id, { primes })}
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
              onClick={() => setPartie({ ...partie, etape: 'reveal' })}
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
                `${plisPoses} pli${plisPoses > 1 ? 's' : ''} sur ${manche} attribué${
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
    () => classement(partie.joueurs, partie.manches),
    [partie.joueurs, partie.manches],
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
  const table = classement(partie.joueurs, partie.manches)
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

  const demarrer = (joueurs) => {
    setPartie({ joueurs, manche: 1, etape: 'paris', manches: {} })
    setVue('manche')
  }

  const rejouer = () => demarrer(partie.joueurs)

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
