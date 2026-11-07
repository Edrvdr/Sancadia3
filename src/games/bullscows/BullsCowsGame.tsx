import { useMemo, useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import GameOverDialog from '@/components/GameOverDialog';
import { generateSecret, getValidationError, scoreGuess } from '@/engine/codebreaker/core';
import type { ScoreFeedback } from '@/engine/codebreaker/types';
import { bullsCowsConfigs, type BullsCowsDifficulty } from '@/games/bullscows/config';

const digits = Array.from({ length: 10 }, (_, index) => index);

type HistoryEntry = { guess: number[]; feedback: ScoreFeedback };

export default function BullsCowsGame() {
  const [difficulty, setDifficulty] = useState<BullsCowsDifficulty>('beginner');
  const [secret, setSecret] = useState<number[]>(() =>
    generateSecret(
      {
        symbols: 10,
        length: bullsCowsConfigs.beginner.length,
        allowRepeats: false,
        maxAttempts: bullsCowsConfigs.beginner.maxAttempts,
      },
      Math.random,
    ),
  );
  const [guess, setGuess] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [message, setMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [outcome, setOutcome] = useState<'win' | 'lose'>('win');
  const [hintsUsed, setHintsUsed] = useState(0);

  const config = bullsCowsConfigs[difficulty];
  const remainingHints = Math.max(0, config.hints - hintsUsed);
  const sortedHistory = useMemo(() => history, [history]);

  const restart = () => {
    setSecret(
      generateSecret(
        {
          symbols: 10,
          length: config.length,
          allowRepeats: false,
          maxAttempts: config.maxAttempts,
        },
        Math.random,
      ),
    );
    setGuess([]);
    setHistory([]);
    setMessage('');
    setShowDialog(false);
    setHintsUsed(0);
  };

  const appendDigit = (digit: number) => {
    if (guess.length >= config.length) return;
    setGuess((current) => [...current, digit]);
  };

  const removeDigit = () => setGuess((current) => current.slice(0, -1));

  const submitGuess = () => {
    const error = getValidationError(
      { symbols: 10, length: config.length, allowRepeats: false, maxAttempts: config.maxAttempts },
      guess,
    );
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

    if (won || lost) {
      setOutcome(won ? 'win' : 'lose');
      setMessage(won ? 'You solved the code!' : 'No more attempts remaining.');
      setShowDialog(true);
      return;
    }

    setMessage(`Bulls: ${feedback.exact} | Cows: ${feedback.misplaced}`);
  };

  const useHint = () => {
    if (hintsUsed >= config.hints) {
      setMessage('No hints remaining.');
      return;
    }
    const position = history.length % config.length;
    const value = secret[position] ?? 0;
    setGuess((current) => {
      const next = [...current];
      next[position] = value;
      return next;
    });
    setHintsUsed((count) => count + 1);
    setMessage(`Hint: digit ${position + 1} is ${value}.`);
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
                const value = event.target.value as BullsCowsDifficulty;
                setDifficulty(value);
                restart();
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="professional">Professional</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <span className="text-sm text-subtle">Hints: {remainingHints}</span>
        </div>

        <div className="mb-4 flex items-center justify-center gap-2">
          {Array.from({ length: config.length }, (_, index) => (
            <button
              key={`digit-slot-${index}`}
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-lg font-bold text-primary"
              aria-label={`Digit ${index + 1} ${guess[index] ?? 'empty'}`}
            >
              {guess[index] ?? '·'}
            </button>
          ))}
        </div>

        <div className="mb-3 grid grid-cols-5 gap-2">
          {digits.map((digit) => (
            <Button key={digit} variant="secondary" onClick={() => appendDigit(digit)}>
              {digit}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button onClick={submitGuess}>Submit</Button>
          <Button variant="secondary" onClick={removeDigit}>
            Backspace
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
        {sortedHistory.length === 0 ? (
          <p className="text-sm text-subtle">No guess history yet.</p>
        ) : (
          <div className="space-y-2">
            {sortedHistory.map((entry, index) => (
              <div
                key={`${entry.guess.join('-')}-${index}`}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span>{entry.guess.join(' ')}</span>
                <span>
                  Bulls: {entry.feedback.exact} / Cows: {entry.feedback.misplaced}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <GameOverDialog
        open={showDialog}
        outcome={outcome}
        headline={outcome === 'win' ? 'You solved it!' : 'Hidden number revealed'}
        message={
          outcome === 'win'
            ? `You cracked the ${config.length}-digit number.`
            : `The answer was ${secret.join('')}.`
        }
        onPlayAgain={restart}
        onBackToMenu={() => setShowDialog(false)}
        onClose={() => setShowDialog(false)}
      />
    </div>
  );
}
