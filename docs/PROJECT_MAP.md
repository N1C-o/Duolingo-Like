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
| `lib/storage/` | Persistance locale versionnée et mapping Convex | active |
| `lib/sync/` | Répliques locales, révisions et résolution explicite des conflits | active |
| `convex/` | Authentification familiale optionnelle, schéma et fonctions de données | active |
| `components/auth-screen.tsx` | Bootstrap/import et résolution des conflits familiaux | active |
| `lib/platform/` | Services navigateur, actuellement synthèse vocale | active |
| `tests/` | Tests du moteur de progression et des fixtures de stockage | active |
| `public/sw.js` | Cache versionné de même origine, réseau prioritaire et fallback HTML hors ligne | active |
| `public/themes/` | Assets Gabriel et Luca | active |
| `docs/cahier-des-charges.md` | Référence produit et fonctionnelle | référence |
| `docs/CONTENT_CURRICULUM.md` | Progression pédagogique, grammaire et fil narratif | référence |
| `docs/plans/2026-08-07-content-curriculum.md` | Plan de rédaction des 20 unités et critères de contenu | plan actif |

## Parcours implémenté

- Accès local direct aux profils avec codes de commodité (`gabriel`, `luca` par défaut) ; compte familial Convex Auth optionnel pour la synchronisation.
- Accueil, carte, détail d’unité et vingt-trois leçons JSON réparties sur huit unités, chacune avec une mini-scène et un checkpoint lecture/sons.
- Mini-scènes visibles dans les leçons, action de l’enfant liée à l’exercice courant et résolution affichée après réussite.
- Une mission de production guidée en fin de chaque unité, avec remise en ordre ou réponse construite selon le contenu.
- Feedback correct/incorrect, réessai, continuation et reprise locale.
- XP, niveaux, badges déclaratifs, activités de révision, consolidation et déverrouillage linéaire.
- Badges, paramètres sons/vitesse et espace parental synchronisé.
- Bootstrap/import local explicite, synchronisation hors ligne par snapshot, détection de conflit CAS et choix local/distant.
- Export JSON, restauration versionnée, réinitialisation d’un profil et suppression des données familiales.
- Manifest, service worker et mode silencieux lorsque la voix est indisponible.
- Persistance et reprise vérifiées sur viewport mobile après rechargement du build statique hors ligne.

## Prochaines étapes

1. Configurer un provider d’e-mail si la récupération de mot de passe devient nécessaire.
2. Faire relire l’anglais, le français et la difficulté des unités 3 à 8.
3. Tester l’installation PWA et la perte réseau sur appareil mobile réel avec les scènes et missions.
4. Produire les unités 9 à 20 par lots de données JSON validées avec le même contrat d’expérience.
5. Étendre l’espace parental à la gestion de profils jusqu’à 20 si le besoin apparaît.

Voir le [plan daté de la phase fonctionnelle](./plans/2026-08-07-functional-implementation.md).
Voir aussi le [plan de production du contenu](./plans/2026-08-07-content-curriculum.md).
