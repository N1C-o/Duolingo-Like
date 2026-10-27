# Dette technique

## Validation mobile réel et installation PWA à compléter

- **Impact :** l’installation PWA et les gestes sur appareil réel ne sont pas encore une preuve de livraison complète.
- **Validation obtenue :** viewport 390×844 dans le navigateur intégré, build statique exporté, réseau coupé après premier chargement, reprise d’une leçon, gain de 7 XP et persistance après rechargement hors ligne.
- **Suite :** installer le build sur un appareil mobile et rejouer le même scénario avec perte réseau réelle.

## Production audio et relecture pédagogique

- **État :** le parcours 1.3.0 contient 20 unités et 60 leçons ; les unités 9 à 20 ne sont plus manquantes.
- **Couverture au 27 octobre 2026 :** 380 textes couverts, zéro manquant ; les sept fichiers d’origine sont conservés et 373 fichiers ElevenLabs sont intégrés. Vérification : `python3 scripts/lesson_audio.py --verify`.
- **Futures générations :** le dernier essai du plugin a été refusé avec un message d’activité inhabituelle désactivant l’accès Free. Les deux mots restants ont été extraits des pistes déjà générées et transcrites. La lecture locale des enregistrements est indépendante de cette restriction ; voir [AUDIO.md](./AUDIO.md).
- **Relecture :** les consignes ambiguës ont été contextualisées ; la relecture humaine du niveau et les essais avec les enfants restent à faire.

## Tests automatisés du moteur

- **État :** une suite Vitest couvre les réponses des types publiés, les scènes/checkpoints/missions, le bonus de première réponse, les erreurs partielles, la reprise hors ordre, les badges, les déverrouillages, le rejeu plafonné, la séparation des profils et la normalisation de stockage.
- **Suite :** compléter les fixtures au fur et à mesure de l’ajout des prochaines évolutions de contenu.

## Cache PWA minimal

- **Impact :** le service worker utilise un cache shell versionné et met en cache les ressources de même origine au fil de leur chargement ; il n’y a pas encore d’écran de mise à jour de contenu.
- **Correction récente :** le cache est passé en `english-adventure-v2` et les navigations utilisent le réseau en priorité ; le document en cache reste uniquement le fallback hors ligne.
- **Suite :** ajouter un écran de mise à jour de contenu avant d’étendre le curriculum.

## Synchronisation familiale v1

- **Impact :** un compte familial partage l’accès à tous les profils ; les codes enfants ne constituent pas une sécurité. Une modification concurrente sur deux appareils produit un conflit à choisir, sans fusion automatique.
- **Contournement :** snapshots bornés, révisions compare-and-swap, reprise automatique des `pending` dont la base n’a pas changé, résolution séquentielle des conflits par profil, export/restauration JSON et suppression explicite.
- **Suite :** ajouter la récupération de mot de passe par e-mail et une vraie interface de gestion de profils uniquement si l’usage familial le justifie.
