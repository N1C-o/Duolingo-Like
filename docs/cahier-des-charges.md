# Cahier des charges — application ludique d’apprentissage de l’anglais

**Version :** 2.0 — 6 août 2026  
**Statut :** spécification fonctionnelle et technique pour une première version  
**Public :** Gabriel et Luca, enfants de la même famille  
**Support cible :** navigateur mobile et tablette, avec installation possible sur l’écran d’accueil

Cette version intègre les décisions de conception validées après revue critique ainsi que la direction artistique de l’image de référence jointe. L’image sert de référence d’ambiance, de hiérarchie et d’ergonomie ; elle ne doit pas être reproduite pixel par pixel et ne constitue pas un asset à intégrer tel quel.

## 1. Résumé du projet

L’application est une web app mobile-first, locale et installable, destinée exclusivement à deux enfants. Elle leur apprend un anglais utile dans les situations du quotidien au moyen de courtes leçons, d’exercices variés, de dialogues et d’une progression ludique.

La première version ne comporte :

- aucun compte utilisateur ;
- aucune authentification ;
- aucun paiement ;
- aucun backend ni serveur applicatif ;
- aucune synchronisation distante ;
- aucune publicité ni collecte analytique obligatoire ;
- aucune reconnaissance vocale ou évaluation automatique de la prononciation.

Toutes les données de progression et de préférence restent sur l’appareil utilisé par la famille.

## 2. Vision produit et principes directeurs

### 2.1 Vision

Cette application ne cherche pas à enseigner le plus de vocabulaire possible. Son objectif est que Gabriel et Luca prennent plaisir à apprendre un anglais réellement utile au quotidien, grâce à une expérience personnalisée, rassurante, amusante et suffisamment courte pour être reprise régulièrement.

La différence du produit repose sur cinq choix :

- **L’utilité avant le volume.** Les mots et phrases servent à saluer, demander, comprendre, répondre et parler de situations vécues.
- **La réussite avant la pression.** Les erreurs deviennent des occasions de revoir ; elles ne font perdre ni vies ni progression.
- **La personnalisation avant la standardisation.** Les mêmes apprentissages sont portés par des univers visuels et éditoriaux adaptés à chaque enfant.
- **La curiosité avant la compétition.** Le parcours, les mascottes et les récompenses donnent envie de continuer sans classement ni comparaison.
- **La simplicité avant la dépendance.** L’application fonctionne localement, sans compte, publicité, backend ou service payant obligatoire.

La référence visuelle confirme l’ambition d’une expérience de jeu mobile illustrée : parcours vertical immersif, progression toujours visible, gros boutons, cartes arrondies, mascotte-compagnon, univers riche mais lisible et action principale accessible dans la partie basse de l’écran.

### 2.2 Anti-objectifs

L’application ne doit pas devenir :

- un clone visuel ou fonctionnel d’une application existante ;
- une course à la quantité de vocabulaire ou au nombre de jours consécutifs ;
- un système de classement, de compétition entre enfants ou de comparaison publique ;
- une expérience fondée sur les vies, la perte d’XP, les punitions ou la culpabilisation ;
- une succession aléatoire de quiz sans progression pédagogique ;
- une interface surchargée d’illustrations au détriment de la lisibilité ;
- un produit dépendant d’un compte, d’un serveur ou d’une IA en ligne ;
- deux applications différentes maintenues séparément pour Gabriel et Luca.

### 2.3 Promesse produit

En cinq minutes environ, un enfant doit pouvoir apprendre et réutiliser quelques mots ou phrases anglaises réellement utiles, comprendre une consigne simple et ressortir de la leçon avec le sentiment d’avoir réussi quelque chose.

### 2.4 Principes pédagogiques

1. **Utile avant tout.** Le vocabulaire et les phrases correspondent à des situations de la vie quotidienne.
2. **Court et fréquent.** Une leçon dure environ cinq minutes et se termine toujours par une réussite identifiable.
3. **Comprendre et réutiliser.** Chaque notion est présentée, entendue, reconnue puis réutilisée dans un contexte.
4. **Variété.** Une leçon alterne au moins trois types d’exercices pour éviter la répétition mécanique.
5. **Répétition sans punition.** Les erreurs servent à réessayer et à revoir la notion ; elles ne bloquent pas durablement le parcours.
6. **Jeu sobre.** Les XP, badges et animations soutiennent l’apprentissage sans transformer l’application en compétition stressante.
7. **Autonomie encadrée.** L’enfant sait quoi faire ensuite, mais peut rejouer une leçon déjà terminée.
8. **Interface en français, apprentissage en anglais.** Les consignes de l’application sont d’abord en français ; les mots et phrases étudiés sont en anglais avec leur aide française.

### 2.5 Principes de sécurité et de confidentialité

- L’application ne demande ni nom de famille, ni adresse e-mail, ni date de naissance, ni photo.
- Aucun contenu généré par d’autres utilisateurs n’est visible.
- Aucun chat, classement public, lien commercial ou publicité n’est présent.
- Les sons sont déclenchés par une action explicite de l’utilisateur lorsque le navigateur l’exige.
- La zone parentale est une barrière d’usage, pas un mécanisme de sécurité fort : les données étant locales, une personne ayant accès à l’appareil peut toujours les supprimer.

## 3. Périmètre de la première version

### 3.1 Inclus dans le MVP

- Deux profils locaux prévus : **Gabriel** et **Luca**.
- Parcours organisé en unités, leçons, exercices et récompenses.
- Leçons d’environ cinq minutes avec progression enregistrée localement.
- Les onze types d’exercices demandés.
- Synthèse vocale du navigateur pour les mots, phrases, exemples et écoutes.
- XP, niveaux, badges, progression visuelle et déverrouillage progressif.
- Accueil, choix du profil, carte du parcours, unité, lancement de leçon, exercice, feedback, fin de leçon, badges, progression, paramètres et espace parental.
- Fonctionnement hors ligne après le premier chargement lorsque le navigateur accepte l’installation PWA.
- Préférences sonores distinctes pour chaque profil.
- Réinitialisation confirmée d’une progression depuis la zone parentale.
- Contenu pédagogique entièrement piloté par des fichiers structurés locaux et validés par schéma.
- Moteur de thèmes partagé pour Gabriel et Luca, avec tokens visuels sémantiques.
- Activités ludiques légères compatibles avec le moteur : memory, quiz rapide, remise en ordre, mini-dialogues et révisions.
- Règles centralisées du moteur pédagogique : XP, niveaux, badges, erreurs, consolidation et déverrouillage.

### 3.2 Hors périmètre du MVP

- Comptes, connexion, synchronisation entre appareils ou sauvegarde distante.
- Reconnaissance vocale, notation de prononciation ou conversation avec une IA.
- Classement entre enfants, compétition en ligne ou partage social.
- Notifications push obligatoires ou rappels intrusifs.
- Monétisation, abonnement, achats intégrés ou publicité.
- Création de contenu depuis l’interface parentale.
- Génération automatique de nouvelles leçons.
- Mode multi-enfants simultané sur un même exercice.
- Appel à une IA depuis l’application enfant ou dépendance à un service d’IA en ligne.
- Mini-jeux autonomes complexes avec leur propre économie de récompenses.

## 4. Profils et identités visuelles

Les deux profils **Gabriel** et **Luca** sont préconfigurés dans la première version afin de conserver une expérience immédiatement compréhensible. Ils ne doivent toutefois pas être codés comme des thèmes immuables : un profil, un thème, une progression et des préférences sont quatre concepts distincts.

Le modèle logique sépare :

- le **profil actif** et son identité locale ;
- le **thème sélectionné** et ses paramètres visuels et éditoriaux ;
- la **progression pédagogique** du profil ;
- les **préférences** sonores, d’animation et d’usage.

Changer de thème ultérieurement doit conserver toute la progression du profil. Le choix d’un autre thème peut rester invisible dans l’interface du MVP, mais le modèle de données doit le permettre.

| Profil préconfiguré | Thème par défaut | Direction artistique | Récompenses et ton |
|---|---|---|---|
| **Gabriel** | Capybaras | Chaleureux, doux, drôle, calme, avec une mascotte capybara récurrente | Feuilles, goûters, accessoires de capybara, petites scènes humoristiques |
| **Luca** | Manoir mystérieux | Fantômes sympathiques, objets magiques, exploration et frisson léger | Clés, lanternes, portraits de fantômes, objets de manoir ; jamais d’image réellement effrayante |

### Règles communes

- Le contenu pédagogique reste identique pour les deux profils, sauf si une variante thématique est explicitement prévue dans les données.
- Le thème visuel, les illustrations, les textes d’encouragement, les badges et les récompenses peuvent varier selon le thème sélectionné.
- Les couleurs et illustrations ne doivent jamais réduire la lisibilité du texte ou le contraste.
- L’enfant peut changer de profil depuis l’accueil, mais ne voit pas la progression de l’autre pendant une leçon.
- Le profil actif est toujours visible dans l’en-tête ou le contexte de navigation.
- Les mêmes écrans, composants, moteur pédagogique, navigation, modèles de données et types d’exercices servent aux deux profils.
- Le personnage fantôme de Luca n’a pas encore de prénom définitif ; le cahier des charges ne doit pas en choisir un sans validation.

### 4.1 Moteur de thèmes

Un thème est une configuration de présentation et d’éditorialisation, pas une application indépendante. Il peut définir :

