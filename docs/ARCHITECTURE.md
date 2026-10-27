# Architecture — English Adventure

## Statut

Architecture active depuis le 8 août 2026. Le projet reste une web app mobile-first exportée en statique par Next.js.

## Principes

- Les données locales et les profils enfants restent utilisables sans compte ; une session familiale Convex Auth peut en option porter la copie synchronisée, sans compte ni rôle séparé pour les enfants.
- Le contenu pédagogique est statique et séparé des écrans.
- La progression est propre à chaque profil, conservée localement et répliquée dans Convex quand la connexion est disponible.
- Le moteur de progression ne dépend ni du thème ni des composants visuels.
- Les règles d’XP, badges, erreurs et déverrouillages sont centralisées et idempotentes.
- Les composants envoient des réponses structurées ; le moteur vérifie la justesse et distingue une erreur partielle d’une validation complète.
- Les écrans consomment des tokens sémantiques ; les thèmes changent leur configuration visuelle.

## Flux runtime

```text
Session Convex Auth optionnelle → famille Convex → snapshot + révision distante
             ↓                         ↑                 ↑
      IndexedDB local ← moteur client ← écrans et profil actif
      ↓
 pending / conflict → upload CAS au retour en ligne
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
| `lib/storage/convex-store.ts` | Mapping famille/snapshots, import, export et restauration validée | active |
| `lib/sync/` | Statuts de réplique, révisions, bornage de `replayXpByDay` et conflits | active |
| `convex/` | Schéma Convex Auth, famille, profils, snapshots et mutations atomiques | active |
| `components/auth-screen.tsx` | Choix d’import/bootstrap et résolution des conflits pour une session Convex existante | active |
| `components/convex-provider.tsx` | Fournisseur client Convex Auth pour l’export statique Next.js | active |
| `lib/platform/speech.ts` | Fichiers audio du manifeste, vitesse de lecture et synthèse vocale anglaise de secours | active |
| `components/learning-screens.tsx` | Accès, accueil, parcours, leçon, mini-scènes, lecture, badges, paramètres et parental | active |
| `components/exercise-renderer.tsx` | Rendu générique des exercices déclarés par le contenu et des missions guidées | active |
| `components/prototype-app.tsx` | Orchestration d’état et navigation client | active |
| `app/globals.css` | Tokens sémantiques et habillage partagé des thèmes | active |
| `public/sw.js` | Cache versionné, réseau prioritaire pour les navigations et fallback hors ligne | active |

## Persistance locale

IndexedDB utilise une base `english-adventure-local`, un magasin `app-state` et un magasin `sync-state`. La progression complète de chaque profil dynamique est stockée dans un état versionné ; les données sont normalisées champ par champ au chargement pour tolérer une structure partiellement corrompue ou plus ancienne sans laisser de sessions ou statistiques mal typées atteindre le moteur.

Si IndexedDB est indisponible, l’application tente `localStorage` comme mode de secours. Si aucun stockage n’est possible, elle reste utilisable en mémoire et affiche un avertissement explicite.
Les ouvertures et transactions IndexedDB sont bornées dans le temps afin qu’un navigateur mobile ou un contexte privé dégradé bascule vers le fallback au lieu de laisser l’écran de chargement bloqué. Les écritures sont sérialisées pour que le dernier geste utilisateur gagne en cas de changements rapides. Une première installation vide n’est pas signalée comme une récupération ; seuls les états réellement normalisés affichent l’avertissement.

La réplique locale garde pour chaque profil une `baseRevision` et un statut `synced`, `pending` ou `conflict`. Une progression faite hors ligne reste donc dans IndexedDB ; au retour en ligne ou après un redémarrage, elle est reprise automatiquement si la révision distante correspond encore à `baseRevision`. L’upload utilise une mutation compare-and-swap. Si la révision distante a changé, la version locale et la version distante sont conservées pour un choix explicite profil par profil, sans écrasement silencieux ; plusieurs conflits sont traités séquentiellement et le choix distant ne réhydrate que le profil concerné. `replayXpByDay` est borné à 31 jours avant persistance distante.

Lorsqu’une session Convex existe et qu’aucune famille distante n’est encore configurée, elle choisit explicitement entre importer l’état local et repartir avec les profils de départ. Sans session, l’application ouvre directement l’accès local aux profils. Un import répété portant le même `sourceHash` est idempotent ; un import ne remplace pas une famille déjà peuplée. L’espace parental propose un export JSON, une restauration validée par `schemaVersion`/`contentVersion`, la réinitialisation d’un profil et la suppression des données applicatives locales et distantes.

Le changement de profil et la navigation restent locaux à l’appareil. Les codes de profil sont une commodité d’usage, pas une frontière de sécurité : toute session du compte familial peut lire et modifier les profils.

Le service worker utilise le cache `english-adventure-v2`. Une navigation tente toujours le réseau en premier afin qu’une nouvelle version de l’application ne reste pas bloquée sur un ancien shell ; si le réseau est indisponible, le document précédemment mis en cache sert de fallback. Les autres ressources de même origine sont également mises en cache après une réponse réseau réussie.

## Contrat de contenu

Chaque leçon référence des identifiants stables et contient entre cinq et huit exercices. Elle porte aussi une `storyScene` en quatre temps — situation, setup/dialogue, action de l’enfant et résolution — ainsi qu’un `readingCheckpoint` reliant texte, audio et rythme/intonation. Le validateur bloque le démarrage si une réponse, une référence, une paire, un texte vocal, une scène, un checkpoint ou un prérequis est incohérent. Une activité peut être marquée `isRevisionActivity` pour alimenter les badges de révision ; la dernière leçon de chaque unité doit déclarer exactement une `isUnitMission` en `guided-production`. Les détails visuels et éditoriaux généraux restent dans les thèmes ; les consignes propres à une leçon restent dans son JSON.

Une validation d’unité déjà acquise dans `completedUnitIds` reste valable lorsqu’une nouvelle leçon est ajoutée. Les profils existants conservent ainsi l’accès aux unités suivantes et leurs sessions en cours ; les nouvelles leçons restent accessibles sans être marquées terminées automatiquement. Un nouveau profil doit terminer toutes les leçons actuelles pour valider l’unité, et une unité déjà récompensée ne rapporte pas une seconde récompense de validation.

Le validateur de synchronisation Convex lit la version courante dans `content/course.json` et accepte également les clients 1.2.1 compatibles. Les schémas inconnus et les autres versions de contenu restent refusés. Ce contrat doit être déployé côté Convex avant la publication d’un client utilisant la nouvelle version.

## Voix enregistrées

`content/audio-manifest.json` associe le texte normalisé (apostrophes, espaces et casse) à un fichier sous `public/audio/`. `lib/platform/speech.ts` lit cet enregistrement en priorité et applique la vitesse choisie par le profil. La synthèse navigateur reste le secours en cas de texte manquant ou d’erreur de lecture. Aucun appel ElevenLabs ni secret n’existe dans le client.

`scripts/lesson_audio.py` inventorie les scènes, checkpoints, exercices écoutables et mots du parcours ; la génération ElevenLabs se fait en amont et met à jour le manifeste au fil des fichiers reçus. Voir [AUDIO.md](./AUDIO.md). Les exports de progression 1.2.1 restent acceptés car les anciens identifiants n’ont pas changé.

## Progression

Les seuils courants sont documentés dans `lib/progression/engine.ts` : 5 XP par exercice à la première complétion, +2 XP pour une première réponse correcte, +20 XP par leçon et +50 XP par unité. Les rejoués donnent au maximum 5 XP par leçon et par jour local. Une erreur partielle d’association ou de mémoire met à jour les statistiques sans marquer l’exercice comme terminé ; aucune erreur ne retire d’XP ni ne bloque une leçon. Le moteur refuse aussi les soumissions qui ne correspondent pas à l’exercice courant de la session.

## Limites connues

Le parcours 1.3.0 contient vingt unités, soixante leçons et 353 exercices dans le programme. Les onze types sont représentables et rendus par le moteur ; le programme cible de 20 unités et le plan de rédaction sont documentés dans [`CONTENT_CURRICULUM.md`](./CONTENT_CURRICULUM.md) et le [plan de production](./plans/2026-08-07-content-curriculum.md). Le parcours mobile/hors ligne a été rejoué sur le build statique dans le navigateur intégré à 390×844 ; l’installation PWA et la validation sur appareil réel avec les nouvelles leçons restent à exécuter.

Convex Auth utilise un seul compte familial et un provider mot de passe pour la synchronisation optionnelle ; l’interface de l’application n’impose plus l’écran e-mail/mot de passe à l’ouverture. La récupération automatisée du mot de passe n’est pas configurée, et le moteur de progression reste de confiance côté client en v1. La synchronisation ne fusionne pas deux appareils actifs sur le même profil ; elle demande un choix en cas de révision divergente. Le modèle accepte jusqu’à 20 profils, mais l’interface de gestion avancée de profils n’est pas encore construite.

Voir [la carte du projet](./PROJECT_MAP.md), [le design system](./DESIGN_SYSTEM.md), [la dette technique](./TECHNICAL_DEBT.md) et [le plan de phase](./plans/2026-08-07-functional-implementation.md).


## Publication

L’application statique est hébergée sur https://english-adventure-ferrante.netlify.app (site Netlify `69c48990-6ecc-4e00-a932-74632d134999`). Le backend de production est `https://helpful-hummingbird-134.eu-west-1.convex.cloud` ; le déploiement `different-dove-671` reste réservé au développement.

Publier d’abord les fonctions avec `npx convex deploy`, puis construire un export propre avec `NEXT_PUBLIC_CONVEX_URL=https://helpful-hummingbird-134.eu-west-1.convex.cloud` et `NEXT_PUBLIC_CONVEX_SITE_URL=https://helpful-hummingbird-134.eu-west-1.convex.site`. Publier uniquement le dossier `out` avec `netlify deploy --prod --no-build --dir out --site 69c48990-6ecc-4e00-a932-74632d134999`. Ne pas copier `.env.local` dans l’archive de livraison. Vérifier ensuite le site HTTPS, le manifeste PWA et les fichiers audio depuis l’adresse publique.
