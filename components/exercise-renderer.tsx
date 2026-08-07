"use client";

import { useState } from "react";
import { CheckIcon, PlayIcon, VolumeIcon } from "@/components/icons";
import type {
  ChoiceOption,
  Exercise,
  ExerciseAnswer,
  MatchingExercise,
  MemoryExercise,
  ReorderExercise
} from "@/lib/content/types";

export type ExerciseResult = {
  answer: ExerciseAnswer;
  answerLabel?: string;
};

type ExerciseRendererProps = {
  exercise: Exercise;
  feedbackVisible: boolean;
  onSubmit: (result: ExerciseResult) => void;
  onError: (result: ExerciseResult) => void;
  onSpeak: (text: string) => boolean;
};

function AudioButton({ text, onSpeak }: { text: string; onSpeak: (text: string) => boolean }) {
  const [available, setAvailable] = useState(true);
  const handleSpeak = () => setAvailable(onSpeak(text));

  return (
    <button aria-label={`Écouter : ${text}`} className="audio-player" onClick={handleSpeak} type="button">
      <span className="audio-player__play"><PlayIcon aria-hidden="true" size={15} /></span>
      <span className="audio-player__copy"><strong>Écouter la phrase</strong><small>{available ? "Tu peux réécouter autant de fois que tu veux" : "La voix n’est pas disponible sur cet appareil"}</small></span>
      <span className="audio-player__wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
      <VolumeIcon aria-hidden="true" size={18} />
    </button>
  );
}

function ChoiceList({
  options,
  selectedId,
  disabled,
  onSelect
}: {
  options: ChoiceOption[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (option: ChoiceOption) => void;
}) {
  return (
    <div className="answer-list">
      {options.map((option) => {
        const selected = selectedId === option.id;
        return (
          <button
            aria-pressed={selected}
            className={`answer-option ${selected ? "answer-option--selected" : ""}`}
            disabled={disabled}
            key={option.id}
            onClick={() => onSelect(option)}
            type="button"
          >
            <span className="answer-option__radio">{selected ? <span /> : null}</span>
            {option.emoji ? <span className="answer-option__emoji" aria-hidden="true">{option.emoji}</span> : null}
            <span className="answer-option__copy"><strong>{option.label}</strong>{option.detail ? <small>{option.detail}</small> : null}</span>
          </button>
        );
      })}
    </div>
  );
}

type MatchingSubmission = Extract<ExerciseAnswer, { type: "matching" }>;
type MemorySubmission = Extract<ExerciseAnswer, { type: "memory" }>;

function MatchingBoard({ exercise, disabled, onComplete, onError }: { exercise: MatchingExercise; disabled: boolean; onComplete: (answer: MatchingSubmission) => void; onError: (answer: MatchingSubmission) => void }) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<MatchingSubmission["pairs"]>([]);
  const [mistake, setMistake] = useState(false);

  const handleRight = (pairId: string) => {
    if (!selectedLeft || matchedPairs.some((pair) => pair.rightId === pairId)) return;
    const selectedPair = { leftId: selectedLeft, rightId: pairId };
    if (selectedLeft === pairId) {
      const nextMatched = [...matchedPairs, selectedPair];
      setMatchedPairs(nextMatched);
      setSelectedLeft(null);
      if (nextMatched.length === exercise.pairs.length) onComplete({ type: "matching", pairs: nextMatched });
    } else {
      setMistake(true);
      setSelectedLeft(null);
      onError({ type: "matching", pairs: [...matchedPairs, selectedPair] });
      window.setTimeout(() => setMistake(false), 700);
    }
  };

  return (
    <div className="matching-board">
      <div className="matching-board__columns">
        <div className="matching-board__column">
          <span className="matching-board__label">Anglais</span>
          {exercise.pairs.map((pair) => (
            <button
              className={`matching-tile ${selectedLeft === pair.id ? "matching-tile--selected" : ""} ${matchedPairs.some((matchedPair) => matchedPair.leftId === pair.id) ? "matching-tile--matched" : ""}`}
              disabled={disabled || matchedPairs.some((matchedPair) => matchedPair.leftId === pair.id)}
              key={pair.id}
              onClick={() => setSelectedLeft(pair.id)}
              type="button"
            >{pair.left}</button>
          ))}
        </div>
        <div className="matching-board__column">
          <span className="matching-board__label">Français</span>
          {exercise.pairs.map((pair) => (
            <button
              className={`matching-tile ${matchedPairs.some((matchedPair) => matchedPair.rightId === pair.id) ? "matching-tile--matched" : ""}`}
              disabled={disabled || matchedPairs.some((matchedPair) => matchedPair.rightId === pair.id)}
              key={pair.id}
              onClick={() => handleRight(pair.id)}
              type="button"
            >{pair.right}</button>
          ))}
        </div>
      </div>
      {mistake ? <p className="exercise-inline-hint">Cette paire ne va pas ensemble. Essaie encore.</p> : null}
      <div className="matching-progress"><CheckIcon aria-hidden="true" size={14} /> {matchedPairs.length} / {exercise.pairs.length} paire{exercise.pairs.length > 1 ? "s" : ""}</div>
    </div>
  );
}

