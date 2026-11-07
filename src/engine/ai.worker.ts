import type { Difficulty } from '@/engine/difficulty';
import { aiRegistry, type WorkerGameId } from '@/games/aiRegistry';

interface WorkerRequest {
  requestId: number;
  gameId: WorkerGameId;
  state: unknown;
  difficulty: Difficulty;
}

interface WorkerResponse {
  requestId: number;
  move?: unknown;
  error?: string;
}

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const { requestId, gameId, state, difficulty } = event.data;
  let response: WorkerResponse;

  try {
    const entry = aiRegistry[gameId];
    if (!entry || !entry.validateState(state)) throw new Error(`Invalid game state for ${gameId}`);
    const move = entry.findMove(state, difficulty);
    if (move !== null && !entry.isLegalMove(state, move)) {
      throw new Error(`AI returned an illegal move for ${gameId}`);
    }
    response = { requestId, move };
  } catch (error) {
    response = {
      requestId,
      error: error instanceof Error ? error.message : 'AI worker failed.',
    };
  }

  self.postMessage(response);
});
