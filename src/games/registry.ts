import type { ComponentType } from 'react';
import BullsCowsGame from '@/games/bullscows/BullsCowsGame';
import CheckersGame from '@/games/checkers/CheckersGame';
import Connect4Game from '@/games/connect4/Connect4Game';
import GomokuMatch from '@/games/gomoku/GomokuMatch';
import HangmanGame from '@/games/hangman/HangmanGame';
import MastermindGame from '@/games/mastermind/MastermindGame';
import ReversiGame from '@/games/reversi/ReversiGame';
import BattleshipsGame from '@/games/battleships/BattleshipsGame';
import TicTacToeGame from '@/games/tictactoe/TicTacToeGame';

export type GameStatus = 'available' | 'coming-soon';
export type GameType = 'versus' | 'puzzle';

export interface GameInfo {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  icon: string;
  status: GameStatus;
  type?: GameType;
}

export const games: GameInfo[] = [
  {
    id: 'noughts-and-crosses',
    name: 'Noughts and Crosses',
    description: 'Get three in a row before your opponent.',
    minPlayers: 2,
    maxPlayers: 2,
    icon: '❌',
    status: 'available',
  },
  {
    id: 'connect-4',
    name: 'Connect 4',
    description: 'Drop discs and line up four to win.',
    minPlayers: 2,
    maxPlayers: 2,
    icon: '🔴',
    status: 'available',
  },
  {
    id: 'gomoku',
    name: 'Gomoku',
    description: 'Five in a row on an open board.',
    minPlayers: 2,
    maxPlayers: 2,
    icon: '⚫',
    status: 'available',
  },
  {
    id: 'reversi',
    name: 'Reversi',
    description: 'Flip your opponent’s discs to take the board.',
    minPlayers: 2,
    maxPlayers: 2,
    icon: '⚪',
    status: 'available',
  },
  {
    id: 'checkers',
    name: 'Checkers',
    description: 'Jump, capture, and crown your kings.',
    minPlayers: 2,
    maxPlayers: 2,
    icon: '🏁',
    status: 'available',
  },
  {
    id: 'battleships',
    name: 'Battleships',
    description: 'Hunt down the enemy fleet.',
    minPlayers: 2,
    maxPlayers: 2,
    icon: '🚢',
    status: 'available',
    type: 'versus',
  },
  {
    id: 'mastermind',
    name: 'Mastermind',
    description: 'Decode the hidden code before your attempts run out.',
    minPlayers: 1,
    maxPlayers: 2,
    icon: '🎯',
    status: 'available',
    type: 'puzzle',
  },
  {
    id: 'bullscows',
    name: 'Bulls and Cows',
    description: 'Use bulls and cows to crack the right number pattern.',
    minPlayers: 1,
    maxPlayers: 2,
    icon: '🐮',
    status: 'available',
    type: 'puzzle',
  },
  {
    id: 'hangman',
    name: 'Hangman',
    description: 'Uncover the hidden word before the gallows fills in.',
    minPlayers: 1,
    maxPlayers: 1,
    icon: '🪢',
    status: 'available',
    type: 'puzzle',
  },
];

export const gameComponents: Partial<Record<string, ComponentType>> = {
  'noughts-and-crosses': TicTacToeGame,
  'connect-4': Connect4Game,
  gomoku: GomokuMatch,
  reversi: ReversiGame,
  checkers: CheckersGame,
  battleships: BattleshipsGame,
  mastermind: MastermindGame,
  bullscows: BullsCowsGame,
  hangman: HangmanGame,
};
