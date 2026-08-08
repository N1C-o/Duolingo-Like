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
| `content/index.ts` | Assemblage et validation runtime des références, scènes, checkpoints et types d’exercices | active |
| `lib/content/types.ts` | Contrats TypeScript des onze types d’exercices et de l’expérience pédagogique | active |
| `lib/progression/engine.ts` | XP, niveaux, erreurs, consolidation, badges, sessions et déverrouillages | active |
| `lib/progression/types.ts` | Modèle local profil/thème/préférences/progression | active |
| `lib/storage/local-store.ts` | IndexedDB, normalisation, migration légère et fallback local | active |
| `lib/platform/speech.ts` | Synthèse vocale anglaise avec fallback silencieux | active |
| `components/learning-screens.tsx` | Accès, accueil, parcours, leçon, mini-scènes, lecture, badges, paramètres et parental | active |
| `components/exercise-renderer.tsx` | Rendu générique des exercices déclarés par le contenu et des missions guidées | active |
| `components/prototype-app.tsx` | Orchestration d’état et navigation client | active |
| `app/globals.css` | Tokens sémantiques et habillage partagé des thèmes | active |
| `public/sw.js` | Cache de l’application et des ressources de même origine, fallback HTML limité aux navigations | active |

## Persistance locale

IndexedDB utilise une base `english-adventure-local`, un magasin `app-state` et une clé racine. La progression complète des deux profils est stockée dans un état versionné ; les données sont normalisées champ par champ au chargement pour tolérer une structure partiellement corrompue ou plus ancienne sans laisser de sessions ou statistiques mal typées atteindre le moteur.

Si IndexedDB est indisponible, l’application tente `localStorage` comme mode de secours. Si aucun stockage n’est possible, elle reste utilisable en mémoire et affiche un avertissement explicite.
Les ouvertures et transactions IndexedDB sont bornées dans le temps afin qu’un navigateur mobile ou un contexte privé dégradé bascule vers le fallback au lieu de laisser l’écran de chargement bloqué. Les écritures sont sérialisées pour que le dernier geste utilisateur gagne en cas de changements rapides. Une première installation vide n’est pas signalée comme une récupération ; seuls les états réellement normalisés affichent l’avertissement.

Le changement de profil efface le profil actif persistant avant de revenir à l’écran d’accès. Les données Gabriel et Luca restent dans le même état local mais ne sont jamais mélangées par le moteur.

## Contrat de contenu

Chaque leçon référence des identifiants stables et contient entre cinq et huit exercices. Elle porte aussi une `storyScene` en quatre temps — situation, setup/dialogue, action de l’enfant et résolution — ainsi qu’un `readingCheckpoint` reliant texte, audio et rythme/intonation. Le validateur bloque le démarrage si une réponse, une référence, une paire, un texte vocal, une scène, un checkpoint ou un prérequis est incohérent. Une activité peut être marquée `isRevisionActivity` pour alimenter les badges de révision ; la dernière leçon de chaque unité doit déclarer exactement une `isUnitMission` en `guided-production`. Les détails visuels et éditoriaux généraux restent dans les thèmes ; les consignes propres à une leçon restent dans son JSON.

## Progression

Les seuils courants sont documentés dans `lib/progression/engine.ts` : 5 XP par exercice à la première complétion, +2 XP pour une première réponse correcte, +20 XP par leçon et +50 XP par unité. Les rejoués donnent au maximum 5 XP par leçon et par jour local. Une erreur partielle d’association ou de mémoire met à jour les statistiques sans marquer l’exercice comme terminé ; aucune erreur ne retire d’XP ni ne bloque une leçon. Le moteur refuse aussi les soumissions qui ne correspondent pas à l’exercice courant de la session.

## Limites connues

La tranche actuelle contient huit unités et vingt-trois leçons publiées. Les onze types sont représentables et rendus par le moteur ; le programme cible de 20 unités et le plan de rédaction sont documentés dans [`CONTENT_CURRICULUM.md`](./CONTENT_CURRICULUM.md) et le [plan de production](./plans/2026-08-07-content-curriculum.md). Le parcours mobile/hors ligne a été rejoué sur le build statique dans le navigateur intégré à 390×844 ; l’installation PWA et la validation sur appareil réel avec les nouvelles leçons restent à exécuter.

Voir [la carte du projet](./PROJECT_MAP.md), [le design system](./DESIGN_SYSTEM.md), [la dette technique](./TECHNICAL_DEBT.md) et [le plan de phase](./plans/2026-08-07-functional-implementation.md).
