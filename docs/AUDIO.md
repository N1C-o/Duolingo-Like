# Enregistrements du parcours

Les enregistrements sont des fichiers statiques. La lecture ne dépend pas d’ElevenLabs en ligne ; le navigateur utilise `content/audio-manifest.json` puis la synthèse de l’appareil lorsqu’un fichier manque ou échoue. La vitesse du profil s’applique aussi aux fichiers enregistrés.

## État vérifiable

```sh
python3 scripts/lesson_audio.py
python3 scripts/lesson_audio.py --verify
```

La première commande donne le nombre de textes distincts, de fichiers présents et de caractères restant à produire. La seconde retourne un code non nul si un texte manque ou si son fichier audio est absent/invalide. Le manifeste ne référence que les fichiers réellement disponibles ; un inventaire préparé n’est pas un enregistrement terminé.

Au 27 octobre 2026, les 380 textes distincts du parcours disposent d’un enregistrement : zéro texte manquant. Les sept fichiers d’origine sont conservés et 373 fichiers complémentaires sont intégrés sous `public/audio/elevenlabs/`. Ces derniers utilisent Alice — Clear, Engaging Educator (`Xb7hH8MSUJpSbSDYk0k2`), avec `eleven_v4`. L’état exact est donné par les commandes ci-dessus.

## Génération ElevenLabs

Le plugin connecté permet la génération sans configurer de clé API dans ce projet. La production du 27 octobre 2026 est regroupée dans le flow `TPa7B5Sdwnf8X31sl5di` ; l’échantillon « How are you? » est dans `99uvqhNtUXJ0L4oxRR7R`. Vérifier l’état existant avant de lancer une génération supplémentaire pour éviter un doublon.

Les lancements rapprochés peuvent être refusés avec `429 rate_limited`. Pour limiter ces appels, les pistes ont été produites par groupes de phrases, puis transcrites avec Scribe. Chaque extrait WAV a été découpé entre les séparateurs et intégré uniquement lorsque sa transcription correspondait au texte attendu (hors casse, ponctuation et nombres écrits en chiffres). Les séparateurs ne font pas partie des fichiers livrés. Le manifeste conserve la génération source, la transcription de contrôle et les bornes de chaque extrait. Les pistes de travail, URL signées et fichiers temporaires ne sont pas livrés dans l’application.

Les deux mots « but » et « help » ont été extraits des phrases déjà générées et transcrites, avec les mêmes contrôles de texte et de frontières. Leur nouvelle synthèse avait été refusée avec un message ElevenLabs indiquant une désactivation de l’accès Free pour « activité inhabituelle ». Cette restriction concerne les futures générations ; les fichiers locaux sont présents et leur lecture ne dépend pas de cet accès. Aucun changement d’abonnement n’a été effectué.

Pour une génération par le script autonome ci-dessous, configurer `ELEVENLABS_API_KEY` dans l’environnement du processus, jamais dans un champ `NEXT_PUBLIC_*`, un fichier suivi par Git ou une commande contenant la clé en clair. Aucune clé n’est nécessaire au fonctionnement de l’application.

```sh
python3 scripts/lesson_audio.py --voices
python3 scripts/lesson_audio.py --generate
python3 scripts/lesson_audio.py --verify
npm run build
```

`--voice-id` permet de sélectionner une voix de la liste du compte. Sans cet argument, le script privilégie une voix existante de narration anglaise claire, sans créer de clone. Ce script autonome utilise `eleven_multilingual_v2` et des fichiers MP3 ; il est distinct de la production via le plugin décrite ci-dessus. Le rythme initial reste normal ; les réglages Lente/Douce/Normale de l’application contrôlent ensuite la vitesse.

Le script déduplique les textes, vérifie les crédits inclus avant de démarrer et conserve chaque fichier avec sa provenance dans le manifeste. Relancer la commande reprend les textes manquants sans régénérer les fichiers valides. `--limit 1` permet de produire un premier échantillon pour une écoute de contrôle. Un timeout d’une requête payante laisse un marqueur `.uncertain` : vérifier l’historique ElevenLabs avant toute nouvelle tentative pour ce texte.

Après génération, écouter des échantillons de mots, questions, négations, nombres et scènes ; vérifier dans le navigateur la lecture, le ralentissement, l’interruption par une autre phrase et la reprise de la leçon. La présence des fichiers seule ne prouve pas leur qualité sonore.

## Vérification locale du 27 octobre 2026

- Inventaire : 380 textes couverts, zéro manquant ; 380 fichiers uniques dans le manifeste (une entrée supplémentaire est un alias de « Hello »).
- Le navigateur a chargé et décodé les 380 fichiers du build exporté sans erreur, sans fichier silencieux ni durée invalide. Les extraits découpés comportent une marge silencieuse aux deux extrémités.
- Lecture normale et lente à 0,75, interruption puis nouvelle lecture contrôlées dans le navigateur ; le moteur de lecture et son secours sont couverts par les tests.
- Parcours réel : première leçon terminée, seconde déverrouillée, nouvelles voix utilisées dans la scène, le checkpoint et l’exercice d’écoute ; réponse validée, XP et progression conservés après rechargement.
- Validation automatisée : 46 tests Vitest et 8 tests Python réussis ; TypeScript et build statique validés. Le lint conserve cinq avertissements préexistants dans les fichiers Convex générés, sans erreur.

Cette vérification concerne le projet local et son build exporté. Aucun déploiement n’a été effectué. La relecture pédagogique avec les enfants et l’installation sur téléphone réel restent des vérifications distinctes.

Référence : [API de synthèse ElevenLabs](https://elevenlabs.io/docs/api-reference/text-to-speech/convert).