- un identifiant stable et un nom ;
- une palette et des couleurs sémantiques ;
- les typographies ou variantes autorisées ;
- les arrière-plans, illustrations et icônes thématiques ;
- une mascotte et ses expressions ;
- les badges et récompenses visuelles ;
- les textes d’encouragement ;
- les sons, animations ou effets facultatifs ;
- l’apparence des nœuds du parcours ;
- l’apparence des cartes et panneaux de feedback.

Les thèmes futurs pourront représenter l’espace, les dinosaures, les pirates, les dragons, les robots ou la course automobile. Ajouter un thème ne doit pas nécessiter de modifier les écrans principaux.

## 5. Objectifs pédagogiques et curriculum initial

### 5.1 Compétences visées

À l’issue des premiers parcours, l’enfant doit pouvoir :

- saluer quelqu’un et se présenter ;
- comprendre et produire quelques phrases sur sa famille, sa maison, son école et ses activités ;
- demander quelque chose poliment et répondre simplement ;
- comprendre une consigne courte et fréquente ;
- dire ce qu’il aime ou n’aime pas ;
- poser une question simple et reconnaître une réponse ;
- parler brièvement de sa journée ;
- reconnaître et utiliser nombres, couleurs, heures et jours ;
- comprendre des mots et phrases courtes à l’oral dans les thèmes connus.

### 5.2 Parcours proposé pour le lancement

Le nombre exact de leçons peut évoluer avec les essais auprès des enfants. Chaque unité comporte plusieurs leçons courtes et une activité de révision ou de défi sans difficulté punitive.

| Unité | Thème | Exemples de contenus | Résultat attendu |
|---|---|---|---|
| 1. **Hello!** | Saluer et se présenter | hello, hi, good morning, name, I’m…, How are you? | L’enfant sait saluer et dire son prénom. |
| 2. **My family** | Famille et personnes | mum, dad, brother, sister, friend, This is… | L’enfant identifie et présente quelques proches. |
| 3. **Home sweet home** | Maison et objets | room, kitchen, bed, door, table, This is my… | L’enfant reconnaît des lieux et objets familiers. |
| 4. **School and play** | École et jeux | book, pencil, teacher, game, ball, Let’s play! | L’enfant comprend des consignes simples et parle de ses jeux. |
| 5. **Food, please!** | Manger, boire, demander | water, milk, apple, hungry, I’d like…, please, thank you | L’enfant demande un aliment ou une boisson simplement. |
| 6. **Things I like** | Goûts et questions | like, love, don’t like, Do you like…?, Yes, I do / No, I don’t | L’enfant exprime un goût et répond à une question. |
| 7. **My day** | Routine, heures et jours | wake up, eat, go, today, Monday, at eight o’clock | L’enfant comprend et décrit quelques moments de sa journée. |
| 8. **Numbers and colours** | Nombres, couleurs et révisions | 1–20, couleurs courantes, décompte, association de thèmes | L’enfant consolide les notions transversales. |

### 5.3 Règles de contenu

- Préférer les mots fréquents et les phrases observables dans la vie d’un enfant.
- Introduire peu de nouveautés par leçon : 1 à 2 notions nouvelles sont recommandées, 3 au maximum. Une notion peut être un mot, une expression ou une structure ; elle peut regrouper 2 à 4 mots liés. Le total recommandé est de 4 à 8 éléments lexicaux nouveaux.
- Fournir une traduction française ou un indice visuel quand le contexte ne suffit pas.
- Présenter les phrases dans un contexte, un dialogue ou une image plutôt que comme une liste isolée.
- Utiliser des consignes constantes et courtes : « Écoute », « Choisis », « Associe », « Remets dans l’ordre », « Complète ».
- Éviter les pièges grammaticaux, le vocabulaire rare, les traductions ambiguës et les formulations artificielles.
- Prévoir une difficulté interne de 1 à 3 : découverte, consolidation, révision.
- Faire relire le contenu par un adulte compétent en anglais avant publication.

## 6. Organisation de l’apprentissage

La hiérarchie fonctionnelle est :

**Parcours → unités → leçons → exercices → récompense.**

### 6.1 Parcours

La carte du parcours représente l’ensemble du chemin pédagogique. Elle affiche :

- la position actuelle de l’enfant ;
- les unités terminées, en cours et verrouillées ;
- le nombre de leçons terminées par unité ;
- un aperçu du thème de chaque unité ;
- les prochains objectifs atteignables.

Le parcours initial est linéaire pour rester simple. Une évolution pourra proposer des branches facultatives, mais le moteur doit déjà identifier les prérequis par identifiants plutôt que par une logique codée dans l’interface.

### 6.2 Unités

Une unité regroupe une notion ou une situation cohérente. Sa fiche présente :

- son titre et son illustration de profil ;
- les objectifs en langage enfant ;
- les leçons disponibles, verrouillées et terminées ;
- le vocabulaire principal ;
- la récompense associée ;
- un bouton de reprise ou de démarrage.

### 6.3 Leçons

Une leçon :

- dure environ cinq minutes ;
- contient idéalement 5 à 8 exercices ;
- alterne présentation, reconnaissance, écoute, production guidée et révision ;
- indique une progression simple, par exemple « 3 sur 7 » ;
- permet de revenir à l’exercice précédent uniquement si cela ne perturbe pas l’enregistrement des réponses ;
- se termine par une récompense même si certaines réponses sont incorrectes ;
- peut être rejouée à tout moment.

L’ordre recommandé est : découverte d’un mot ou d’une phrase, écoute, association ou choix, réutilisation dans une phrase, mini-dialogue, révision finale.

### 6.4 Boucle pédagogique obligatoire

Toutes les leçons suivent une boucle cohérente. Elles ne doivent pas être une succession aléatoire de quiz :

1. **Découverte.** Présenter un mot, une expression ou une structure dans un contexte compréhensible.
2. **Écoute.** Faire entendre sa prononciation au moins une fois et permettre la réécoute.
3. **Compréhension contextualisée.** Montrer le sens dans une image, une situation, une phrase ou un mini-dialogue.
4. **Reconnaissance guidée.** Vérifier la compréhension avec une interaction simple et fortement guidée.
5. **Réutilisation.** Faire employer la notion dans une phrase, une remise en ordre, une phrase à compléter ou un dialogue.
6. **Correction immédiate.** Expliquer la réponse avec un feedback positif et bref, y compris après une erreur.
7. **Révision de fin.** Reprendre les notions nouvelles et au moins une notion antérieure.
8. **Consolidation ultérieure.** Réintroduire les notions importantes dans une leçon suivante ou une activité de révision.

#### Répartition recommandée d’une leçon

Pour 5 à 8 exercices :

- 1 exercice de découverte ou d’exposition ;
- 1 exercice d’écoute ou de compréhension orale ;
- 2 à 3 exercices de reconnaissance guidée ;
- 1 à 2 exercices de réutilisation ;
- 1 exercice de révision finale.

Au moins deux exercices doivent réutiliser une notion déjà introduite dans la leçon ou dans une leçon précédente. Une leçon ne doit pas introduire une nouvelle notion dans son dernier exercice.

#### Révision et influence des erreurs

- Une nouvelle notion est présentée dans au moins deux types d’exercices différents avant la fin de la leçon.
- Lorsqu’une notion ancienne est disponible, 1 à 2 éléments déjà vus sont réactivés dans chaque nouvelle leçon.
- Une erreur marque la notion concernée comme candidate à la consolidation ; elle ne déclenche pas automatiquement une répétition identique.
- L’exercice suivant peut proposer une variante plus guidée de la même notion si le contenu en fournit une, sans interrompre la progression.
- La révision finale inclut en priorité une notion ayant généré une erreur, puis une notion antérieure choisie pour l’espacement.
- Une notion est identifiée comme « à consolider » après au moins 2 erreurs, ou après un taux d’erreur d’au moins 50 % sur 4 tentatives ou plus.
- Une notion est considérée comme consolidée après 3 réponses correctes dans au moins 2 types d’exercices différents, dont une après une erreur.
- Une même question ne doit pas être répétée plus de deux fois dans la même leçon, sauf demande explicite de rejouer.

La répétition doit donc être espacée, contextualisée et variée. Elle ne doit jamais devenir une punition visible pour l’enfant.

## 7. Types d’exercices et comportement attendu

Le moteur doit proposer un composant générique par type d’exercice. Une leçon choisit et paramètre ces types dans son fichier de contenu.

