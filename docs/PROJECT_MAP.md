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
| `public/sw.js` | Cache offline-first de même origine, fallback HTML limité aux navigations | active |
| `public/themes/` | Assets Gabriel et Luca | active |
| `docs/cahier-des-charges.md` | Référence produit et fonctionnelle | référence |

## Parcours implémenté

- Accès local Gabriel/Luca avec codes `gabriel` et `luca`.
- Accueil, carte, détail d’unité et cinq leçons JSON.
- Feedback correct/incorrect, réessai, continuation et reprise locale.
- XP, niveaux, badges déclaratifs, activités de révision, consolidation et déverrouillage linéaire.
- Badges, paramètres sons/vitesse et espace parental local.
- Manifest, service worker et mode silencieux lorsque la voix est indisponible.

## Prochaines étapes

1. Ajouter les six unités restantes par données validées.
2. Ajouter des tests unitaires du moteur et des fixtures de migration IndexedDB.
3. Tester les parcours sur mobile réel, installation PWA et perte réseau.
4. Étendre l’espace parental à la sélection indépendante d’un profil.
5. Ajuster les seuils d’XP et le rythme après observation des séances de Gabriel et Luca.

Voir le [plan daté de la phase fonctionnelle](./plans/2026-08-07-functional-implementation.md).
