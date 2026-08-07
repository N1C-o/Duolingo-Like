# Dette technique

## Validation navigateur mobile non exécutée

- **Impact :** la validation automatisée mobile/hors ligne n’est pas encore une preuve de livraison.
- **Cause actuelle :** le wrapper Playwright n’a pas pu télécharger `@playwright/cli` dans l’environnement sandbox et aucun package Playwright local n’est installé.
- **Contournement :** lint, typecheck, build statique et inspection du service worker passent ; le scénario réel doit être rejoué dès qu’un navigateur local est disponible.
- **Suite :** exécuter le plan de validation mobile/hors ligne dans [le plan de phase](./plans/2026-08-07-functional-implementation.md).

## Curriculum partiel

- **Impact :** seules deux unités et cinq leçons sont publiées.
- **Contournement :** le contrat de contenu et les onze types d’exercices sont déjà extensibles par JSON.
- **Suite :** ajouter les unités 3 à 8 sans modifier le moteur.

## Tests automatisés du moteur à ajouter

- **Impact :** les règles d’XP, migration et consolidation sont validées par typage et revue, mais pas encore par une suite de tests dédiée.
- **Suite :** ajouter des fixtures pures pour première complétion, rejeu plafonné, doublons de récompense, reset et déverrouillage.

## Cache PWA minimal

- **Impact :** le service worker utilise un cache shell versionné et met en cache les ressources de même origine au fil de leur chargement ; il n’y a pas encore d’écran de mise à jour de contenu.
- **Correction récente :** le fallback HTML est maintenant limité aux navigations ; les assets absents renvoient une erreur réseau normale au lieu de recevoir `/`.
- **Suite :** ajouter une stratégie explicite de version de contenu et un état de mise à jour avant d’étendre le curriculum.
