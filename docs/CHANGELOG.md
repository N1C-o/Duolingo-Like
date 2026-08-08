# Changelog

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
