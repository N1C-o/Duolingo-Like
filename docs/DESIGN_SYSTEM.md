# Design system — English Adventure

## Décision

La maquette validée est figée comme direction visuelle mobile-first. Les écrans fonctionnels réutilisent les composants, espacements, états et tokens de `app/globals.css` ; un écran métier ne choisit pas une couleur de thème directement.

## Tokens sémantiques

Les tokens sont portés par `.prototype-canvas` et redéfinis par `.theme-luca`.

| Rôle | Usage |
|---|---|
| `--shell-bg` | cadre principal de l’application |
| `--surface`, `--surface-soft`, `--surface-strong` | cartes et niveaux d’élévation |
| `--shell-text`, `--shell-muted` | texte principal et secondaire |
| `--primary`, `--primary-deep`, `--primary-contrast` | action principale et focus de progression |
| `--secondary`, `--accent` | accent éditorial, récompenses et décor |
| `--success`, `--warning`, `--error` | états de réponse et messages |
| `--locked` | états indisponibles |
| `--progress-track`, `--progress-value` | barres de progression |
| `--border`, `--focus` | séparation et accessibilité clavier |
| `--shadow-card`, `--shadow-button`, `--shadow-shell` | profondeur partagée |

## Composants figés

- `AppChrome` : en-tête, zone scrollable, navigation basse et zones sûres.
- `ThemeHeader` : profil, niveau, XP et badges.
- `PrimaryButton` / `SecondaryButton` : action principale ou secondaire, minimum 44 px de hauteur.
- `Card`, `ProgressBar`, `LessonNode`, `UnitSection` : structure du parcours.
- `ExerciseCard`, `AnswerOption`, `AudioButton`, `FeedbackPanel` : boucle de leçon.
- `StorySceneCard` : situation, répliques, action de l’enfant, résolution et accroche suivante.
- `ReadingCheckpoint` : texte court, écoute rejouable et focus de rythme/intonation.
- `ProductionMission` : signal visuel d’une réponse guidée et de la mission de fin d’unité.
- `RewardModal` équivalent : `SummaryScreen` pour XP, niveau, badge et déverrouillage.
- `BadgeCard`, `Confirmation` parental : collection et action sensible.

## Règles d’usage

- Portrait mobile d’abord, tablette ensuite.
- Une action principale par écran.
- Les illustrations restent derrière ou à côté de la consigne.
- Les états ne reposent jamais uniquement sur la couleur ou le son.
- Les animations respectent `prefers-reduced-motion`.
- Gabriel et Luca partagent les mêmes composants ; seul le thème injecté varie.
- Les textes pédagogiques viennent du JSON ; les libellés d’interface sont regroupés dans les écrans tant qu’aucun système i18n n’est installé.

## Thèmes

Gabriel utilise les tokens naturels, chaleureux et capybara ; Luca utilise les tokens nuit, violet et ambre du même contrat sémantique. Le modèle persiste `themeId` séparément de `profileId`, donc un changement futur de thème ne réinitialisera pas la progression.
