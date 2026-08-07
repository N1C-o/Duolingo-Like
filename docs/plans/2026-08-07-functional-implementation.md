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

## Correctif de revue livré

- Les réponses de choix, booléennes, remise en ordre, association et mémoire sont vérifiées dans `lib/progression/engine.ts`.
- Les erreurs intermédiaires des associations et du memory sont enregistrées sans clore prématurément l’exercice.
- Le cache offline ne renvoie la page racine qu’aux navigations ; l’état réseau initial est synchronisé après montage.
- Une cinquième leçon et les activités mémoire marquées `isRevisionActivity` rendent les badges « Cinq pas » et « Petit explorateur » atteignables.
- La récupération IndexedDB normalise maintenant les structures imbriquées avant persistance.

## Étapes restantes

1. Rejouer les parcours sur viewport mobile et appareil réel.
2. Couper le réseau après le premier chargement et vérifier chaque écran et la sauvegarde.
3. Ajouter les six unités manquantes et faire relire le contenu anglais/français.
4. Ajouter les tests unitaires du moteur et de la migration locale.
5. Ajuster XP, durée et consolidation après une première utilisation avec les enfants.

## Risques

- Disponibilité variable de `speechSynthesis` et des voix anglaises.
- Effacement possible des données locales par le navigateur ou l’appareil.
- Compatibilité d’installation PWA variable selon le navigateur.
- Validation navigateur encore bloquée par l’absence de runtime Playwright local dans l’environnement courant.

## Checks de succès

- `npm run lint` passe.
- `npm run typecheck` passe.
- `npm run build` produit `/`, `/manifest.webmanifest` et les assets statiques.
- Une réponse validée modifie l’XP et survit à un rechargement.
- Les profils Gabriel et Luca n’échangent ni XP ni badges.
- Une unité suivante reste verrouillée tant que ses prérequis ne sont pas terminés.
- Une erreur d’association ou de mémoire apparaît dans les statistiques de notion sans attribuer une complétion prématurée.
