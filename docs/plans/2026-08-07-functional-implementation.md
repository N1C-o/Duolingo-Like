# Phase fonctionnelle — 7 août 2026

## Contexte

La maquette haute fidélité Gabriel/Luca est validée. Le prototype contenait encore des données simulées et aucune persistance.

## Objectif

Livrer une première tranche jouable localement : accès profil, leçon JSON, progression persistée, feedback, XP, badges, déverrouillage et base PWA hors ligne.

## Périmètre livré

- Contrats TypeScript et JSON pour parcours, unités, leçons, vocabulaire, thèmes et badges.
- Validation runtime des références, types, réponses, prérequis et cycles.
- IndexedDB versionnée avec récupération d’état corrompu et fallback explicite.
- Moteur centralisé de leçon, erreurs, consolidation, XP, niveaux et récompenses idempotentes.
- Accès Gabriel/Luca, écran de parcours, unité, leçon, résumé, badges, paramètres et parental.
- Service worker, manifest et synthèse vocale navigateur.
- Contrat d’expérience des 23 leçons : mini-scène en quatre temps, checkpoint lecture/sons et mission de production guidée en fin d’unité.

## Correctif de revue livré

- Les réponses de choix, booléennes, remise en ordre, association et mémoire sont vérifiées dans `lib/progression/engine.ts`.
- Les erreurs intermédiaires des associations et du memory sont enregistrées sans clore prématurément l’exercice.
- Le cache offline ne renvoie la page racine qu’aux navigations ; l’état réseau initial est synchronisé après montage.
- Une cinquième leçon et les activités mémoire marquées `isRevisionActivity` rendent les badges « Cinq pas » et « Petit explorateur » atteignables.
- La récupération IndexedDB normalise maintenant les structures imbriquées avant persistance.
- Les invariants du moteur et de la persistance sont couverts par `npm test` avec Vitest.
- Les scènes, checkpoints et huit missions de production sont contrôlés par les tests de contenu ; leur résolution est reliée à la réussite de l’exercice référencé.
- Les sessions inconnues ou hors limite sont écartées ou bornées, et une première installation vide ne montre pas de faux message de récupération.
- Le build statique a été rechargé sur viewport 390×844 après coupure réseau ; une leçon a continué à modifier et conserver l’XP hors ligne.

## Étapes restantes

1. Installer le build PWA sur un appareil mobile réel et rejouer la perte réseau.
2. Faire relire les unités 3 à 8, puis ajouter les douze unités restantes selon le plan de production du contenu.
3. Ajuster XP, durée et consolidation après une première utilisation avec les enfants.

## Risques

- Disponibilité variable de `speechSynthesis` et des voix anglaises.
- Effacement possible des données locales par le navigateur ou l’appareil.
- Compatibilité d’installation PWA variable selon le navigateur.
- Installation PWA et validation sur appareil réel encore à faire ; le scénario automatisé local est couvert sur build statique.

## Checks de succès

- `npm run lint` passe.
- `npm run typecheck` passe.
- `npm run build` produit `/`, `/manifest.webmanifest` et les assets statiques.
- Une réponse validée modifie l’XP et survit à un rechargement.
- Les profils Gabriel et Luca n’échangent ni XP ni badges.
- Une unité suivante reste verrouillée tant que ses prérequis ne sont pas terminés.
- Une erreur d’association ou de mémoire apparaît dans les statistiques de notion sans attribuer une complétion prématurée.
- Chaque unité affiche une action d’enfant et une résolution narrative après réussite de sa mission finale.