| Type | Interaction | Validation | Aide et correction |
|---|---|---|---|
| Choix multiple | L’enfant choisit une réponse parmi 2 à 4 propositions. | Une seule réponse ou plusieurs selon le contenu. | Les propositions restent lisibles ; l’ordre peut être mélangé. |
| Association anglais–français | L’enfant relie ou sélectionne des paires. | Toutes les paires doivent être correctes. | Les paires déjà validées restent visibles comme réussies. |
| Association image–mot | L’enfant choisit le mot correspondant à une image ou inversement. | Une correspondance attendue. | L’image ne doit pas être la seule information lorsque plusieurs interprétations sont possibles. |
| Remise en ordre | L’enfant remet des mots dans l’ordre pour former une phrase. | Comparaison avec l’ordre attendu, en acceptant les variantes explicitement autorisées. | Les mots choisis restent accessibles et peuvent être retirés. |
| Traduction simple | L’enfant choisit, compose ou saisit une traduction guidée. | En MVP, privilégier les choix guidés pour éviter les variantes de saisie fragiles. | Afficher la traduction attendue et une explication courte. |
| Écoute d’un mot ou d’une phrase | L’enfant appuie sur écouter puis peut réécouter. | Aucune production vocale requise. | Le texte peut être révélé après une première tentative ou via un bouton d’aide. |
| Reconnaissance de l’oral | L’enfant écoute puis choisit ce qu’il a entendu. | La réponse sélectionnée correspond au texte prononcé. | Le bouton d’écoute reste disponible ; la vitesse est réglable dans les paramètres. |
| Phrase à compléter | L’enfant choisit ou place le mot manquant. | La réponse attendue est définie dans le contenu. | L’indice peut utiliser une image ou la première lettre. |
| Mini-dialogue | L’enfant choisit la réplique adaptée dans une courte conversation. | La réponse doit être cohérente avec le contexte. | Les rôles et les bulles permettent de suivre qui parle. |
| Memory vocabulaire | L’enfant retourne des cartes pour retrouver des paires. | Une paire peut être mot–image ou anglais–français. | Le nombre de cartes est limité pour préserver la durée de la leçon. |
| Vrai ou faux | L’enfant juge une phrase, une image ou une traduction. | Une réponse booléenne attendue. | La correction explique la notion en une phrase. |

### Règles communes à tous les exercices

- Le bouton principal est large, clairement libellé et placé dans la zone facilement atteignable sur mobile.
- Une réponse est verrouillée après validation pour éviter les doubles clics.
- Le feedback apparaît immédiatement, sans interrompre inutilement le rythme.
- L’enfant peut réessayer après une erreur, avec une formulation encourageante.
- Une erreur est enregistrée pour la progression parentale, sans retirer d’XP déjà acquis.
- La réponse correcte et l’explication sont affichées avant de passer à la suite.
- Les réponses correctes peuvent être lues à voix haute si les sons sont activés.
- Le contenu indique si une question accepte plusieurs réponses correctes.

## 8. Voix et synthèse vocale

### 8.1 Usage

La synthèse vocale fournie par le navigateur est utilisée pour :

- prononcer un mot isolé ;
- lire une phrase ou une consigne anglaise ;
- répéter une écoute autant de fois que nécessaire ;
- faire entendre les répliques d’un mini-dialogue ;
- lire la correction lorsque cela apporte une valeur pédagogique.

### 8.2 Paramètres

- Langue cible : anglais, avec préférence pour une voix anglaise disponible sur l’appareil.
- Vitesse par défaut : légèrement ralentie pour les enfants, sans déformer la prononciation.
- Contrôle utilisateur : écouter, réécouter, lecture automatique facultative, sons activés ou désactivés.
- Préférence indépendante par profil, stockée localement.

### 8.3 Limites et fallback

La disponibilité, le nom des voix et le comportement de la synthèse vocale varient selon le navigateur et le système d’exploitation. L’application doit donc :

- détecter l’absence de synthèse vocale sans bloquer l’exercice ;
- laisser l’enfant continuer en mode silencieux ;
- afficher un message simple dans les paramètres pour expliquer la limitation ;
- ne pas dépendre d’un téléchargement audio obligatoire ;
- arrêter proprement une lecture lorsqu’on change de page ou d’exercice ;
- éviter de lancer plusieurs lectures simultanées.

La reconnaissance vocale et l’évaluation de la prononciation sont explicitement reportées à une version ultérieure.

## 9. Moteur pédagogique, gamification et progression

Les règles de progression sont déterministes, compréhensibles et centralisées dans une configuration du moteur. Elles ne doivent jamais être réparties dans les composants d’écran ou réinventées pour chaque leçon.

### 9.1 États de progression

Une leçon possède l’un des états suivants :

- **verrouillée** : un prérequis n’est pas satisfait ;
- **disponible** : elle peut être commencée ;
- **en cours** : au moins une réponse ou un état intermédiaire a été enregistré ;
- **terminée** : l’enfant a parcouru tous les exercices jusqu’à l’écran de fin.

Une leçon parcourue jusqu’au bout est terminée quel que soit le nombre d’erreurs. L’exactitude influence la consolidation et les recommandations de révision, jamais le droit de continuer.

Une unité est terminée lorsque toutes ses leçons obligatoires sont terminées. Une activité de révision ou un mini-jeu optionnel ne doit pas empêcher la complétion d’une unité.

### 9.2 Règles d’XP initiales

Les valeurs suivantes constituent la configuration initiale proposée :

| Événement | Gain lors de la première occurrence | Gain lors d’un rejeu | Règle |
|---|---:|---:|---|
| Exercice parcouru jusqu’à sa validation | 5 XP | 1 XP | Une seule fois pour la première complétion de l’exercice. |
| Réponse correcte dès la première soumission | +2 XP | 0 XP | Bonus facultatif lié à cette tentative, sans pénaliser les erreurs. |
| Leçon terminée | +20 XP | 0 XP | Attribué une seule fois après le dernier exercice. |
| Unité terminée | +50 XP | 0 XP | Attribué une seule fois lorsque les leçons obligatoires sont terminées. |
| Badge obtenu | 0 XP par défaut | 0 XP | Le badge est une récompense visuelle ; un bonus doit être déclaré explicitement. |

Pour une leçon interrompue avant sa première complétion, les règles de première complétion s’appliquent lorsqu’elle est finalement terminée. Pour une leçon déjà terminée, le rejeu reste utile pour la consolidation mais ne permet pas d’accumuler des XP sans limite : le gain de rejeu est plafonné à 5 XP par leçon et par jour local.

Principes obligatoires :

- aucune perte d’XP ;
- aucune vie obligatoire ;
- aucune pénalité liée au nombre d’erreurs ;
- aucun bonus de rejeu pour la simple ouverture d’une leçon ;
- les règles restent identiques pour Gabriel et Luca, quel que soit le thème.

### 9.3 Niveaux

La configuration initiale est volontairement simple :

- niveau 1 à partir de 0 XP ;
- chaque niveau supplémentaire demande 100 XP cumulés supplémentaires ;
- le niveau `n` commence donc à `100 × (n - 1)` XP cumulés ;
- le niveau n’a aucune conséquence punitive et ne verrouille aucun contenu.

Les seuils sont regroupés dans la configuration de progression afin de pouvoir être ajustés après observation de l’usage. L’écran affiche le niveau, l’XP du niveau courant et la distance vers le suivant, avec un état compréhensible lorsque le niveau maximal initial est atteint.

### 9.4 Badges initiaux

Les premiers badges sont déclaratifs et attribués une seule fois :

| Badge | Condition initiale |
|---|---|
| Première aventure | Terminer la première leçon du profil. |
| En route | Terminer une unité obligatoire. |
| Cinq pas | Terminer cinq leçons distinctes. |
| Bonne oreille | Écouter dix mots ou phrases dans les exercices prévus. |
| Petit explorateur | Terminer trois activités de révision ou mini-jeux légers. |
| Je n’abandonne pas | Réussir une notion identifiée comme à consolider dans une activité ultérieure. |

Les badges ne doivent pas imposer une série quotidienne, une connexion obligatoire ou une compétition. Leurs conditions et leurs visuels sont définis dans les fichiers de contenu ou de récompenses.

### 9.5 Déverrouillage

- La première leçon du premier parcours est disponible immédiatement.
- La leçon suivante se déverrouille lorsque la précédente est terminée.
- La première leçon d’une unité suivante se déverrouille lorsque toutes les leçons obligatoires de l’unité précédente sont terminées.
- Les prérequis sont déclarés par identifiants dans le contenu ; ils ne sont pas déduits de la position visuelle d’un nœud.
- La zone parentale peut rendre une unité disponible pour faciliter un accompagnement ou une révision.
- Toute leçon terminée reste rejouable.
- Une erreur, même répétée, ne peut jamais verrouiller définitivement une leçon.

### 9.6 Erreurs fréquentes et consolidation

Pour chaque notion, la progression locale conserve au minimum le nombre de tentatives, le nombre d’erreurs, le nombre de réussites, la date de dernière exposition et les réussites consécutives.

Une notion est candidate à la consolidation si :

- elle a généré au moins 2 erreurs ; ou
- elle présente au moins 50 % d’erreurs après 4 tentatives ou plus.

Une notion est considérée comme consolidée après 3 réussites dans au moins 2 types d’exercices différents, dont une réussite après une erreur. La consolidation ne supprime pas l’historique ; elle fait évoluer l’état de la notion.

Après une erreur :

- le feedback corrige immédiatement et simplement ;
- l’exercice suivant peut proposer une variante plus guidée si le contenu la prévoit ;
- la révision finale priorise la notion concernée ;
- une leçon ultérieure peut réintroduire la notion dans un autre contexte ;
- aucun exercice identique ne doit être répété plus de deux fois dans la même leçon.

### 9.7 Objectif quotidien facultatif

L’objectif quotidien est facultatif et sans conséquence sur le parcours. Il peut proposer « terminer une leçon » ou « gagner quelques XP ».

- Il est désactivé par défaut ou activable par le parent.
- Il ne remet pas les XP à zéro et ne retire aucun contenu lorsqu’il est manqué.
- Il ne crée pas de série obligatoire.
- Il repose sur la date locale de l’appareil.

### 9.8 Centralisation et idempotence

