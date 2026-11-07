# Adding a game

Use this checklist when adding a game:

1. Create `src/games/<id>/rules.ts` with the state, move types and a pure `GameEngine` implementation.
   Do not import React, DOM APIs, components, screens or hooks.
2. Add `src/games/<id>/ai.ts` with an evaluator, difficulty caps and a `chooseMove` function.
3. Add `src/games/<id>/rules.test.ts` for wins, draws, illegal moves, immutability and special rules.
   Add focused AI tests when move selection has game-specific behavior.
4. Create `<Game>Match.tsx` using `useEngineMatch`, `GameBoard`, `Scoreboard` and `GameOverDialog`;
   create `<Game>Game.tsx` to share `MatchFlow` and its pre-game setup.
5. Register the game's component and display metadata in `src/games/registry.ts`.
6. Register its state validator, engine, evaluation and difficulty caps in `src/games/aiRegistry.ts`
   so computer moves run in the Web Worker.
7. Give interactive cells descriptive accessible labels, visible keyboard focus and status updates.
   Use symbols as well as color to distinguish players, and test at a 360px viewport.
8. Run `npm run check` and `npm run build`.
