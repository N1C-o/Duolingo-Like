# Début du parcours — Design validé

## Objectif

Afficher le repère « Début » au commencement visuel et sémantique de la carte du parcours, avant l’Unité 1.

## Comportement attendu

- Le parcours est lu de haut en bas : `Début → Unité 1 → … → Unité 8`.
- Le repère « Début » reste visuellement centré sur l’axe du chemin.
- Le trait vertical et les styles existants de la carte sont conservés.
- L’ordre HTML suit l’ordre visuel afin que la navigation clavier et les technologies d’assistance rencontrent « Début » avant les unités.

## Fichiers concernés

- `components/learning-screens.tsx` : rendre le repère avant la liste des unités.
- `app/globals.css` : ancrer le repère en haut de la carte au lieu du bas.
- `tests/map-screen.test.tsx` : vérifier l’ordre de rendu du repère et de l’Unité 1.

## Hors périmètre

- Moteur de progression, contenu pédagogique, navigation et persistance.
- Refonte visuelle ou changement de libellé.

## Validation

- Un test de rendu échoue avant la correction lorsque « Début » suit les unités.
- Le test passe après la correction.
- `npm run lint`, `npm run typecheck` et `npm test` passent.
- Le parcours est vérifié visuellement dans le navigateur local.

## Critères d’acceptation

- « Début » apparaît tout en haut de la carte, juste avant l’Unité 1.
- Aucune unité n’est déplacée, verrouillée ou déverrouillée différemment.
- Aucun changement hors périmètre n’est introduit.