function ReorderBoard({ exercise, disabled, onReady }: { exercise: ReorderExercise; disabled: boolean; onReady: (tokens: string[], label: string) => void }) {
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const remainingTokens = exercise.tokens.filter((token, index) => selectedTokens.filter((selected) => selected === token).length < exercise.tokens.slice(0, index + 1).filter((candidate) => candidate === token).length);

  return (
    <div className="reorder-board">
      <div className="reorder-answer" aria-live="polite">
        {selectedTokens.length ? selectedTokens.map((token, index) => (
          <button className="reorder-token reorder-token--selected" disabled={disabled} key={`${token}-${index}`} onClick={() => setSelectedTokens((current) => current.filter((_, tokenIndex) => tokenIndex !== index))} type="button">{token}</button>
        )) : <span className="reorder-answer__placeholder">Ta phrase apparaîtra ici</span>}
      </div>
      <div className="reorder-tokens">
        {remainingTokens.map((token, index) => (
          <button className="reorder-token" disabled={disabled} key={`${token}-${index}`} onClick={() => setSelectedTokens((current) => [...current, token])} type="button">{token}</button>
        ))}
      </div>
      {selectedTokens.length === exercise.tokens.length ? <button className="reorder-check" disabled={disabled} onClick={() => onReady(selectedTokens, selectedTokens.join(" "))} type="button">Vérifier cette phrase</button> : null}
    </div>
  );
}

