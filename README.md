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
