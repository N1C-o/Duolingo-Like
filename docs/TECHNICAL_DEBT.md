# Dette technique

## Validation mobile réel et installation PWA à compléter

- **Impact :** l’installation PWA et les gestes sur appareil réel ne sont pas encore une preuve de livraison complète.
- **Validation obtenue :** viewport 390×844 dans le navigateur intégré, build statique exporté, réseau coupé après premier chargement, reprise d’une leçon, gain de 7 XP et persistance après rechargement hors ligne.
- **Suite :** installer le build sur un appareil mobile et rejouer le même scénario avec perte réseau réelle.

## Curriculum partiel

- **Impact :** huit unités et vingt-trois leçons sont publiées sur les vingt unités prévues.
- **Contournement :** le contrat de contenu et les onze types d’exercices sont déjà extensibles par JSON.
- **Suite :** faire relire les unités 3 à 8 puis suivre le [programme pédagogique](./CONTENT_CURRICULUM.md) pour ajouter les unités 9 à 20 par lots validés.

## Tests automatisés du moteur

- **État :** une suite Vitest couvre les réponses des types publiés, les scènes/checkpoints/missions, le bonus de première réponse, les erreurs partielles, la reprise hors ordre, les badges, les déverrouillages, le rejeu plafonné, la séparation des profils et la normalisation de stockage.
- **Suite :** compléter les fixtures au fur et à mesure de l’ajout des douze unités restantes.

## Cache PWA minimal

- **Impact :** le service worker utilise un cache shell versionné et met en cache les ressources de même origine au fil de leur chargement ; il n’y a pas encore d’écran de mise à jour de contenu.
- **Correction récente :** le fallback HTML est maintenant limité aux navigations ; les assets absents renvoient une erreur réseau normale au lieu de recevoir `/`.
- **Suite :** ajouter une stratégie explicite de version de contenu et un état de mise à jour avant d’étendre le curriculum.
