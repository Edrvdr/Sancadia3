# Sancadia — Classic Games Arcade

[![CI](https://github.com/Edrvdr/Sancadia3/actions/workflows/ci.yml/badge.svg)](https://github.com/Edrvdr/Sancadia3/actions/workflows/ci.yml)

A Vite, React and TypeScript arcade for classic board games.

## Development

```sh
npm ci
npm run dev
```

Useful scripts:

| Script                   | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `npm run check`          | Typecheck, lint, formatting check and unit tests |
| `npm run typecheck`      | TypeScript compiler                              |
| `npm run lint`           | ESLint                                           |
| `npm run format`         | Format project files with Prettier               |
| `npm run format:check`   | Check formatting without changing files          |
| `npm test`               | Run Vitest                                       |
| `npm test -- --coverage` | Run tests and generate coverage                  |
| `npm run build`          | Create the production app in `dist/`             |
| `npm run preview`        | Preview a production build locally               |

### Environment

Copy `.env.example` to `.env.local` and provide Supabase credentials to enable authentication. The
arcade and local game features work without those optional values.

## Project status

> Roadmap status last updated November 7, 2026 at 4:26 a.m. UTC.

### What has been done

- Set up the Vite + React + TypeScript arcade structure.
- Added/updated authentication context and session handling.
- Added game registry entries and puzzle game support.
- Fixed the codebreaker RNG generation bug that could stall unique-secret generation.
- Completed Phase 6: shared code-breaker gameplay, Mastermind, Bulls and Cows, Hangman, pass-and-play, keyboard and notes UX, puzzle points/stats, and documentation.
- Verified `npm run check` (19 test files, 124 tests) and `npm run build`.

### What still needs to be done

- Complete any remaining browser-level/manual QA checks after deployment or local preview.
- Confirm end-to-end flow for authentication, save data, and game sessions in a live environment.
- Review remaining UX polish and accessibility items before release.
- Finish any outstanding production or PWA validation tasks.

### Important note

> The full end-to-end test work is still marked as pending and must be completed later. Do not assume the project is fully validated until that checklist is complete.

> Current local unit coverage is green, but the broader test/QA checklist still needs follow-up in the target environment.

## Roadmap checklist

This roadmap is derived from the build-plan PDFs and the prompt sequence for the remaining arcade work. Use it as the delivery checklist for the next milestones.

### Phase 6 — Guessing games

- [x] Shared code-breaker core and 2-player handoff
- [x] Mastermind
- [x] Bulls and Cows
- [x] Hangman
- [x] Stats, points and docs

### Phase 7 — Supabase

- [ ] Supabase schema, RLS and score tables
- [ ] Client and anonymous auth flow
- [ ] Offline-first synced stats
- [ ] Leaderboards
- [ ] Privacy and abuse basics

### Phase 8 — Cloudflare

- [ ] Pages deployment config
- [ ] Score validation Worker
- [ ] Lock down the database
- [ ] Client integration and Turnstile
- [ ] Monitoring and rollback

### Phase 9 — Board game batch 2

- [ ] Engine hardening and new-game scaffolding
- [ ] Reversi
- [ ] Checkers
- [ ] Dots and Boxes
- [ ] Mancala
- [ ] Batch integration and docs

### Phase 10 — Hidden-information and chance games

- [ ] Hidden-information and chance core
- [ ] Battleships
- [ ] Dominoes
- [ ] Ludo
- [ ] Stats, points and backend integration

### Phase 11 — Arcade games

- [ ] Arcade core
- [ ] Snake
- [ ] 2048
- [ ] Minesweeper
- [ ] Scores, replay validation and anti-cheat

### Phase 12 — Engagement and economy

- [ ] Economy and shop backend
- [ ] Shop, themes and loadout screens
- [ ] Achievements
- [ ] Online match schema and multiplayer readiness
- [ ] Match Worker with server authority
- [ ] Online play client
- [ ] Online safety, ratings and moderation

### Phase 13 — Launch and release

- [ ] Automated end-to-end and visual testing
- [ ] Performance budgets and optimization
- [ ] Accessibility audit
- [ ] Analytics, monitoring and feedback
- [ ] Legal, privacy and content review
- [ ] Capacitor wrapping for app stores
- [ ] Release process and launch checklist

### Delivery order

1. Finish the remaining game-engine and game implementation prompts.
2. Close the Supabase/Cloudflare backend and security work.
3. Complete engagement, economy and social features.
4. Run release-grade QA and deployment checks.
5. Launch and monitor the production build.

### Project structure

- `src/engine/` — UI-independent game search and shared engine types.
- `src/games/<game>/rules.ts` — pure game rules and state transitions.
- `src/games/<game>/ai.ts` — game-specific AI evaluation and difficulty settings.
- `src/components/` — shared React components.
- `src/screens/` — route-level screens.
- `src/lib/` — persistence, settings, feedback and other application utilities.

Keep `rules.ts` files pure: no React, DOM, components, screens or hooks imports. Add rule tests
alongside each game's rules.

## Testing the PWA

Run `npm run build && npm run preview`, open the printed local URL in a supported browser, and use
Lighthouse's Progressive Web App checks. Confirm the app installs, then disable network access in
DevTools and navigate to the app and game routes. Service workers cache aggressively; use DevTools
→ Application → Update on reload or clear site data when validating a new build.

GitHub Pages is served from the `/Sancadia3/` project subpath, so the Vite base and PWA start URL
are configured for that path.