La configuration de progression regroupe les valeurs d’XP, les seuils de niveau, les limites de rejeu, les conditions de badge, les critères de consolidation et les règles de déverrouillage.

Chaque récompense doit être identifiée par un événement stable, par exemple le profil, l’identifiant de l’unité ou de la leçon, le type de récompense et la version sémantique du contenu. Revenir sur l’écran de fin, recharger la page ou rouvrir l’application ne doit jamais attribuer deux fois le même bonus.

## 10. Description détaillée des écrans

### 10.1 Accueil

**Objectif :** permettre de reprendre immédiatement l’apprentissage.

Contenu recommandé :

- illustration et ambiance du profil actif ;
- prénom du profil ;
- niveau et barre d’XP ;
- bouton principal « Continuer » vers la prochaine leçon disponible ;
- aperçu de l’unité en cours ;
- progression récente ;
- raccourcis vers badges, progression et paramètres ;
- accès clairement visible au changement de profil.

États à prévoir : premier lancement, aucune leçon commencée, leçon en cours, parcours terminé, sons indisponibles.

### 10.2 Choix du profil

**Objectif :** choisir l’espace local de Gabriel ou de Luca avant d’apprendre.

- Deux grandes cartes tactiles, une par profil.
- Illustration, prénom et univers clairement distincts.
- Aucun score de l’autre profil affiché sur la carte.
- Retour possible sans perte de progression.
- Le profil sélectionné est mémorisé pour le prochain lancement, sans empêcher de changer.

### 10.3 Carte du parcours

**Objectif :** rendre la progression visible et donner une prochaine étape.

- Parcours vertical ou en chemin sinueux adapté à la largeur mobile.
- Nœuds de leçons avec état disponible, en cours, terminé ou verrouillé.
- Unités séparées par un titre, une couleur de thème et une illustration.
- Légende visuelle doublée d’un texte pour l’accessibilité.
- Bouton pour reprendre l’étape recommandée.

### 10.4 Écran d’unité

**Objectif :** présenter le sens de l’unité avant de lancer une leçon.

- Titre, objectif, illustration et récompense à gagner.
- Liste des leçons avec durée estimée et état.
- Aperçu de quelques mots ou phrases.
- Bouton de démarrage de la première leçon disponible.
- Possibilité de rejouer une leçon terminée.

### 10.5 Lancement d’une leçon

**Objectif :** donner envie de commencer et cadrer l’activité.

- Titre de la leçon.
- Durée estimée, nombre approximatif d’exercices et objectif en langage enfant.
- Aperçu des notions étudiées.
- Contrôle des sons ou indication de leur état.
- Bouton « Commencer ».
- Retour vers l’unité sans créer de progression artificielle.

### 10.6 Exercice

**Objectif :** permettre une interaction unique, claire et sans surcharge.

Structure recommandée :

- en-tête léger avec retour, numéro d’exercice et progression ;
- consigne courte en français ;
- contenu à apprendre en anglais, image ou dialogue selon le type ;
- bouton d’écoute lorsque pertinent ;
- zone de réponse ;
- bouton de validation désactivé tant qu’aucune réponse n’est sélectionnée ;
- accès à un indice non punitif si le contenu le prévoit.

L’écran doit rester utilisable en portrait sur un petit mobile, avec défilement limité et sans interaction dépendant du survol.

### 10.7 Résultat d’une réponse

**Objectif :** transformer immédiatement la réponse en apprentissage.

En cas de réussite :

- signal visuel positif et son optionnel ;
- formulation courte d’encouragement ;
- rappel de la bonne réponse si utile ;
- bouton pour continuer.

En cas d’erreur :

- signal visuel distinct mais non alarmant ;
- indication de la bonne réponse ;
- explication simple ou traduction ;
- invitation à réessayer ou à continuer ;
- aucune perte de vie obligatoire ni blocage prolongé.

### 10.8 Fin de leçon

**Objectif :** clôturer positivement et orienter la suite.

- animation simple de réussite adaptée au profil ;
- XP gagnés et nouveau niveau éventuel ;
- leçon terminée et prochaine leçon déverrouillée ;
- badge obtenu, s’il y en a un ;
- une ou deux notions à revoir lorsque des erreurs sont fréquentes ;
- bouton « Rejouer » ;
- bouton « Continuer le parcours » ;
- retour accueil.

La fin de leçon doit fonctionner même si l’enfant quitte puis revient après le dernier exercice : elle ne doit pas créer de doublon de récompense.

### 10.9 Badges

**Objectif :** montrer les réussites accumulées.

- Grille de badges obtenus et à découvrir.
- Description de chaque condition en termes simples.
- Style visuel propre au profil.
- Les badges verrouillés donnent une indication motivante, sans révéler une longue liste de tâches obligatoires.

### 10.10 Progression

**Objectif :** visualiser l’apprentissage au-delà de la prochaine leçon.

- niveau, XP total et progression vers le niveau suivant ;
- unités commencées ou terminées ;
- nombre de leçons terminées ;
- thèmes ou mots récemment étudiés ;
- erreurs fréquentes présentées comme des points à revoir ;
- éventuellement objectif quotidien et historique local.

### 10.11 Paramètres

**Objectif :** laisser l’enfant ou le parent ajuster l’expérience sans ambiguïté.

- sons activés ou désactivés ;
- lecture automatique des exemples, si disponible ;
- vitesse de lecture ;
- préférence d’animations réduites lorsque le système le demande ;
- rappel du profil actif ;
- accès à la zone parentale.

Les préférences sont propres au profil lorsque cela est pertinent, en particulier les sons et la vitesse de lecture.

### 10.12 Espace parental simple

**Objectif :** offrir une vue de contrôle locale, courte et compréhensible.

Contenu :

- sélection du profil consulté ;
- progression globale par unité et par leçon ;
- XP, niveau et badges ;
- erreurs fréquentes classées par notion, sans jugement ;
- choix des unités disponibles ou déverrouillées ;
- activation ou désactivation des sons ;
- action de réinitialisation de la progression.

Avant une réinitialisation :

1. afficher clairement le profil concerné ;
2. expliquer les données qui seront supprimées ;
3. proposer Annuler et Confirmer ;
4. ne supprimer qu’après confirmation explicite ;
5. revenir à un état initial cohérent et afficher un message de confirmation.

Une barrière légère, par exemple un appui prolongé ou une question simple, peut éviter les ouvertures accidentelles. Elle ne doit pas être présentée comme une authentification sécurisée.

## 11. Architecture du contenu pédagogique

Le contenu pédagogique est entièrement piloté par des données locales validées par schéma. Aucun élément pédagogique ne doit être écrit directement dans les composants d’interface ou dans le moteur : mots, phrases, questions, réponses, traductions, dialogues, explications, textes vocaux, récompenses et messages dépendant d’une leçon proviennent des fichiers de contenu.

Le moteur fournit les règles et les composants d’interaction. Les données fournissent ce que l’enfant apprend, dans quel ordre, avec quelles variantes et quelles récompenses.

### 11.1 Hiérarchie fonctionnelle

```text
Parcours
└── Unités
    └── Leçons
        ├── Exercices
        ├── Vocabulaire
        ├── Phrases
        ├── Dialogues
        ├── Images et médias
        ├── Textes vocaux
        └── Récompenses
```

Une leçon référence des notions nouvelles et anciennes, puis ordonne ses exercices. Elle ne duplique pas inutilement la définition complète d’un mot, d’un dialogue ou d’une récompense réutilisable.

### 11.2 Organisation pragmatique des fichiers

Une nouvelle leçon ne doit pas nécessiter un fichier séparé par exercice. L’organisation cible est la suivante :

```text
content/
├── course.json
├── units/
│   ├── hello.json
│   └── family.json
├── lessons/
│   ├── hello-01.json
│   └── hello-02.json
├── vocabulary.json
├── dialogues.json
├── rewards.json
├── badges.json
└── themes/
    ├── gabriel-capybara.json
    └── luca-manoir.json
```

Les libellés d’interface généraux peuvent être regroupés dans les ressources de locale de l’application. Les messages pédagogiques dépendant d’une leçon restent dans le contenu de cette leçon.

### 11.3 Responsabilités des fichiers

| Fichier ou dossier | Responsabilité |
|---|---|
| `course.json` | Identité du parcours, version du contenu, version de schéma, ordre des unités et règles de compatibilité. |
| `units/` | Objectifs, titre, difficulté, prérequis, ordre des leçons, notions principales et récompense d’unité. |
| `lessons/` | Durée, objectif enfant, notions nouvelles, notions à revoir, ordre des exercices et récompense de leçon. Chaque leçon contient ses exercices ordonnés. |
| `vocabulary.json` | Mots et expressions réutilisables, traduction, catégorie, exemples, niveau et texte vocal. |
| `dialogues.json` | Contextes, rôles, répliques, traductions ou aides et textes vocaux associés. |
| `rewards.json` | Récompenses visuelles ou éditoriales, identifiants d’assets et conditions éventuelles. |
| `badges.json` | Conditions déclaratives, titre, description, illustration et règles d’attribution unique. |
| `themes/` | Thèmes disponibles, tokens sémantiques, mascotte, illustrations, badges, récompenses et textes d’encouragement. |

Les images, sons ou animations référencés par les données restent des assets séparés avec des identifiants stables. Leur emplacement et leur format sont validés avant publication ; aucun asset externe obligatoire ne doit être chargé depuis un service distant.

### 11.4 Entités et références