function MemoryBoard({ exercise, disabled, onComplete, onError }: { exercise: MemoryExercise; disabled: boolean; onComplete: (answer: MemorySubmission) => void; onError: (answer: MemorySubmission) => void }) {
  const [openCards, setOpenCards] = useState<string[]>([]);
  const [matchedCards, setMatchedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<MemorySubmission["pairs"]>([]);
  const [mistake, setMistake] = useState(false);

  const handleCardClick = (cardId: string) => {
    if (disabled || openCards.includes(cardId) || matchedCards.includes(cardId)) return;
    if (openCards.length === 0) {
      setOpenCards([cardId]);
      return;
    }
    const [firstId] = openCards;
    const first = exercise.cards.find((card) => card.id === firstId);
    const second = exercise.cards.find((card) => card.id === cardId);
    if (!first || !second) return;
    if (first.matchId === second.matchId) {
      const nextMatched = [...matchedCards, first.id, second.id];
      const nextPairs = [...matchedPairs, { firstId: first.id, secondId: second.id }];
      setMatchedCards(nextMatched);
      setMatchedPairs(nextPairs);
      setOpenCards([]);
      if (nextMatched.length === exercise.cards.length) onComplete({ type: "memory", pairs: nextPairs });
      return;
    }
    setOpenCards([...openCards, cardId]);
    setMistake(true);
    onError({ type: "memory", pairs: [...matchedPairs, { firstId: first.id, secondId: second.id }] });
    window.setTimeout(() => {
      setOpenCards([]);
      setMistake(false);
    }, 650);
  };

  return (
    <div className="memory-board">
      <div className="memory-grid">
        {exercise.cards.map((card) => {
          const visible = openCards.includes(card.id) || matchedCards.includes(card.id);
          return (
            <button
              aria-label={visible ? card.label : "Carte cachée"}
              className={`memory-card ${visible ? "memory-card--open" : ""} ${matchedCards.includes(card.id) ? "memory-card--matched" : ""}`}
              disabled={disabled || visible || openCards.length === 2}
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              type="button"
            >{visible ? <><span aria-hidden="true">{card.emoji}</span><strong>{card.label}</strong></> : <span aria-hidden="true">?</span>}</button>
          );
        })}
      </div>
      {mistake ? <p className="exercise-inline-hint">Pas la même paire cette fois. Regarde bien les mots.</p> : null}
      <div className="matching-progress"><CheckIcon aria-hidden="true" size={14} /> {matchedCards.length / 2} / {exercise.cards.length / 2} paire{exercise.cards.length > 2 ? "s" : ""}</div>
    </div>
  );
}

export function ExerciseRenderer({ exercise, feedbackVisible, onSubmit, onError, onSpeak }: ExerciseRendererProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [heard, setHeard] = useState(false);

  const handleSpeak = (text: string) => {
    const didSpeak = onSpeak(text);
    if (didSpeak) setHeard(true);
    return didSpeak;
  };

  const submitChoice = (option: ChoiceOption) => {
    setSelectedId(option.id);
    onSubmit({ answer: { type: "choice", optionId: option.id }, answerLabel: option.label });
  };

  const renderChoiceExercise = (options: ChoiceOption[]) => (
    <ChoiceList disabled={feedbackVisible} onSelect={submitChoice} options={options} selectedId={selectedId} />
  );

  if (exercise.type === "multiple-choice" || exercise.type === "guided-translation" || exercise.type === "listening-choice" || exercise.type === "sentence-completion" || exercise.type === "dialogue") {
    return (
      <div className="exercise-interaction">
        {exercise.type === "dialogue" ? <div className="dialogue-lines">{exercise.lines.map((line, index) => <div className={`dialogue-line ${index === exercise.lines.length - 1 ? "dialogue-line--active" : ""}`} key={`${line.speaker}-${index}`}><span>{line.speaker}</span><strong>{line.text}</strong></div>)}</div> : null}
        {exercise.type === "sentence-completion" ? <div className="sentence-prompt">{exercise.sentence}</div> : null}
        {exercise.audioText ? <AudioButton onSpeak={handleSpeak} text={exercise.audioText} /> : null}
        <div className="answer-block">
          <div className="answer-block__label"><span>{exercise.type === "dialogue" ? "Quelle réplique convient ?" : exercise.prompt}</span><span>Choisis une réponse</span></div>
          {renderChoiceExercise(exercise.options)}
        </div>
      </div>
    );
  }

  if (exercise.type === "true-false") {
    return (
      <div className="exercise-interaction">
        <div className="statement-card">{exercise.statement}</div>
        <div className="boolean-options">
          {([true, false] as const).map((value) => {
            const id = String(value);
            return <button aria-pressed={selectedId === id} className={`boolean-option ${selectedId === id ? "boolean-option--selected" : ""}`} disabled={feedbackVisible} key={id} onClick={() => { setSelectedId(id); onSubmit({ answer: { type: "boolean", value }, answerLabel: value ? "Vrai" : "Faux" }); }} type="button"><strong>{value ? "Vrai" : "Faux"}</strong><span>{value ? "C’est exact" : "Ce n’est pas exact"}</span></button>;
          })}
        </div>
      </div>
    );
  }

  if (exercise.type === "listening") {
    return (
      <div className="exercise-interaction">
        <AudioButton onSpeak={handleSpeak} text={exercise.audioText ?? exercise.prompt} />
        <button className={`listen-confirm ${heard ? "listen-confirm--ready" : ""}`} disabled={feedbackVisible || !heard} onClick={() => onSubmit({ answer: { type: "listening", listened: true }, answerLabel: exercise.answerLabel })} type="button"><CheckIcon aria-hidden="true" size={17} /> {exercise.answerLabel}</button>
        {!heard ? <p className="exercise-inline-hint">Appuie d’abord sur écouter, puis valide quand tu es prêt.</p> : null}
      </div>
    );
  }

  if (exercise.type === "english-french-matching" || exercise.type === "image-word-matching") {
    return <div className="exercise-interaction"><MatchingBoard disabled={feedbackVisible} exercise={exercise} onComplete={(answer) => onSubmit({ answer, answerLabel: "Toutes les paires" })} onError={(answer) => onError({ answer, answerLabel: "Paire incorrecte" })} /></div>;
  }

  if (exercise.type === "reorder") {
    return <div className="exercise-interaction"><ReorderBoard disabled={feedbackVisible} exercise={exercise} onReady={(tokens, answerLabel) => onSubmit({ answer: { type: "reorder", tokens }, answerLabel })} /></div>;
  }

  if (exercise.type === "memory") {
    return <div className="exercise-interaction"><MemoryBoard disabled={feedbackVisible} exercise={exercise} onComplete={(answer) => onSubmit({ answer, answerLabel: "Toutes les paires" })} onError={(answer) => onError({ answer, answerLabel: "Paire incorrecte" })} /></div>;
  }

  return null;
}
