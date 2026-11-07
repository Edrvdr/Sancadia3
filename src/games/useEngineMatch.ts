import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { Difficulty } from '@/engine/difficulty';
import { AIRequestCancelledError, requestMove } from '@/engine/aiClient';
import type { GameEngine, Player } from '@/engine/types';
import { useFeedback } from '@/hooks/useFeedback';
import { useStats } from '@/hooks/useStats';
import type { MatchConfig } from '@/games/matchConfig';
import { NO_SCORES, type MatchScores } from '@/games/matchOutcome';
import { isWorkerGameId } from '@/games/aiRegistry';

interface EngineMatchOptions<State, Move> {
  engine: GameEngine<State, Move>;
  config: MatchConfig;
  chooseMove: (state: State, difficulty: Difficulty) => Move | null;
}

export function useEngineMatch<State, Move>({ engine, config, chooseMove }: EngineMatchOptions<State, Move>) {
  const { place, win, lose, draw } = useFeedback();
  const { recordResult } = useStats();
  const matchInstance = useId();
  const matchNumber = useRef(0);
  const recordedMatch = useRef<string | null>(null);

  const humanSide: Player = config.mode === 'computer' && !config.humanFirst ? 1 : 0;
  const computerSide: Player | null = config.mode === 'computer' ? (humanSide === 0 ? 1 : 0) : null;
  const difficulty = config.mode === 'computer' ? config.difficulty : null;

  const [state, setState] = useState<State>(() => engine.initialState());
  const [scores, setScores] = useState<MatchScores>(NO_SCORES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  const result = engine.winner(state);
  const over = result !== null;
  const turn = engine.currentPlayer(state);
  const computerTurn = computerSide !== null && !over && turn === computerSide;

  const commit = useCallback(
    (next: State) => {
      setState(next);
      place();
      const finished = engine.winner(next);
      if (finished === null) return;
      setScores((prev) =>
        finished === 'draw' ? { ...prev, draws: prev.draws + 1 } : { ...prev, [finished]: prev[finished] + 1 }
      );
      if (finished === 'draw') draw();
      else if (config.mode === 'two-player' || finished === humanSide) win();
      else lose();
      setDialogOpen(true);
    },
    [config.mode, draw, engine, humanSide, lose, place, win]
  );

  useEffect(() => {
    if (result === null) return;
    const resultId = `${engine.id}:${matchInstance}:${matchNumber.current}`;
    if (recordedMatch.current === resultId) return;
    recordedMatch.current = resultId;

    const outcome = result === 'draw' ? 'draw' : result === humanSide ? 'win' : 'lose';
    setPointsEarned(
      recordResult({
        resultId,
        gameId: engine.id,
        mode: config.mode,
        ...(config.mode === 'computer' ? { difficulty: config.difficulty } : {}),
        outcome,
      })
    );
  }, [config, engine.id, humanSide, recordResult, result, matchInstance]);

  useEffect(() => {
    if (!computerTurn || difficulty === null) return;
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(
      () => {
        const search = isWorkerGameId(engine.id)
          ? requestMove<State, Move>(engine.id, state, difficulty, controller.signal)
          : Promise.resolve(chooseMove(state, difficulty));

        void search
          .then((move) => {
            if (!active || move === null) return;
            const legal = engine.legalMoves(state).some(
              (candidate) => engine.movesEqual?.(candidate, move) ?? Object.is(candidate, move)
            );
            if (!legal) throw new Error(`AI returned an illegal move for ${engine.id}`);
            commit(engine.applyMove(state, move));
          })
          .catch((error: unknown) => {
            if (!active || error instanceof AIRequestCancelledError) return;
            console.error(`Unable to select an AI move for ${engine.id}:`, error);
          });
      },
      400 + Math.random() * 400
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
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
    matchNumber.current++;
    setState(engine.initialState());
    setDialogOpen(false);
    setPointsEarned(0);
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
    pointsEarned,
    closeDialog: () => setDialogOpen(false),
    playMove,
    restart,
  };
}