Chaque entité comporte au minimum un identifiant stable, une version de schéma et les références nécessaires à son rattachement. Les entités principales sont :

| Entité | Champs fonctionnels attendus |
|---|---|
| Parcours | Identifiant, titre, description, version du contenu, unités ordonnées, règles de compatibilité. |
| Unité | Identifiant, parcours, titre, thème éditorial, objectif, difficulté, prérequis, leçons, récompense. |
| Leçon | Identifiant, unité, titre, objectif, durée, difficulté, notions nouvelles, notions à revoir, exercices ordonnés, récompense. |
| Exercice | Identifiant, type, consigne, texte anglais, texte vocal, réponses, explication, indice, médias, notions mobilisées et feedback. |
| Vocabulaire | Identifiant, mot ou expression anglais, traduction, catégorie, exemples, difficulté, texte vocal, médias éventuels. |
| Dialogue | Identifiant, contexte, rôles, répliques, traduction ou aide, textes vocaux et notions mobilisées. |
| Récompense | Identifiant, type, titre, description, asset, profil ou thème compatible, valeur éventuelle. |
| Badge | Identifiant, condition, titre, description, asset, règle d’attribution unique. |
| Thème | Identifiant, nom, tokens, mascotte, assets, textes, sons, animations et composants visuels autorisés. |

Les identifiants ne doivent jamais être réutilisés pour une autre notion. Les références invalides, les doublons, les cycles de prérequis et les réponses absentes rendent le contenu invalide.

### 11.5 Contrat d’un exercice

Selon son type, un exercice peut définir :

- une consigne en français ;
- le mot, l’expression ou la phrase anglaise à afficher ;
- le texte exact à lire vocalement ;
- une traduction ou une explication ;
- une ou plusieurs réponses correctes ;
- des propositions de réponse ;
- un ordre attendu ou des variantes acceptées ;
- une image, une paire d’images, des cartes ou un dialogue ;
- un indice facultatif ;
- une difficulté ;
- les identifiants de vocabulaire, phrases ou notions mobilisés ;
- une contribution à la boucle de découverte, reconnaissance, réutilisation ou révision ;
- des messages de feedback pédagogiques lorsque le contexte le nécessite.

Les composants d’exercice ne connaissent pas le thème Gabriel ou Luca. Ils reçoivent les données du contenu et les tokens du thème actif.

### 11.6 Identifiants, versions et compatibilité

- `schemaVersion` décrit la forme technique des données.
- `contentVersion` décrit la version pédagogique publiée.
- Une progression conserve les identifiants de cours, d’unité, de leçon, d’exercice et de notion ainsi que la version utilisée.
- Modifier le texte d’une notion sans changer son sens peut conserver son identifiant ; changer sa signification nécessite un nouvel identifiant.
- Une leçon retirée est marquée comme archivée ou remplacée plutôt que supprimée brutalement.
- Une table de remplacement peut rediriger une ancienne leçon vers une nouvelle sans effacer l’historique.
- Une référence devenue indisponible doit produire un état « contenu archivé » compréhensible, jamais un écran cassé.
- Les migrations du schéma de stockage local sont séparées des migrations du contenu pédagogique.

### 11.7 Validation et workflow de contenu

Avant intégration, une leçon suit ce processus :

1. création en statut brouillon ;
2. validation du schéma et des types d’exercice ;
3. contrôle des identifiants, références, réponses, médias et textes vocaux ;
4. contrôle de la durée et de la boucle pédagogique ;
5. relecture de l’anglais, du français et de l’adéquation à l’âge ;
6. vérification de la cohérence avec les notions déjà introduites ;
7. test manuel sur mobile avec sons activés et désactivés ;
8. publication dans une nouvelle version de contenu.

Une erreur de validation doit empêcher l’intégration du contenu invalide. Les contrôles doivent notamment détecter les références manquantes, les réponses qui ne figurent pas parmi les propositions, les textes vocaux absents pour une écoute, les types incompatibles avec leurs champs, les assets inexistants, les prérequis circulaires et les leçons sans révision finale.

### 11.8 Préparation à une génération assistée par IA

L’architecture est compatible avec une future génération de leçons assistée par IA, mais l’application enfant n’effectue aucun appel à une IA et la V1 ne dépend d’aucun service d’IA.

Le futur flux doit rester :

```text
Brouillon généré
→ validation automatique du schéma
→ contrôle des références et de la pédagogie
→ relecture humaine adulte
→ publication d’une version de contenu
```

Un contenu généré ultérieurement ne peut donc pas être publié directement sans validation automatique et relecture humaine.

### 11.9 Règle d’extensibilité

Ajouter une leçon, une phrase, un dialogue, une récompense ou un thème existant doit se faire par ajout ou modification de données validées. Les composants principaux ne doivent pas être modifiés pour changer un titre, une réponse, une illustration, un texte vocal ou l’ordre des exercices.

L’ajout d’un nouveau type d’exercice ou d’un mini-jeu nécessitera en revanche un nouveau contrat de données, un renderer spécialisé, des états de feedback et des tests associés. Cette distinction sépare clairement l’extension de contenu de l’extension fonctionnelle.

## 12. Données locales et progression

### 12.1 Données à conserver

Pour chaque profil :

- identifiant du profil et date de première utilisation ;
- thème sélectionné et thèmes autorisés, séparés de l’identité du profil ;
- XP total et niveau courant ;
- leçons commencées, terminées et en cours ;
- réponses et erreurs agrégées par exercice ou notion ;
- badges obtenus ;
- unités disponibles ou déverrouillées ;
- objectif quotidien facultatif et historique local éventuel ;
- sons, vitesse de lecture et préférences d’animation ;
- version du contenu utilisée pour la progression.

Pour l’application :

- profil actif ;
- version du schéma de données ;
- état minimal nécessaire au fonctionnement hors ligne ;
- indicateur éventuel d’introduction déjà vue.

### 12.2 Règles de persistance

- Enregistrer l’état après une réponse validée et à la fin de chaque étape importante.
- Sauvegarder la leçon en cours de façon à limiter la perte en cas de fermeture de l’onglet.
- Marquer une leçon comme terminée une seule fois, même si l’écran de fin est rouvert.
- Recalculer ou migrer les données lorsque le format local évolue.
- Ne jamais dépendre d’un identifiant d’index de tableau pour retrouver une progression ; utiliser des identifiants stables.
- Prévoir un état vide ou réparé si le stockage est indisponible ou corrompu.

### 12.3 Comparaison des solutions de stockage

| Critère | `localStorage` | IndexedDB |
|---|---|---|
| Modèle | Paires clé–valeur sous forme de chaînes | Base locale structurée avec objets et index |
| API | Très simple, synchrone | Asynchrone, plus verbeuse |
| Volume et évolution | Adapté à quelques préférences ; quota limité et variable | Plus adapté à des historiques et à une évolution de schéma |
| Robustesse | Peu pratique pour des mises à jour partielles ou transactionnelles | Transactions, magasins séparés, migrations possibles |
| Impact interface | Une opération synchrone peut bloquer brièvement l’interface | Opérations asynchrones adaptées aux écrans interactifs |
| Maintenance | Rapide au prototype | Plus structurée pour plusieurs profils et exercices |
| Risque de perte logique | Sérialisation manuelle de gros objets | Meilleure séparation des données et des versions |

### 12.4 Recommandation

Recommander **IndexedDB comme stockage principal** pour les profils, la progression, les erreurs et les préférences. Cette solution est plus adaptée à deux historiques indépendants, aux mises à jour fréquentes pendant les leçons et aux futures migrations de données.

`localStorage` peut rester limité à des valeurs triviales, comme le dernier profil actif ou un indicateur d’introduction, si cela simplifie le démarrage. Il ne doit pas devenir la source de vérité de la progression.

Le contenu pédagogique reste dans les fichiers statiques de l’application : il n’est pas nécessaire de le recopier intégralement dans IndexedDB au premier lancement. Seules les données utilisateur doivent être persistées.

## 13. Architecture technique cible

### 13.1 Choix technologiques

| Domaine | Choix cible | Justification |
|---|---|---|
| Framework | Next.js avec App Router | Structure moderne, routage clair et possibilité d’export statique |
| Langage | TypeScript | Contrats explicites pour le contenu et la progression |
| Style | Tailwind CSS | Styles responsifs et système visuel partagé entre les profils |
| Installation | PWA avec manifest et service worker | Ajout à l’écran d’accueil et fonctionnement hors ligne |
| Persistance | IndexedDB, avec couche d’abstraction | Données structurées et migrations locales |
| Voix | Web Speech API, principalement `speechSynthesis` | Pas de serveur audio ni de service payant obligatoire |
| Hébergement cible | Hébergement statique compatible avec l’export Next.js | Pas de backend ni de traitement serveur nécessaire |

### 13.2 Découpage logique

1. **Contenu statique.** Parcours, unités, leçons, exercices, vocabulaire, phrases et récompenses.
2. **Contrats et validation.** Vérification des données, identifiants, types d’exercices et compatibilité de version.
3. **Moteur pédagogique.** Sélection de la prochaine leçon, calcul des réponses, XP, badges, déverrouillage et erreurs fréquentes.
4. **Persistance locale.** Lecture, écriture, migration et réinitialisation IndexedDB.
5. **Services de plateforme.** Synthèse vocale, détection hors ligne, préférence de réduction des animations et installation PWA.
6. **Composants d’interface.** Écrans partagés, exercices génériques, feedback et navigation.
7. **Moteur de thèmes.** Résolution du thème sélectionné, tokens sémantiques, mascotte, assets et variantes éditoriales.
8. **Design system.** Tokens, composants partagés et règles responsives sans couleur ou typographie codée dans les écrans métier.

