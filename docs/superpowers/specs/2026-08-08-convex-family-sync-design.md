# Synchronisation familiale Convex — Design validé

## Objectif

Remplacer la persistance locale unique d’English Adventure par une persistance Convex synchronisable, sans perdre le fonctionnement hors ligne actuel et sans introduire de comptes enfants ou de rôles complexes.

## Décisions

- Un seul compte familial authentifié avec Convex Auth Password (e-mail + mot de passe).
- Les profils sont des données du compte familial, pas des identités authentifiées.
- Gabriel et Luca sont créés au bootstrap ; le modèle accepte jusqu’à 20 profils.
- Le contenu pédagogique reste statique dans `content/`.
- La progression est un snapshot par profil, avec une révision distante.
- IndexedDB devient une réplique locale explicite : `synced`, `pending` ou `conflict`.
- En cas de conflit de révision, aucune fusion ni écrasement silencieux : la version distante et la version locale sont conservées pour un choix explicite.
- Le moteur de progression reste côté client en v1. Le serveur vérifie l’identité, la propriété, la forme et la version du snapshot, sans anti-triche.
- `activeProfileId`, l’écran actif et les autres états de navigation restent locaux à l’appareil.
- `replayXpByDay` est borné à une fenêtre courte, car l’application n’expose pas d’historique quotidien complet.
- L’import local est déclenché par le parent, idempotent et atomique.
- L’export JSON, la restauration validée, la réinitialisation d’un profil et la suppression des données applicatives sont prévus.

## Hors périmètre

- Comptes individuels pour les enfants.
- Rôles adultes/enfants ou permissions différenciées.
- Fusion automatique de deux progressions.
- Historique complet des tentatives.
- Contenu pédagogique stocké ou éditable dans Convex.
- Anti-triche ou moteur de progression serveur.

## Flux de données

```text
Convex snapshot + revision
          ↓ hydrate
IndexedDB { snapshot, baseRevision, syncStatus }
          ↓ offline edits
pending local snapshot
          ↓ reconnect
same remote revision → upload
changed remote revision → conflict choice, no silent overwrite
```

## Critères d’acceptation

- Une famille authentifiée ne lit que ses propres profils.
- Les profils ne sont plus limités au type littéral `"gabriel" | "luca"` dans le modèle persistant.
- Deux profils existants peuvent être importés depuis l’état local sans doublon après une relance.
- Une installation sans état local démarre avec une famille vide puis les profils initiaux.
- Un état local récupérable affiche un avertissement avant import ; un état irrécupérable n’est pas écrasé.
- Une progression faite hors ligne reste disponible après fermeture et est synchronisée au retour en ligne si la révision distante n’a pas changé.
- Une révision distante changée produit un conflit explicite et ne perd aucune des deux versions.
- Les snapshots sont bornés par le curriculum et `replayXpByDay` ne croît pas indéfiniment.
- Un export et une restauration valident `schemaVersion` et `contentVersion` avant remplacement.
- Les tests existants du moteur et du stockage restent verts.

## Risques assumés

- Toute session du compte familial peut techniquement modifier les profils et les snapshots.
- La récupération du mot de passe nécessite un provider d’e-mail et sera configurée séparément ; sans lui, la récupération est manuelle.
- Le mode hors ligne ne fusionne pas deux appareils simultanément actifs sur le même profil.
