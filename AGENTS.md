# Repository Guidelines

## Project Structure & Module Organization
- `src/app` contains the Next.js App Router entrypoints and locale-aware layouts.
- `src/modules` groups feature flows (billing, generation, auth) with co-located UI and logic; shared helpers live in `src/lib`, `src/services`, and `src/utils`.
- `public/` holds static assets, while `images/` and `docs/` provide design references and rollout notes.
- `backend/` is an npm-workspace microservices suite (auth, user, cover-generation, task) with its own scripts.
- `supabase/` and `migrations/` track database schema changes; `tests/` mirrors unit, integration, and Playwright e2e suites with setup assets.

## Build, Test, and Development Commands
- `npm run dev` starts the frontend on `http://localhost:3001`; use `npm run dev:3000` if the default port is busy.
- `npm run build` followed by `npm run start` serves the production bundle; add `ANALYZE=true` (`npm run build:analyze`) for bundle stats.
- `npm run lint` enforces the Next.js ESLint config, and `npm run typecheck` runs TypeScript in noEmit mode.
- `npm test`, `npm run test:unit`, and `npm run test:integration` execute Vitest suites; `npm run test:coverage` emits V8 coverage reports.
- `npm run test:e2e` drives Playwright specs in `tests/e2e`; run `npm run test:install` once to provision browsers and seed fixtures.
- Backend services use `cd backend && npm run dev:all` for local orchestration and `npm run docker:up` when Docker-based dependencies are needed.

## Coding Style & Naming Conventions
- TypeScript is required; prefer explicit return types on shared utilities and API clients.
- Follow the repo-standard lint output: two-space indentation, single quotes, and implicit semicolons.
- React components, providers, and server actions use PascalCase files (`PaymentSummaryCard.tsx`); hooks stay camelCase with a `use` prefix.
- Feature work should live in `src/modules/<feature>` with barrel exports to keep imports concise; Tailwind tokens belong in `src/styles` and `tailwind.config.js`.

## Testing Guidelines
- Place fast-unit specs in `tests/unit/**/*.test.ts` and stub network calls with local fixtures.
- Integration coverage lives in `tests/integration`, targeting real Supabase/Stripe stubs—mirror required secrets in `.env.test`.
- Playwright specs reside in `tests/e2e/**/*.spec.ts`; reuse the setup scripts in `tests/e2e/setup` before running `npm run test:e2e`.
- Target ≥80% coverage on new core modules and include billing edge cases or AI fallback scenarios before requesting review.

## Commit & Pull Request Guidelines
- Write short, imperative commit subjects in sentence case (`Fix missing Sparkles icon import`); keep related work squashed together.
- Reference issues or docs in the commit body (`Refs #123`) and note lint/typecheck/test commands executed.
- PRs should include a concise changelog, screenshots or Loom demos for UI shifts, and confirmation of scripts run.
- Call out schema or Supabase config changes in the PR description and link to supporting docs under `docs/` or `supabase/`.
- Request reviewers across frontend and backend when touching both `src/*` and `backend/*`.

## Security & Configuration Tips
- Store secrets in `.env.local`; never commit live credentials—follow patterns in `ENVIRONMENT_CONFIG_GUIDE.md`.
- Regenerate Supabase service keys before sharing sandboxes and double-check `supabase_tables.sql` updates with migrations.
- For payment flows, rely on the Creem sandbox scripts in `scripts/` and coordinate webhook secrets out-of-band.