### 13.3 Principes d’architecture

- Les écrans orchestrent les états ; ils ne contiennent pas les règles de calcul de progression.
- Le moteur ne dépend pas du thème visuel d’un profil.
- Les exercices sont rendus à partir d’un type déclaré et d’un contenu validé.
- La persistance est appelée via une interface unique afin de pouvoir tester ou remplacer le stockage.
- Le service vocal accepte un texte explicite fourni par le contenu et ne tente pas d’inférer des phrases au dernier moment.
- Les composants d’interface restent réutilisables entre les deux profils.
- Le thème est injecté par configuration ; aucun écran ne contient de branche métier spécifique à Gabriel ou Luca.
- Les composants dépendent de rôles visuels sémantiques, jamais de noms de couleurs comme `purple`, `green` ou `brown`.
- Les erreurs de stockage, de voix ou de réseau sont traitées comme des états normaux et explicites.

### 13.4 Compatibilité entre profil et thème

Le profil actif, le thème sélectionné, la progression pédagogique et les préférences sont persistés séparément. Changer de thème ne réinitialise ni XP, ni niveaux, ni badges, ni leçons terminées, ni notions à consolider.

Le MVP peut afficher uniquement le thème par défaut de chaque profil. Le modèle doit néanmoins permettre d’ajouter un nouveau thème et de l’associer à un profil sans modifier les écrans principaux.

### 13.5 Navigation fonctionnelle cible

Les routes ou équivalents de navigation peuvent suivre cette organisation :

- accueil ;
- choix du profil ;
- carte du parcours ;
- détail d’une unité ;
- lancement d’une leçon ;
- exercice et feedback ;
- fin de leçon ;
- badges ;
- progression ;
- paramètres ;
- espace parental.

Les identifiants de profil, unité et leçon doivent être transmis de manière stable et validée. Un lien direct vers une leçon verrouillée doit rediriger vers une explication ou vers l’unité concernée, jamais vers un écran cassé.

## 14. PWA et fonctionnement hors ligne

### Exigences

- Manifest avec nom, nom court, icônes, couleur de thème, couleur de fond et mode standalone.
- Icônes adaptées aux tailles et masques courants sur mobile.
- Service worker pour mettre en cache l’interface, les fichiers de contenu et les illustrations nécessaires.
- Écran ou état de chargement utilisable lorsque l’application démarre hors connexion.
- Progression utilisable sans réseau après mise en cache initiale.
- Aucun appel réseau nécessaire pour afficher le parcours, lancer une leçon ou enregistrer une réponse.
- Indication discrète du mode hors ligne si elle est utile, sans bloquer l’enfant.
- Mise à jour du contenu contrôlée : une nouvelle version ne doit pas mélanger silencieusement des fichiers incompatibles avec une ancienne progression.

### Limites à documenter

- Une première ouverture nécessite le chargement des fichiers statiques.
- La synthèse vocale dépend des voix installées sur l’appareil et peut être moins fiable hors connexion selon le système.
- L’installation PWA et certaines fonctions varient selon le navigateur.
- Les données locales peuvent être effacées par l’utilisateur, le navigateur ou le nettoyage de stockage de l’appareil ; l’absence de sauvegarde distante est un choix de périmètre.

## 15. Direction UX, UI et design system

La référence jointe définit une direction artistique générale : jeu mobile illustré, interface claire et tactile, parcours vertical immersif, gros boutons, cartes arrondies, progression visible, mascotte-compagnon et navigation basse. Elle sert de référence d’intention et de hiérarchie, pas de modèle à reproduire pixel par pixel.

### 15.1 Design tokens et règles de maintenance

Toutes les valeurs visuelles importantes sont centralisées dans un design system. Aucun écran métier ne doit contenir directement une couleur, une typographie, une taille d’ombre ou une valeur d’espacement propre à un thème.

Les composants consomment des tokens sémantiques tels que :

```text
background
surface
surfaceElevated
textPrimary
textSecondary
primary
primaryContrast
secondary
success
warning
error
locked
progressTrack
progressValue
focus
```

Les composants ne doivent jamais dépendre d’un nom de couleur comme `purple`, `green`, `brown` ou `blue`. Le thème actif associe ces rôles à des valeurs concrètes.

Les règles suivantes sont obligatoires :

- aucune couleur directement codée dans un écran ou un composant métier ;
- aucune typographie directement codée dans un composant métier ;
- aucune valeur visuelle importante dupliquée entre composants ;
- structure fonctionnelle et habillage visuel séparés ;
- thèmes appliqués par configuration et tokens ;
- composants partagés entre Gabriel, Luca et les futurs thèmes ;
- contraste et lisibilité prioritaires sur les illustrations ;
- valeurs responsives prévues pour petit mobile, grand mobile et tablette.

### 15.2 Règles communes d’expérience

- L’application est conçue d’abord en portrait sur mobile, puis adaptée aux tablettes.
- Le parcours principal est vertical ou suit un chemin lisible, sans imposer une grande largeur d’écran.
- Une action principale est mise en évidence par écran.
- Le bouton principal reste facilement atteignable dans la partie basse lorsque l’écran le permet.
- Les boutons et cartes interactives visent une zone tactile d’au moins 44 × 44 px.
- Les cartes sont arrondies et hiérarchisent clairement contenu, progression et action.
- Le profil, le niveau et la progression restent visibles sans occuper la zone de réponse.
- Les illustrations enrichissent l’univers sans recouvrir les consignes ou les réponses.
- Les zones sûres des appareils avec encoche et les barres système sont respectées.
- Les animations sont courtes, gratifiantes et compatibles avec `prefers-reduced-motion`.
- Les états sont compréhensibles sans dépendre uniquement de la couleur ou du son.
- La navigation au clavier possède un focus visible lorsque l’application est utilisée sur tablette avec clavier ou ordinateur.

### 15.3 Composants visuels partagés

Ces composants constituent la base du design system. Leur rôle et leurs états sont communs à tous les thèmes.

| Composant | Rôle | États indispensables |
|---|---|---|
| `AppShell` | Cadre de l’application, fond, thème actif, navigation et zones sûres. | Chargement, contenu prêt, hors ligne, erreur récupérable, thème actif. |
| `ProfileHeader` | Affiche mascotte, prénom, niveau, XP et accès au profil. | Normal, progression proche du niveau suivant, niveau augmenté, profil compact. |
| `BottomNavigation` | Navigation principale entre accueil, parcours, badges et profil. | Actif, inactif, focus, désactivé temporairement, zone sûre respectée. |
| `PrimaryButton` | Action principale d’un écran ou d’un exercice. | Normal, pressé, focus, désactivé, chargement. |
| `SecondaryButton` | Action secondaire, retour, aide ou rejeu. | Normal, pressé, focus, désactivé. |
| `Card` | Conteneur visuel pour une leçon, une récompense ou une information. | Standard, sélectionné, verrouillé, terminé, surélevé. |
| `ProgressBar` | Montre une progression d’XP, de leçon ou d’unité. | Vide, en cours, complète, mise à jour, avec texte alternatif. |
| `XPIndicator` | Affiche XP total, niveau et progression vers le suivant. | Normal, gain récent, niveau augmenté, niveau maximal initial. |
| `LessonNode` | Représente une leçon sur la carte du parcours. | Verrouillée, disponible, actuelle, en cours, terminée, rejouable. |
| `UnitSection` | Regroupe visuellement une unité et ses leçons. | Verrouillée, disponible, en cours, terminée, réduite si nécessaire. |
| `ExerciseCard` | Structure commune d’un exercice. | Prêt, réponse en cours, validation, feedback positif, feedback d’erreur, voix indisponible. |
| `AnswerOption` | Choix, carte, mot ou élément sélectionnable. | Normal, sélectionné, correct, incorrect, validé, désactivé. |
| `AudioButton` | Lance, arrête ou répète une synthèse vocale. | Disponible, lecture, arrêt, indisponible, sons désactivés. |
| `FeedbackPanel` | Explique le résultat et propose la suite. | Réussite, erreur, correction, notion à consolider, action suivante. |
| `MascotMessage` | Porte encouragement, indice ou transition éditoriale. | Accueil, encouragement, indice, erreur rassurante, fin de leçon. |
| `RewardModal` | Présente XP, badge ou récompense après une action. | Nouvelle récompense, récompense déjà vue, fermeture, animation réduite. |
| `BadgeCard` | Affiche un badge obtenu ou à découvrir. | Obtenu, verrouillé, condition visible, focus. |
| `ConfirmationDialog` | Protège une action sensible comme la réinitialisation. | Fermé, ouvert, annulation, confirmation, erreur de traitement. |

Les composants ne connaissent ni les phrases ni les règles d’XP. Ils reçoivent des données validées et les tokens du thème actif.

### 15.4 Thème Gabriel — capybaras

Univers :

- capybaras, nature chaleureuse, rivière, forêt douce et cabanes ;
- formes arrondies, humour calme et ambiance rassurante ;
- mascotte capybara comme compagnon et guide ;
- illustrations riches mais zones de réponse dégagées.

