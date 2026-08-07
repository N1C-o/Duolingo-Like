# Changelog

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
