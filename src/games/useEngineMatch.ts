import { useCallback, useEffect, useState } from 'react';
import type { Difficulty } from '@/engine/difficulty';
import type { GameEngine, Player } from '@/engine/types';
import { useSettings } from '@/hooks/useSettings';
import type { MatchConfig } from '@/games/matchConfig';
import { NO_SCORES, type MatchScores } from '@/games/matchOutcome';
import { HAPTICS, vibrate } from '@/lib/haptics';

interface EngineMatchOptions<State, Move> {
  engine: GameEngine<State, Move>;
  config: MatchConfig;
  chooseMove: (state: State, difficulty: Difficulty) => Move | null;
}

export function useEngineMatch<State, Move>({ engine, config, chooseMove }: EngineMatchOptions<State, Move>) {
  const { settings } = useSettings();
  const vibrationEnabled = settings.vibrationEnabled;

  const humanSide: Player = config.mode === 'computer' && !config.humanFirst ? 1 : 0;
  const computerSide: Player | null = config.mode === 'computer' ? (humanSide === 0 ? 1 : 0) : null;
  const difficulty = config.mode === 'computer' ? config.difficulty : null;

  const [state, setState] = useState<State>(() => engine.initialState());
  const [scores, setScores] = useState<MatchScores>(NO_SCORES);
  const [dialogOpen, setDialogOpen] = useState(false);

  const result = engine.winner(state);
  const over = result !== null;
  const turn = engine.currentPlayer(state);
  const computerTurn = computerSide !== null && !over && turn === computerSide;

  const commit = useCallback(
    (next: State) => {
      setState(next);
      vibrate(vibrationEnabled, HAPTICS.move);
      const finished = engine.winner(next);
      if (finished === null) return;
      setScores((prev) =>
        finished === 'draw' ? { ...prev, draws: prev.draws + 1 } : { ...prev, [finished]: prev[finished] + 1 }
      );
      vibrate(vibrationEnabled, HAPTICS.gameEnd);
      setDialogOpen(true);
    },
    [engine, vibrationEnabled]
  );

  useEffect(() => {
    if (!computerTurn || difficulty === null) return;
    const timer = window.setTimeout(
      () => {
        const move = chooseMove(state, difficulty);
        if (move !== null) commit(engine.applyMove(state, move));
      },
      400 + Math.random() * 400
    );
    return () => window.clearTimeout(timer);
  }, [chooseMove, commit, computerTurn, difficulty, engine, state]);

  useEffect(() => {
    if (over || !engine.passTurn || engine.legalMoves(state).length > 0) return;
    commit(engine.passTurn(state));
  }, [commit, engine, over, state]);

  const playMove = (move: Move) => {
    if (computerTurn || over) return;
    const legal = engine.legalMoves(state);
    if (!legal.some((candidate) => engine.movesEqual?.(candidate, move) ?? Object.is(candidate, move))) return;
    commit(engine.applyMove(state, move));
  };

  const restart = () => {
    setState(engine.initialState());
    setDialogOpen(false);
  };

  return {
    state,
    result,
    over,
    turn,
    humanSide,
    computerTurn,
    scores,
    dialogOpen,
    closeDialog: () => setDialogOpen(false),
    playMove,
    restart,
  };
}
