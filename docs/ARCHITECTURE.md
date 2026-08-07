# Architecture — English Adventure

## Statut

Architecture active depuis le 7 août 2026. Le projet reste une web app mobile-first exportée en statique par Next.js.

## Principes

- Aucun backend, compte, paiement ou appel métier distant.
- Le contenu pédagogique est statique et séparé des écrans.
- La progression est propre à chaque profil et persistée localement.
- Le moteur de progression ne dépend ni du thème ni des composants visuels.
- Les règles d’XP, badges, erreurs et déverrouillages sont centralisées et idempotentes.
- Les composants envoient des réponses structurées ; le moteur vérifie la justesse et distingue une erreur partielle d’une validation complète.
- Les écrans consomment des tokens sémantiques ; les thèmes changent leur configuration visuelle.

## Flux runtime

```text
JSON contenu validé
        ↓
Écrans client → moteur de progression → IndexedDB
        ↓                ↓                 ↓
Thème actif       XP / badges /       reprise locale
Gabriel ou Luca   déverrouillages     hors connexion
```

## Modules principaux

| Zone | Responsabilité | État |
|---|---|---|
| `content/` | Parcours, unités, leçons, vocabulaire, badges et thèmes JSON | active |
| `content/index.ts` | Assemblage et validation runtime des références et types d’exercices | active |
| `lib/content/types.ts` | Contrats TypeScript des onze types d’exercices | active |
| `lib/progression/engine.ts` | XP, niveaux, erreurs, consolidation, badges, sessions et déverrouillages | active |
| `lib/progression/types.ts` | Modèle local profil/thème/préférences/progression | active |
| `lib/storage/local-store.ts` | IndexedDB, normalisation, migration légère et fallback local | active |
| `lib/platform/speech.ts` | Synthèse vocale anglaise avec fallback silencieux | active |
| `components/learning-screens.tsx` | Accès, accueil, parcours, leçon, badges, paramètres et parental | active |
| `components/exercise-renderer.tsx` | Rendu générique des exercices déclarés par le contenu | active |
| `components/prototype-app.tsx` | Orchestration d’état et navigation client | active |
| `app/globals.css` | Tokens sémantiques et habillage partagé des thèmes | active |
| `public/sw.js` | Cache de l’application et des ressources de même origine, fallback HTML limité aux navigations | active |

## Persistance locale

IndexedDB utilise une base `english-adventure-local`, un magasin `app-state` et une clé racine. La progression complète des deux profils est stockée dans un état versionné ; les données sont normalisées champ par champ au chargement pour tolérer une structure partiellement corrompue ou plus ancienne sans laisser de sessions ou statistiques mal typées atteindre le moteur.

Si IndexedDB est indisponible, l’application tente `localStorage` comme mode de secours. Si aucun stockage n’est possible, elle reste utilisable en mémoire et affiche un avertissement explicite.

## Contrat de contenu

Chaque leçon référence des identifiants stables et contient entre cinq et huit exercices. Le validateur bloque le démarrage si une réponse, une référence, une paire, un texte vocal ou un prérequis est incohérent. Une activité peut être marquée `isRevisionActivity` pour alimenter les badges de révision après sa complétion. Les détails visuels et éditoriaux généraux restent dans les thèmes ; les consignes propres à une leçon restent dans son JSON.

## Progression

Les seuils courants sont documentés dans `lib/progression/engine.ts` : 5 XP par exercice à la première complétion, +2 XP pour une première réponse correcte, +20 XP par leçon et +50 XP par unité. Les rejoués donnent au maximum 5 XP par leçon et par jour local. Une erreur partielle d’association ou de mémoire met à jour les statistiques sans marquer l’exercice comme terminé ; aucune erreur ne retire d’XP ni ne bloque une leçon.

## Limites connues

La tranche actuelle contient deux unités et cinq leçons de référence. Les onze types sont représentables et rendus par le moteur, mais le curriculum complet des huit unités reste à produire. La validation mobile/hors ligne sur appareil réel doit encore être exécutée avec un navigateur disponible localement.

Voir [la carte du projet](./PROJECT_MAP.md), [le design system](./DESIGN_SYSTEM.md), [la dette technique](./TECHNICAL_DEBT.md) et [le plan de phase](./plans/2026-08-07-functional-implementation.md).
