# Correction éditoriale — scènes, production et lecture précoce

**Date :** 7 août 2026
**Statut :** implémenté sur les 23 leçons publiées — validation mobile réelle restante
**Périmètre :** unités et leçons du parcours fondamental

## Décision appliquée

Le contenu peut continuer à être enrichi jusqu’à 20 unités avec trois exigences désormais intégrées au contrat et au rendu :

1. chaque leçon possède une mini-scène complète ;
2. chaque unité se termine par une mission où l’enfant construit une réponse ;
3. la lecture, l’écoute et un fil de rythme/intonation commencent dès `hello-01`.

Cette note décrit le contrat éditorial livré. Les types TypeScript, le validateur, le rendu des scènes et les tests sont en place ; le moteur de progression reste volontairement indépendant du texte narratif et déduit la résolution de la réussite de l’exercice référencé.

## Corrections de séquençage réalisées

Les données publiées ont été réalignées pour qu’un débutant ne rencontre pas de notion nouvelle trop tôt dans les choix ou les activités :

- `name` est déclaré dans `hello-01` ; `hello-02` introduit ensuite `How are you?` et `I’m good.` comme paire question-réponse.
- `good morning` est maintenant réellement présentée dans `hello-02`, après les salutations et le prénom de `hello-01`.
- `eat` reste réservé à `food-03` ; la première activité de `food-01` construit une phrase déjà accessible.
- `school` est introduit dans `school-play-01`, avant son réemploi dans la routine.
- `pizza` arrive dans `likes-01`, `don’t like` dans `likes-02`, puis `No, I don’t`, `music` et `dinosaur` dans `likes-03`.
- `sleep` n’est plus utilisé comme distracteur avant `day-03`.
- `listen` a été retiré de cette première séquence car il n’était pas nécessaire au palier actuel ; `teacher`, `open` et `look` sont séquencés explicitement dans l’unité école.

Un audit manuel des 23 leçons confirme que les concepts, cartes et options vocabulaire apparaissent après leur déclaration de leçon ou d’une leçon précédente.

## Mini-scène obligatoire par leçon

Une scène ne doit plus être portée uniquement par un prompt d’ambiance comme « The snack is making a funny noise! ». Le contrat livré prend cette forme :

```ts
type StoryScene = {
  id: string;
  situation: string;
  setup: Array<{ speaker?: string; text: string }>;
  childAction: {
    instruction: string;
    exerciseId: string;
    purpose: "choose" | "construct" | "respond";
  };
  resolution: Array<{ speaker?: string; text: string }>;
  nextHook?: string;
};

type ReadingCheckpoint = {
  mode: "word-recognition" | "phrase-recognition" | "audio-to-text" | "word-order";
  instruction: string;
  text: string;
  audioText: string;
  phonologyFocus: "greeting-rhythm" | "question-intonation" | "word-stress" | "phrase-rhythm";
};
```

Le déroulé attendu est :

1. **Situation :** un objet, un personnage ou un problème concret apparaît.
2. **Dialogue :** les personnages parlent brièvement et font entendre la structure ciblée.
3. **Action de l’enfant :** la réponse choisie ou construite modifie la scène.
4. **Résolution :** l’objet est retrouvé, le personnage réagit, la porte s’ouvre ou la mission progresse.

La scène doit rester courte, drôle et compréhensible sans traduction intégrale. Le texte anglais porte l’objectif ; le français aide seulement à sécuriser le sens.

## Mission de production en fin d’unité

La dernière leçon de chaque unité doit se conclure par une mission de réponse construite. Les premières versions peuvent rester guidées :

- remise en ordre de mots pour former une phrase ;
- sélection de plusieurs morceaux pour répondre dans un dialogue ;
- phrase à compléter dans une image ;
- choix d’une réponse parmi des variantes plausibles.

L’objectif est que l’enfant fasse quelque chose avec la langue : se présenter, commander, dire ce qu’il aime, décrire une image, localiser un objet ou raconter une routine. Une activité de memory peut suivre pour consolider, mais elle ne doit pas remplacer la mission finale.

Le champ de marquage `responseMode: "guided-production"` et `isUnitMission: true` est utilisé dans la dernière leçon de chacune des huit unités publiées. Le validateur impose une seule mission par unité, sur la dernière leçon, avec un type d’exercice réellement productif.

## Lecture, rythme et phonologie dès le début

À partir de `hello-01`, chaque leçon doit proposer au moins un lien entre son et écrit :

- reconnaître le mot ou la phrase entendue parmi des textes visibles ;
- associer un audio à une phrase ;
- remettre dans l’ordre des mots que l’enfant vient d’entendre ;
- repérer le mot accentué ou le rythme d’une courte formule ;
- entendre l’intonation montante d’une question comme `What’s your name?` ou `How are you?`.

Il ne s’agit pas d’un cours de phonétique ni d’une notation de prononciation. Le fil doit être régulier, ludique et réutilisé dans les scènes. Les métadonnées `readingCheckpoint.mode` et `readingCheckpoint.phonologyFocus` précisent ce fil sans ajouter de nouvelle difficulté grammaticale.

## Validation de la première implémentation

La première tranche implémentée respecte les points suivants :

- le format en quatre temps de la mini-scène ;
- le fait que l’action de l’enfant doit avoir un effet sur la résolution ;
- la mission de production en fin d’unité ;
- le niveau de guidage acceptable pour un enfant débutant ;
- le démarrage de la lecture et du rythme dès la première unité.

Le contrat JSON, les types, le validateur, le rendu et les tests automatisés sont en place. Aucun nouveau type d’exercice n’a été ajouté : les missions réutilisent les interactions existantes et le renderer générique affiche leur intention de production.

Le contrat est testé sur les 23 leçons et les huit missions d’unité ; lint, typage et tests passent. La suite est la validation de l’expérience sur appareil mobile réel et hors ligne, puis une relecture humaine de l’anglais, du français et de la difficulté.
