# Changelog

## 2026-10-27 — Voix enregistrées du parcours complet

- Intégration de 373 fichiers ElevenLabs complémentaires : les 380 textes distincts des scènes, checkpoints, exercices d’écoute et mots de vocabulaire sont couverts, sans manque.
- Conservation des sept fichiers d’origine ; lecture locale par le manifeste, avec les vitesses du profil et le secours navigateur en cas d’erreur.
- Contrôle par transcription des pistes regroupées et des frontières de leurs extraits, et tests de non-régression sur la couverture audio complète.
- Aucune publication ni modification d’abonnement ; restriction du service Free sur le dernier essai documentée dans `AUDIO.md`.
- Correction des deux régressions relevées avant commit : le validateur Convex suit la version du parcours et accepte encore les clients 1.2.1 ; une unité déjà validée ne se reverrouille plus lorsqu’une leçon lui est ajoutée.
- Tests de restauration JSON et de stockage local couvrant la reprise d’une ancienne leçon en cours ; vérification de l’absence de double récompense d’unité et du verrouillage normal des nouveaux profils.

## 2026-10-23 — Extension locale du parcours fondamental

- Ajout des unités 9 à 20 : le parcours contient 20 unités, 60 leçons et 353 exercices avec scènes, écoute, révisions et missions.
- Clarification de 19 exercices existants et ajout de l’écoute des nombres de 1 à 20.
- Passage du contenu à 1.3.0 ; anciens identifiants conservés et exports 1.2.1 restaurables.
- Lecture des fichiers audio par manifeste, respect de la vitesse choisie et génération ElevenLabs reprenable hors du client.
- À cette date, génération du plugin refusée avec `429 rate_limited` ; enregistrements intégrés le 27 octobre. Aucun déploiement effectué.

## 2026-08-17 — Accès local direct

- Suppression de l’écran de connexion e-mail/mot de passe à l’ouverture.
- L’application charge directement les données locales et l’accès aux profils Gabriel/Luca.
- La synchronisation Convex reste disponible lorsqu’une session familiale existe déjà.
- Le chargement de la réplique de synchronisation ne bloque plus l’accès local aux profils ; un fallback est utilisé si sa lecture échoue.

## 2026-08-09 — Corrections de synchronisation familiale

- Reprise automatique des snapshots `pending` après redémarrage lorsque la révision distante correspond toujours à la base locale.
- Activation du parcours de résolution dès qu’un upload concurrent détecte un conflit.
- Résolution séquentielle de plusieurs profils sans réhydrater ni abandonner les versions locales des autres profils.
- Ajout du choix explicite « Repartir de zéro » lorsque des données locales existent.
- Validation Convex des versions, des structures internes de progression et de la rétention de `replayXpByDay` sur 31 jours.
- Alignement du cahier des charges avec le compte familial Convex, le fonctionnement local-first et la copie distante.
- Correction du cache PWA : le shell applicatif est versionné en `v2` et les navigations privilégient désormais le réseau pour éviter de servir un ancien écran après une mise à jour.

## 2026-08-08 — Persistance familiale Convex

- Connexion au projet Convex `Duolingo-like` avec Convex Auth Password et compte familial unique.
- Ajout du schéma familles/profils/snapshots avec propriété par identité, limite de 20 profils et mutations atomiques.
- Migration du modèle persistant vers des identifiants de profil dynamiques, avec Gabriel et Luca conservés comme profils initiaux.
- Conservation d’une réplique IndexedDB/localStorage avec statuts `synced`, `pending` et `conflict`, révision compare-and-swap et synchronisation au retour en ligne.
- Ajout de l’import local explicite, de l’export/restauration JSON versionnés, de la réinitialisation de profil et de la suppression des données familiales.
- Validation réelle du compte de test et du bootstrap dans le navigateur local ; la récupération de mot de passe par e-mail reste hors périmètre.

## 2026-08-08 — Expérience narrative et production guidée

