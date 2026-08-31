# Skull King — Livre de bord

Compteur de points pour le jeu de cartes **Skull King**, en 10 manches, de 2 à 8 joueurs.

## Ce que fait l'appli

- Saisie des paris **masquée** puis révélation simultanée (« Yo-ho-ho ! »), comme à la table.
- Contrôle automatique : le total des plis attribués doit égaler le nombre de cartes de la manche.
- Primes optionnelles par joueur, comptées uniquement si le pari est tenu.
- Tableau des scores avec détail manche par manche, et podium final.
- La partie en cours survit à un rafraîchissement de la page (stockage local du navigateur).

## Comptage appliqué

| Situation | Points |
|---|---|
| Pari ≥ 1 tenu | +20 par pli annoncé |
| Pari ≥ 1 manqué | −10 par pli d'écart |
| Pari à 0 tenu | +10 par carte de la manche |
| Pari à 0 manqué | −10 par carte de la manche |

Primes (seulement si le pari est tenu) : 14 jaune +10, 14 vert +10, 14 mauve (atout) +20,
pirate capturé par le Skull King +30, Skull King capturé par une sirène +50,
sirène capturée par un pirate +20.

Toute la logique est isolée dans `src/scoring.js` si un barème doit être ajusté.

## Développement

```bash
npm install
npm run dev
```

## Déploiement

Projet Vite statique. Sur Vercel : framework « Vite », commande `npm run build`, dossier de sortie `dist`.

## Version Android (APK)

L'appli est empaquetée avec [Capacitor](https://capacitorjs.com/) : le même code
web tourne dans une application Android native. Deux détails la rendent utilisable
hors connexion, à la table de jeu :

- les polices sont **embarquées** via `@fontsource` (aucun appel à Google Fonts) ;
- le service worker de la PWA est **désactivé** dans la build Android, sinon son
  cache continuerait de servir l'ancienne version après une mise à jour de l'APK.

### Prérequis

Android Studio (il fournit le JDK et le SDK Android). Avant de lancer Gradle :

```bash
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
```

### Fabriquer l'APK

```bash
npm run android:apk
```

L'APK de test sort dans `android/app/build/outputs/apk/debug/`.

Pour la version signée, destinée à être installée et partagée :

```bash
npm run android:sync && cd android && ./gradlew.bat assembleRelease
```

Elle sort dans `android/app/build/outputs/apk/release/app-release.apk`.

### Signature

La clé de publication est dans `android/skull-king.jks`, son mot de passe dans
`android/keystore.properties`. **Ces deux fichiers ne sont pas versionnés et ne
doivent pas l'être.** Il faut les sauvegarder : Android n'accepte de mettre à jour
une appli déjà installée que si la nouvelle version est signée avec la même clé.
Clé perdue = les utilisateurs doivent désinstaller avant de réinstaller.

### Icône et écran de démarrage

Générés depuis `public/icone-512.png` :

```bash
npm run assets:android
```

`scripts/generer-assets.mjs` prépare les images sources (dont l'avant-plan de
l'icône adaptative, détouré du fond via le canal vert), `capacitor-assets` les
décline dans toutes les tailles, puis `scripts/finaliser-icone.mjs` corrige le
gabarit adaptatif — sans quoi le fond, rentré de 16,7 %, laisse des coins
transparents dans le lanceur.
