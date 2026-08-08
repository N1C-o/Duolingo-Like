# Carte du projet

## Modules actifs

| Chemin | Rôle | Statut |
|---|---|---|
| `app/` | Route Next.js, métadonnées, manifest et tokens CSS | active |
| `components/prototype-app.tsx` | Application cliente et navigation d’état | active, nom historique |
| `components/learning-screens.tsx` | Écrans fonctionnels partagés | active |
| `components/exercise-renderer.tsx` | Onze contrats d’interaction | active |
| `components/icons.tsx`, `components/mascots.tsx` | Système visuel partagé | active |
| `content/` | Données pédagogiques et thèmes | active, tranche initiale |
| `lib/content/` | Types et validation des données | active |
| `lib/progression/` | Règles et état utilisateur | active |
| `lib/storage/` | Persistance locale versionnée | active |
| `lib/platform/` | Services navigateur, actuellement synthèse vocale | active |
| `tests/` | Tests du moteur de progression et des fixtures de stockage | active |
| `public/sw.js` | Cache offline-first de même origine, fallback HTML limité aux navigations | active |
| `public/themes/` | Assets Gabriel et Luca | active |
| `docs/cahier-des-charges.md` | Référence produit et fonctionnelle | référence |
| `docs/CONTENT_CURRICULUM.md` | Progression pédagogique, grammaire et fil narratif | référence |
| `docs/plans/2026-08-07-content-curriculum.md` | Plan de rédaction des 20 unités et critères de contenu | plan actif |

## Parcours implémenté

- Accès local Gabriel/Luca avec codes `gabriel` et `luca`.
- Accueil, carte, détail d’unité et vingt-trois leçons JSON réparties sur huit unités, chacune avec une mini-scène et un checkpoint lecture/sons.
- Mini-scènes visibles dans les leçons, action de l’enfant liée à l’exercice courant et résolution affichée après réussite.
- Une mission de production guidée en fin de chaque unité, avec remise en ordre ou réponse construite selon le contenu.
- Feedback correct/incorrect, réessai, continuation et reprise locale.
- XP, niveaux, badges déclaratifs, activités de révision, consolidation et déverrouillage linéaire.
- Badges, paramètres sons/vitesse et espace parental local.
- Manifest, service worker et mode silencieux lorsque la voix est indisponible.
- Persistance et reprise vérifiées sur viewport mobile après rechargement du build statique hors ligne.

## Prochaines étapes

1. Faire relire l’anglais, le français et la difficulté des unités 3 à 8.
2. Tester l’installation PWA et la perte réseau sur appareil mobile réel avec les scènes et missions.
3. Produire les unités 9 à 20 par lots de données JSON validées avec le même contrat d’expérience.
4. Étendre l’espace parental à la sélection indépendante d’un profil.
5. Ajuster les seuils d’XP et le rythme après observation des séances de Gabriel et Luca.

Voir le [plan daté de la phase fonctionnelle](./plans/2026-08-07-functional-implementation.md).
Voir aussi le [plan de production du contenu](./plans/2026-08-07-content-curriculum.md).
