import { useMemo, useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import GameOverDialog from '@/components/GameOverDialog';
import { generateSecret, getValidationError, scoreGuess } from '@/engine/codebreaker/core';
import type { ScoreFeedback } from '@/engine/codebreaker/types';
import { mastermindConfigs, type MastermindDifficulty } from '@/games/mastermind/config';

const palette = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

type HistoryEntry = { guess: number[]; feedback: ScoreFeedback };

export default function MastermindGame() {
  const [difficulty, setDifficulty] = useState<MastermindDifficulty>('beginner');
  const [showLetters, setShowLetters] = useState(true);
  const [secret, setSecret] = useState<number[]>(() =>
    generateSecret(mastermindConfigs.beginner, Math.random),
  );
  const [guess, setGuess] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [outcome, setOutcome] = useState<'win' | 'lose'>('win');
  const [hintsUsed, setHintsUsed] = useState(0);

  const config = mastermindConfigs[difficulty];
  const remainingHints = Math.max(0, config.hints - hintsUsed);

  const sortedHistory = useMemo(() => history, [history]);

  const restart = () => {
    setSecret(generateSecret(config, Math.random));
    setGuess([]);
    setHistory([]);
    setMessage('');
    setIsOpen(false);
    setHintsUsed(0);
  };

  const appendGuess = (value: number) => {
    if (guess.length >= config.length) return;
    setGuess((current) => [...current, value]);
  };

  const removeGuess = () => {
    setGuess((current) => current.slice(0, -1));
  };

  const submitGuess = () => {
    const error = getValidationError(config, guess);
    if (error) {
      setMessage(error);
      return;
    }

    const feedback = scoreGuess(secret, guess);
    const nextHistory = [...history, { guess: [...guess], feedback }];
    const won = feedback.exact === config.length;
    const lost = nextHistory.length >= config.maxAttempts;

    setHistory(nextHistory);
    setGuess([]);
    setMessage(
      won ? 'You cracked the code!' : lost ? 'The code was revealed below.' : 'Guess recorded.',
    );

    if (won || lost) {
      setOutcome(won ? 'win' : 'lose');
      setIsOpen(true);
    }
  };

  const useHint = () => {
    if (hintsUsed >= config.hints) {
      setMessage('No hints remaining.');
      return;
    }

    const revealIndex = Math.max(0, Math.min(secret.length - 1, history.length % secret.length));
    const revealValue = secret[revealIndex] ?? 0;
    setGuess((current) => {
      const next = [...current];
      while (next.length < revealIndex + 1) next.push(0);
      next[revealIndex] = revealValue;
      return next;
    });
    setHintsUsed((count) => count + 1);
    setMessage(
      `Hint: position ${revealIndex + 1} is ${palette[revealValue] ?? String(revealValue)}.`,
    );
  };

  const showSecretValue = (index: number) => {
    if (showLetters) return palette[index] ?? String(index);
    return index;
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-subtle">Difficulty</p>
            <select
              className="rounded border border-border bg-surface px-2 py-1 text-sm"
              value={difficulty}
              onChange={(event) => {
                const value = event.target.value as MastermindDifficulty;
                setDifficulty(value);
                restart();
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="professional">Professional</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-subtle">
            <input
              type="checkbox"
              checked={showLetters}
              onChange={() => setShowLetters((current) => !current)}
            />
            Letter labels
          </label>
        </div>

        <div className="mb-3 flex items-center justify-between text-sm text-subtle">
          <span>
            Attempts: {history.length}/{config.maxAttempts}
          </span>
          <span>Hints: {remainingHints}</span>
        </div>

        <div className="mb-4 flex items-center justify-center gap-2">
          {Array.from({ length: config.length }, (_, index) => (
            <button
              key={`slot-${index}`}
              type="button"
              aria-label={`Guess position ${index + 1}, ${guess[index] ?? 'empty'}`}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-lg font-bold text-primary"
            >
              {guess[index] !== undefined ? showSecretValue(guess[index] ?? 0) : '·'}
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {Array.from({ length: config.symbols }, (_, symbol) => (
            <Button key={symbol} variant="secondary" onClick={() => appendGuess(symbol)}>
              {showSecretValue(symbol)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={submitGuess}>Submit</Button>
          <Button variant="secondary" onClick={removeGuess}>
            Undo
          </Button>
          <Button variant="secondary" onClick={useHint}>
            Hint
          </Button>
          <Button variant="secondary" onClick={restart}>
            Restart
          </Button>
        </div>

        {message && <p className="mt-3 text-sm text-subtle">{message}</p>}
      </Card>

      <Card className="p-4">
        <h3 className="mb-2 text-lg font-bold text-primary">History</h3>
        <div className="space-y-2">
          {sortedHistory.length === 0 ? (
            <p className="text-sm text-subtle">No guesses yet.</p>
          ) : (
            sortedHistory.map((entry, index) => (
              <div key={`${entry.guess.join('-')}-${index}`} className="flex items-center gap-3">
                <div className="flex gap-1">
                  {entry.guess.map((value, position) => (
                    <span
                      key={`${value}-${position}`}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-xs font-bold"
                    >
                      {showSecretValue(value)}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: config.length }, (_, position) => {
                    const isExact = position < entry.feedback.exact;
                    const isMisplaced =
                      !isExact && position < entry.feedback.exact + entry.feedback.misplaced;
                    return (
                      <span
                        key={`feedback-${index}-${position}`}
                        className={`h-3 w-3 rounded-full border ${
                          isExact
                            ? 'border-primary bg-primary'
                            : isMisplaced
                              ? 'border-warning bg-warning'
                              : 'border-border bg-transparent'
                        }`}
                        aria-label={
                          isExact ? 'exact match' : isMisplaced ? 'misplaced match' : 'no match'
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <GameOverDialog
        open={isOpen}
        outcome={outcome}
        headline={outcome === 'win' ? 'Code cracked' : 'Secret revealed'}
        message={
          outcome === 'win'
            ? `You solved it in ${history.length} attempts.`
            : `The hidden code was ${secret.map((value) => palette[value] ?? value).join(' ')}`
        }
        onPlayAgain={restart}
        onBackToMenu={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
