import { useMemo, useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import GameOverDialog from '@/components/GameOverDialog';
import { beginnerWords, expertWords, professionalWords } from '@/games/hangman/words';
import { guessLetter, maskedWord, remainingLetters, status } from '@/games/hangman/rules';

type Difficulty = 'beginner' | 'professional' | 'expert';

const settings = {
  beginner: { maxWrong: 8, words: beginnerWords },
  professional: { maxWrong: 6, words: professionalWords },
  expert: { maxWrong: 5, words: expertWords },
};

function pickWord(difficulty: Difficulty) {
  const words = settings[difficulty].words;
  return words[Math.floor(Math.random() * words.length)] ?? 'planet';
}

export default function HangmanGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [word, setWord] = useState(() => pickWord('beginner'));
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [outcome, setOutcome] = useState<'win' | 'lose'>('win');

  const maxWrong = settings[difficulty].maxWrong;
  const wrongCount = guessedLetters.filter((letter) => !word.toLowerCase().includes(letter)).length;
  const state = useMemo(
    () => ({ word, guessedLetters, wrongCount, maxWrong }),
    [word, guessedLetters, wrongCount, maxWrong],
  );

  const mask = maskedWord(state);

  const restart = (nextDifficulty: Difficulty = difficulty) => {
    setWord(pickWord(nextDifficulty));
    setGuessedLetters([]);
    setShowDialog(false);
  };

  const chooseLetter = (letter: string) => {
    const next = guessLetter(state, letter);
    setGuessedLetters(next.guessedLetters);
    if (status(next) !== 'playing') {
      setOutcome(status(next) === 'won' ? 'win' : 'lose');
      setShowDialog(true);
    }
  };

  const letters = remainingLetters(state);

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <select
            className="rounded border border-border bg-surface px-2 py-1 text-sm"
            value={difficulty}
            onChange={(event) => {
              const nextDifficulty = event.target.value as Difficulty;
              setDifficulty(nextDifficulty);
              restart(nextDifficulty);
            }}
          >
            <option value="beginner">Beginner</option>
            <option value="professional">Professional</option>
            <option value="expert">Expert</option>
          </select>
          <span className="text-sm text-subtle">
            Wrong: {wrongCount}/{maxWrong}
          </span>
        </div>

        <svg viewBox="0 0 220 220" className="mx-auto mb-4 h-52 w-full max-w-[360px]">
          <g stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-primary">
            {wrongCount >= 1 && <line x1="30" y1="180" x2="180" y2="180" />}
            {wrongCount >= 2 && <line x1="50" y1="180" x2="50" y2="30" />}
            {wrongCount >= 3 && <line x1="50" y1="30" x2="130" y2="30" />}
            {wrongCount >= 4 && <line x1="130" y1="30" x2="130" y2="50" />}
            {wrongCount >= 5 && <circle cx="130" cy="70" r="20" />}
            {wrongCount >= 6 && <line x1="130" y1="90" x2="130" y2="130" />}
            {wrongCount >= 7 && <line x1="130" y1="100" x2="100" y2="120" />}
            {wrongCount >= 8 && <line x1="130" y1="100" x2="160" y2="120" />}
            {wrongCount >= 9 && <line x1="130" y1="130" x2="110" y2="165" />}
            {wrongCount >= 10 && <line x1="130" y1="130" x2="150" y2="165" />}
          </g>
        </svg>

        <div className="mb-4 text-center text-2xl font-bold tracking-[0.3em] text-primary">
          {mask}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {letters.map((letter) => (
            <Button key={letter} variant="secondary" onClick={() => chooseLetter(letter)}>
              {letter.toUpperCase()}
            </Button>
          ))}
        </div>
      </Card>

      <GameOverDialog
        open={showDialog}
        outcome={outcome}
        headline={outcome === 'win' ? 'You solved it!' : 'Word revealed'}
        message={outcome === 'win' ? `The word was ${word}.` : `The hidden word was ${word}.`}
        onPlayAgain={() => restart()}
        onBackToMenu={() => setShowDialog(false)}
        onClose={() => setShowDialog(false)}
      />
    </div>
  );
}