Palette générale inspirée de la référence :

- vert naturel ;
- beige clair ;
- caramel ;
- jaune chaleureux ;
- bleu doux.

Les récompenses peuvent inclure des feuilles, fruits, goûters, chapeaux, lunettes, sacs et accessoires de décor. La palette exacte, les typographies et les illustrations restent centralisées dans le fichier du thème.

### 15.5 Thème Luca — manoir mystérieux

Univers initial :

- manoir mystérieux, nuit douce, fantômes sympathiques et lanternes ;
- bibliothèque secrète, objets magiques et exploration ;
- léger frisson adapté à un enfant ;
- mascotte fantôme rassurante, curieuse et amusante.

Palette générale inspirée de la référence :

- bleu nuit ;
- violet ;
- ambre ;
- gris bleuté ;
- vert spectral léger.

Les récompenses peuvent inclure des clés, lanternes, portraits, grimoires, potions fantaisistes et zones découvertes du manoir.

Le thème ne doit inclure ni sang, ni violence, ni visage réaliste inquiétant, ni menace, ni jumpscare, ni bruit strident, ni image réellement effrayante. Le thème du manoir doit pouvoir être remplacé ultérieurement si Luca n’y accroche pas. Le prénom de la mascotte fantôme reste à définir après validation.

### 15.6 Audio et haptique

- Les sons de réussite sont courts, doux et désactivables.
- Aucun son ne doit être indispensable pour comprendre l’état d’une réponse.
- La mascotte ne doit pas déclencher de bruit strident ou de surprise sonore effrayante.
- L’application ne doit pas déclencher une vibration ou une lecture automatique intrusive sans préférence claire.

## 16. Accessibilité, compatibilité et performance

### Accessibilité

- Tout le parcours doit être utilisable sans audio.
- Les contenus vocaux doivent avoir une alternative textuelle.
- Les contrôles doivent avoir un nom accessible et un état annoncé.
- Les cartes de parcours doivent exposer leur état verrouillé ou terminé au lecteur d’écran.
- Les animations doivent respecter la préférence `prefers-reduced-motion`.
- Les exercices de memory, glisser-déposer ou association doivent disposer d’une alternative par sélection tactile ou clavier.
- La taille du texte ne doit pas empêcher l’exercice lorsque le zoom est augmenté.

### Compatibilité cible

Tester au minimum sur :

- Safari iOS et iPadOS récents ;
- Chrome Android récent ;
- Safari macOS récent pour les essais parentaux ;
- Chrome ou Edge de bureau pour le contrôle de secours.

Le comportement de la synthèse vocale doit être vérifié sur chaque famille de navigateur, notamment la sélection de la voix anglaise et l’arrêt d’une lecture en navigation.

### Performance

- Premier affichage rapide sur réseau mobile courant.
- Illustrations compressées et adaptées à la densité d’écran.
- Pas de bibliothèque lourde pour une interaction réalisable en CSS ou TypeScript simple.
- Transitions et feedbacks fluides sur un appareil d’entrée de gamme raisonnable.
- Écriture locale non bloquante pendant un exercice.
- Absence d’erreur console dans les parcours principaux.

## 17. Erreurs, cas limites et reprise

Le produit doit définir un état utile dans les cas suivants :

- première ouverture sans profil actif ;
- stockage refusé ou indisponible ;
- donnée locale partiellement corrompue ;
- leçon supprimée ou renommée dans une nouvelle version de contenu ;
- lien vers une unité ou une leçon inconnue ;
- voix anglaise absente ;
- lecture interrompue ou bouton écouter pressé plusieurs fois ;
- fermeture du navigateur au milieu d’une leçon ;
- retour arrière pendant la validation d’une réponse ;
- double clic sur le bouton de validation ;
- changement de profil pendant une leçon ;
- réinitialisation accidentelle ou annulation de la confirmation ;
- mise à jour PWA alors qu’une leçon est en cours.

Dans chaque cas, l’enfant doit conserver autant que possible sa progression valide et recevoir une action simple : réessayer, continuer, revenir à l’unité ou consulter les paramètres.

## 18. Espace parental : indicateurs et limites

La vue parentale doit privilégier des signaux actionnables :

- leçons terminées récemment ;
- thèmes étudiés ;
- notions ou types d’exercices générant le plus d’erreurs ;
- unités disponibles et verrouillées ;
- régularité facultative, sans classement ni jugement.

Les « erreurs fréquentes » doivent être agrégées de manière compréhensible, par exemple « les couleurs » ou « les questions avec Do you like…? », plutôt qu’une liste technique d’identifiants. Une erreur isolée ne doit pas être présentée comme une faiblesse durable.

L’espace parental peut modifier la disponibilité locale des unités, mais ne doit pas modifier les fichiers pédagogiques ni donner l’impression de créer une nouvelle leçon depuis l’interface.

## 19. Critères d’acceptation fonctionnels

### Profils et données

- Les deux cartes Gabriel et Luca sont accessibles au premier lancement.
- Chaque profil possède des XP, niveaux, badges, leçons et préférences séparés.
- Changer de profil ne mélange ni la progression ni les réglages sonores.
- Fermer puis rouvrir l’application conserve la progression locale.
- La réinitialisation d’un profil demande une confirmation et ne supprime pas l’autre profil.

### Parcours et leçons

- Une unité contient plusieurs leçons et indique clairement leur état.
- Une leçon dure environ cinq minutes et alterne plusieurs interactions.
- Une leçon suit la boucle découverte, écoute, contexte, reconnaissance, réutilisation, correction, révision et consolidation ultérieure.
- Une leçon introduit au maximum trois notions nouvelles et réactive des notions antérieures.
- Les leçons terminées peuvent être rejouées.
- Les leçons suivantes se déverrouillent selon leurs prérequis.
- Une erreur ne bloque pas durablement l’enfant.
- La fin de leçon attribue une récompense une seule fois par complétion.

### Moteur pédagogique et gamification

- La première complétion d’un exercice rapporte 5 XP et une réponse correcte dès la première soumission rapporte 2 XP supplémentaires.
- La fin d’une leçon rapporte 20 XP une seule fois et la fin d’une unité rapporte 50 XP une seule fois.
- Le rejeu rapporte au maximum 5 XP par leçon et par jour local, sans bonus de leçon ni d’unité.
- Les niveaux suivent les seuils centralisés prévus et aucune erreur ne fait perdre d’XP.
- Les badges initiaux sont attribués une seule fois et leurs conditions sont déclaratives.
- Une récompense n’est jamais dupliquée après un rechargement, une navigation arrière ou une réouverture de l’écran de fin.
- Les erreurs fréquentes déclenchent une consolidation variée sans répétition mécanique ni blocage.

### Contenu et compatibilité

- Les éléments pédagogiques proviennent de fichiers de contenu locaux, pas des composants d’interface.
- Une leçon peut être ajoutée sans modifier les composants principaux lorsqu’elle utilise des types d’exercices existants.
- Les fichiers sont contrôlés par schéma, références stables, version de contenu et tests de cohérence.
- Une référence invalide ou un asset manquant empêche la publication du contenu concerné.
- Une évolution du contenu conserve les progressions compatibles ou affiche un état archivé compréhensible.
- La génération future assistée par IA reste extérieure à l’application et soumise à validation automatique puis relecture humaine.

### Exercices et voix

- Les onze types d’exercices du périmètre sont représentables par le modèle de contenu.
- Chaque réponse affiche un feedback immédiat et une correction compréhensible.
- Un mot ou une phrase peut être écouté et réécouté lorsque la synthèse vocale est disponible.
- L’application reste navigable et compréhensible lorsque la voix est indisponible ou désactivée.

### PWA et confidentialité

- L’application possède les éléments nécessaires à son ajout à l’écran d’accueil.
- Après chargement initial, le parcours et les leçons restent utilisables hors ligne.
- Aucun compte, paiement, backend, appel métier distant ou service payant obligatoire n’est requis.
- Les données de progression sont lisibles et modifiables uniquement dans le stockage local du navigateur par l’application.

### Qualité d’usage

- Les écrans principaux sont utilisables en portrait sur un mobile courant.
- Les contrôles importants sont tactiles, visibles et suffisamment grands.
- Les états ne reposent pas uniquement sur la couleur ou le son.
- Les thèmes Gabriel et Luca sont différenciés sans rendre l’univers de Luca effrayant.
- Les écrans utilisent des tokens sémantiques et des composants partagés ; aucune couleur ou typographie de thème n’est codée directement dans un écran métier.
- Le même moteur et les mêmes composants fonctionnent avec les deux thèmes.
- Le changement futur de thème conserve la progression du profil.

## 20. Plan de validation recommandé

### Validation du contenu

- Relecture anglaise et française de chaque leçon.
- Vérification du caractère courant des mots et expressions.
- Vérification de la durée et de l’alternance des exercices.
- Test de chaque texte vocal avec une voix anglaise.
- Validation du schéma, des identifiants, des références, des prérequis et des assets.
- Vérification de la boucle découverte–écoute–contexte–reconnaissance–réutilisation–révision.
- Vérification du nombre de notions nouvelles et de la présence de notions anciennes à réviser.
- Test d’une leçon ajoutée uniquement par les données, sans modification des composants principaux.

### Validation fonctionnelle

