import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import StatsProvider from '@/components/StatsProvider';
import SettingsProvider from '@/components/SettingsProvider';
import Connect4Game from '@/games/connect4/Connect4Game';
import GomokuMatch from '@/games/gomoku/GomokuMatch';
import TicTacToeGame from '@/games/tictactoe/TicTacToeGame';

function renderWithProviders(children: ReactNode) {
  return render(
    <MemoryRouter>
      <SettingsProvider>
        <StatsProvider>{children}</StatsProvider>
      </SettingsProvider>
    </MemoryRouter>,
  );
}

async function startTwoPlayerGame(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: '2 Players' }));
  await user.click(screen.getByRole('button', { name: 'Start game' }));
}

describe('game screens', () => {
  it('Noughts and Crosses accepts a move and Restart clears the board', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TicTacToeGame />);
    await startTwoPlayerGame(user);

    const board = screen.getByRole('group', { name: 'Noughts and Crosses board' });
    await user.click(within(board).getByRole('button', { name: 'Row 1, column 1, empty' }));
    expect(within(board).getByRole('button', { name: 'Row 1, column 1, X' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Restart' }));
    expect(within(board).getByRole('button', { name: 'Row 1, column 1, empty' })).toBeTruthy();
  });

  it('Connect 4 accepts a column move and Restart clears the board', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Connect4Game />);
    await startTwoPlayerGame(user);

    const board = screen.getByRole('group', { name: 'Connect 4 board' });
    await user.click(within(board).getByRole('button', { name: 'Row 6, column 1, empty' }));
    expect(
      within(board).getByRole('button', { name: 'Row 6, column 1, player one disc' }),
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Restart' }));
    expect(within(board).getByRole('button', { name: 'Row 6, column 1, empty' })).toBeTruthy();
  });

  it('Gomoku confirms a previewed move and Restart clears the board', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GomokuMatch />);
    await startTwoPlayerGame(user);

    const board = screen.getByRole('group', { name: 'Gomoku board' });
    await user.click(within(board).getByRole('button', { name: 'Empty, row 8, column 8' }));
    await user.click(within(board).getByRole('button', { name: 'Empty, row 8, column 8' }));
    expect(
      within(board).getByRole('button', { name: 'Black stone, row 8, column 8' }),
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Restart' }));
    expect(within(board).getByRole('button', { name: 'Empty, row 8, column 8' })).toBeTruthy();
  });
});