- Implémentation du contrat `storyScene` dans les 23 leçons : situation, dialogue, action de l’enfant, résolution et accroche suivante.
- Ajout d’un checkpoint lecture/écoute par leçon dès `hello-01`, avec reconnaissance audio-écrit, rythme et intonation.
- Ajout d’une mission `guided-production` en fin de chacune des huit unités, reliée à la résolution de sa scène.
- Ajout des rendus UI dédiés et de tests automatisés pour garantir la cohérence du parcours.

## 2026-08-07 — Revue éditoriale : séquençage et scènes

- Réalignement des notions nouvelles dans les unités 1 à 8 : prénom, réponse à `How are you?`, école, aliments, goûts et routine.
- Suppression des distracteurs prématurés et ajout du parcours `How are you?` → `I’m good.`.
- Version de contenu portée à `1.2.1` pour faire évoluer proprement les données locales.
- Formalisation d’un contrat de mini-scène, d’une mission de production par unité et d’un fil lecture/rythme dès `hello-01`.
- Le contrat narratif, son rendu et son checkpoint lecture/sons sont désormais implémentés ; la validation sur appareil réel reste à compléter.

## 2026-08-07 — Cadrage du parcours pédagogique

- Définition d’un parcours fondamental de 20 unités, avec objectifs de communication, grammaire utile et progression de la réception vers l’interaction.
- Ajout d’un fil narratif enfant et d’un gabarit de trois leçons par unité.
- Ajout du plan de production, des critères de rédaction et des critères d’acceptation pour les unités 3 à 8.
- Recherche ciblée documentée à partir du CECRL, du British Council et de Cambridge English.

## 2026-08-07 — Première tranche de contenu ludique

- Publication des unités 3 à 8 : maison, école et jeux, goûter, goûts, routine, nombres et couleurs.
- Ajout de dix-huit leçons avec dialogues, écoute, consignes, demandes polies, questions, routine et activités de révision.
- Version de contenu portée à `1.2.0` et déverrouillage linéaire étendu sans modification du moteur.

## 2026-08-07 — Stabilisation de la phase fonctionnelle

- Ajout d’une suite Vitest pour les contrats d’exercice publiés et les invariants de progression.
- Durcissement de la validation des JSON : identifiants, références, options, paires, cartes, vocabulaire, thèmes et seuils de badges.
- Protection du moteur contre les soumissions hors ordre et les sessions rendues inaccessibles par un verrouillage parental.
- Ajout d’un délai de secours IndexedDB, de la réparation des sessions obsolètes et de la distinction entre première installation et récupération.
- Sérialisation des écritures locales pour fiabiliser les changements rapides de profil et de progression.
- Le changement de profil persiste maintenant un accès désactivé avant de demander le code suivant.
- Parcours mobile et persistance hors ligne vérifiés sur le build statique à 390×844.

## 2026-08-07 — Première tranche fonctionnelle

- Remplacement des données simulées par un parcours JSON validé.
- Ajout de l’accès local Gabriel/Luca et de profils séparés.
- Ajout de la persistance IndexedDB avec normalisation et fallback local.
- Ajout du moteur de leçons, XP, niveaux, erreurs, consolidation, badges et déverrouillages idempotents.
- Ajout des écrans unité, badges, paramètres et espace parental.
- Ajout de la synthèse vocale anglaise et du fallback silencieux.
- Ajout du manifest et du service worker PWA.
- Ajout de la documentation d’architecture et du design system.

Voir [l’architecture](./ARCHITECTURE.md) et [la dette restante](./TECHNICAL_DEBT.md).

## 2026-08-07 — Corrections issues de la revue

- Validation des réponses déplacée dans le moteur à partir de soumissions structurées.
- Enregistrement des erreurs partielles dans les associations et les activités mémoire.
- Fallback du service worker limité aux navigations et détection initiale du mode hors ligne corrigée.
- Ajout d’une cinquième leçon et de trois activités de révision pour rendre les badges concernés atteignables.
- Normalisation profonde des sessions, statistiques et préférences locales.
