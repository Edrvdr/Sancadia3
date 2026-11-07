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

### What has been done

- Set up the Vite + React + TypeScript arcade structure.
- Added/updated authentication context and session handling.
- Added game registry entries and puzzle game support.
- Fixed the codebreaker RNG generation bug that could stall unique-secret generation.
- Ran the project test suite locally: `npm test` is currently passing.

### What still needs to be done

- Complete any remaining browser-level/manual QA checks after deployment or local preview.
- Confirm end-to-end flow for authentication, save data, and game sessions in a live environment.
- Review remaining UX polish and accessibility items before release.
- Finish any outstanding production or PWA validation tasks.

### Important note

> The full end-to-end test work is still marked as pending and must be completed later. Do not assume the project is fully validated until that checklist is complete.

> Current local unit coverage is green, but the broader test/QA checklist still needs follow-up in the target environment.

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