- Parcours complet pour Gabriel, puis pour Luca.
- Réponse correcte, réponse incorrecte, indice et réécoute.
- Reprise après fermeture pendant une leçon.
- Rejeu d’une leçon terminée.
- Déverrouillage et verrouillage des unités.
- Obtention de XP, niveau et badge.
- Vérification des gains de première complétion, du plafond de rejeu et de l’absence de perte d’XP.
- Vérification qu’un feedback d’erreur influence la consolidation sans bloquer la leçon.
- Réinitialisation confirmée puis annulation de réinitialisation.
- Changement de profil à chaque écran sensible.
- Vérification qu’un changement de thème conserve la progression du profil.

### Validation technique

- Installation PWA sur iOS/iPadOS et Android lorsque supportée.
- Parcours hors ligne après mise en cache initiale.
- Migration d’une structure IndexedDB fictivement ancienne.
- Comportement avec stockage refusé, voix absente et animations réduites.
- Test responsive sur petit mobile, grande tablette et écran de bureau.
- Vérification de l’absence de requêtes applicatives vers un backend.
- Vérification des tokens sémantiques, des états de composants et de la réduction des animations.
- Test des activités légères du MVP avec le même moteur de progression.

## 21. Découpage de livraison

L’ordre privilégie une première tranche verticale jouable afin de valider rapidement la boucle pédagogique, le rendu mobile et la persistance avant de produire tout le curriculum.

### Lot 1 — contrat produit et contenu

- Centraliser les règles d’XP, niveaux, badges, rejeu, consolidation et déverrouillage.
- Définir les schémas de contenu, les identifiants, les versions et la validation.
- Définir le modèle profil–thème–progression–préférences.
- Définir les tokens sémantiques et les composants partagés attendus.

### Lot 2 — première tranche verticale

- Construire un parcours minimal avec un profil et un thème.
- Afficher accueil, carte, unité, lancement, exercice, feedback et fin de leçon.
- Faire fonctionner une leçon complète de cinq minutes avec la boucle pédagogique.
- Persister une leçon interrompue, une réponse, une erreur et une complétion.
- Vérifier le rendu mobile portrait avant d’étendre le contenu.

### Lot 3 — moteur complet d’apprentissage

- Ajouter les onze types d’exercices du périmètre.
- Ajouter la synthèse vocale, les préférences sonores et le fallback silencieux.
- Ajouter la correction, la consolidation, la révision et les erreurs fréquentes.
- Permettre le rejeu et vérifier le plafond d’XP.

### Lot 4 — progression, thèmes et PWA

- Ajouter XP, niveaux, badges, déverrouillage et récompenses idempotentes.
- Ajouter le thème Luca sur les mêmes écrans et composants que Gabriel.
- Ajouter la compatibilité future profil–thème sans exposer nécessairement le sélecteur dans le MVP.
- Ajouter manifest, service worker, cache hors ligne et gestion des mises à jour de contenu.

### Lot 5 — accompagnement parent et qualité

- Espace parental local.
- Erreurs fréquentes et contrôle des unités disponibles.
- Réinitialisation confirmée.
- Tests d’accessibilité, appareils cibles et cas limites.

### Lot 6 — expansion du contenu

- Étendre les unités et les leçons par ajout de données validées.
- Revoir le contenu avec un adulte compétent en anglais.
- Tester les durées, la compréhension, la variété et la consolidation auprès de Gabriel et Luca.

Les mini-jeux ambitieux restent hors de cette séquence MVP et ne sont planifiés qu’après observation de l’usage réel.

## 22. Mini-jeux et évolutions

### 22.1 Activités ludiques du MVP

Le MVP conserve uniquement les activités légères déjà compatibles avec le moteur pédagogique :

- memory de vocabulaire ;
- quiz rapide ;
- remise en ordre ;
- mini-dialogues ;
- petites révisions ludiques.

Ces activités réutilisent les notions du parcours, s’inscrivent dans la boucle pédagogique et restent adaptées à une séance d’environ cinq minutes. Elles ne créent pas de seconde progression ni de règles d’XP différentes.

### 22.2 Expériences post-MVP

Les expériences plus ambitieuses sont reportées après validation de la boucle principale :

- course du capybara ;
- exploration du manoir ;
- défi avec la mascotte ;
- collection d’objets ;
- décoration d’un lieu ;
- puzzle plus complexe.

Ces mini-jeux futurs devront réutiliser le vocabulaire, les phrases, la progression et les récompenses existantes. Ils ne doivent créer ni second moteur pédagogique ni seconde économie de récompenses. Chaque nouveau jeu devra démontrer son objectif pédagogique, sa durée, son accessibilité, son mode silencieux et son absence de pression avant d’être ajouté.

### 22.3 Autres évolutions possibles

- Ajouter des unités et leçons via de nouveaux fichiers de contenu.
- Proposer une révision adaptative des erreurs fréquentes.
- Ajouter des enregistrements audio humains optionnels si un besoin de qualité apparaît.
- Ajouter un mode parent plus détaillé, toujours local.
- Ajouter la reconnaissance vocale uniquement après validation des enjeux de confidentialité, de compatibilité et de précision.
- Ajouter une sauvegarde exportable manuelle, clairement contrôlée par le parent, sans synchronisation automatique.
- Ajouter davantage de variantes de dialogues et de jeux de révision.

## 23. Décisions et points de vigilance

### Décisions proposées

- **Vision produit :** anglais utile du quotidien, séances courtes, réussite, curiosité, répétition et personnalisation sans pression.
- **Anti-objectifs :** pas de clone, compétition, vies obligatoires, perte d’XP, contenu aléatoire ou dépendance à une IA en ligne.
- **Boucle pédagogique :** découverte, écoute, contexte, reconnaissance, réutilisation, correction, révision et consolidation ultérieure.
- **Nouveautés par leçon :** 1 à 2 notions nouvelles recommandées, 3 au maximum, avec 4 à 8 éléments lexicaux associés.
- **XP initiale :** 5 XP par exercice à la première complétion, +2 XP pour une première réponse correcte, +20 XP en fin de leçon, +50 XP en fin d’unité.
- **Rejeu :** 1 XP par exercice rejoué, plafonné à 5 XP par leçon et par jour local, sans bonus de leçon ou d’unité.
- **Niveaux :** seuils initiaux espacés de 100 XP cumulés, centralisés et ajustables après observation.
- **Erreurs :** aucune perte d’XP, aucune vie obligatoire, aucun blocage ; les erreurs alimentent uniquement la consolidation.
- **Contenu :** données JSON ou équivalent structuré, schémas validés, références stables et aucun élément pédagogique en dur dans les composants.
- **IA future :** compatible avec la génération assistée, mais aucun appel IA dans l’application et validation humaine obligatoire.
- **Stockage principal :** IndexedDB ; `localStorage` limité aux petits états non critiques.
- **Déploiement :** export statique Next.js compatible PWA.
- **Voix :** Web Speech API, avec mode silencieux complet en fallback.
- **Progression :** locale, séparée par profil, sans perte d’XP en cas d’erreur.
- **Thèmes :** Gabriel et Luca partagent les mêmes écrans, composants, navigation, moteur et modèles de données.
- **Profil et thème :** le profil actif, le thème, la progression et les préférences sont séparés ; changer de thème conserve la progression.
- **Design system :** tokens sémantiques et composants partagés, sans valeurs de thème codées dans les écrans métier.
- **Mini-jeux MVP :** memory, quiz rapide, remise en ordre, mini-dialogues et révisions légères uniquement.
- **Mini-jeux ambitieux :** reportés après le MVP et réutilisant le moteur existant.
- **Documentation :** cahier des charges principal unique conservé pendant la conception.
- **Référence visuelle :** direction d’ambiance et d’ergonomie, sans reproduction pixel par pixel et sans génération d’asset à ce stade.

### Points à confirmer avant implémentation

- Âge exact et niveau actuel de Gabriel et Luca pour calibrer le vocabulaire et la longueur des consignes.
- Nombre de leçons à fournir dans chaque unité du premier parcours.
- Validation finale des valeurs d’XP et des seuils après un premier essai de durée et de rythme.
- Liste initiale des badges, illustrations et assets réellement disponibles.
- Prénom éventuel de la mascotte fantôme de Luca.
- Validation du maintien ou du remplacement futur du thème « Manoir mystérieux » selon l’adhésion de Luca.
- Politique de sauvegarde manuelle éventuelle en cas de changement ou de nettoyage d’appareil.
- Appareils prioritaires pour les essais de synthèse vocale.

## 24. Définition de terminé pour le MVP

Le MVP est considéré comme terminé lorsque :

- les deux profils disposent d’un parcours jouable de bout en bout ;
- les contenus sont séparés du moteur et les onze types d’exercices sont couverts ;
- une leçon de cinq minutes peut être commencée, interrompue, reprise, terminée et rejouée ;
- les réponses, erreurs, XP, niveaux, badges et déverrouillages sont persistés séparément pour chaque enfant ;
- la synthèse vocale est disponible avec un fallback silencieux robuste ;
- l’application est installable comme PWA et utilisable hors ligne après sa première mise en cache ;
- l’espace parental permet de consulter, limiter les unités, régler les sons et réinitialiser avec confirmation ;
- les écrans sont utilisables sur mobile et tablette, avec une accessibilité de base vérifiée ;
- aucune dépendance à un compte, un serveur ou un service payant obligatoire n’existe ;
- les tests fonctionnels, responsive, hors ligne et de stockage local passent sur les navigateurs cibles.
