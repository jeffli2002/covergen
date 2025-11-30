# Repository Guidelines

## Project Structure & Module Organization
`src/app` contains Next.js App Router layouts plus locale scaffolding, while end-to-end feature flows live in `src/modules/<feature>` with colocated UI, hooks, and actions. Shared utilities belong in `src/lib`, `src/services`, and `src/utils`. Static assets sit in `public/`, with supporting design docs under `images/` and rollout notes in `docs/`. Backend microservices live in `backend/` (npm workspace), and database schemas or migrations land in `supabase/` and `migrations/`. Tests are grouped by scope in `tests/unit`, `tests/integration`, and `tests/e2e`.

## Build, Test, and Development Commands
Run `npm run dev` or `npm run dev:3000` for the frontend, and `cd backend && npm run dev:all` to boot all services; `npm run docker:up` starts shared infrastructure. Ship-ready bundles use `npm run build && npm run start`, or `ANALYZE=true npm run build` for stats. Quality gates: `npm run lint`, `npm run typecheck`, and `npm test` (or the scoped `npm run test:unit|integration|e2e`). Execute `npm run test:install` once to provision Playwright browsers.

## Coding Style & Naming Conventions
All code is TypeScript with two-space indentation, single quotes, and implicit semicolons. React components, providers, and server actions live in PascalCase files (`PaymentSummaryCard.tsx`), hooks start with `use`, and feature folders export from a local `index.ts`. Tailwind tokens stay in `src/styles` and `tailwind.config.js`; align icons/assets with existing naming in `public/`.

## Testing Guidelines
Vitest owns unit and integration specs, while Playwright drives `tests/e2e`. Mirror production secrets in `.env.test`, stub HTTP calls with fixtures, and reach ≥80% coverage on new core modules via `npm run test:coverage`. Name tests after the user scenario or billing edge being validated for quick triage.

## Commit & Pull Request Guidelines
Commits use short, imperative subjects in sentence case (e.g., `Fix missing Sparkles icon import`) plus any commands executed in the body (`Refs #123`). PRs should summarize scope, link Jira/GitHub issues, attach screenshots or Looms for UI changes, and explicitly confirm lint, typecheck, and test runs. Highlight Supabase or schema updates and reference the relevant doc in `docs/` or `supabase/`; request reviewers across frontend and backend if both paths change.

## Security & Configuration Tips
Manage secrets through `.env.local` and follow `ENVIRONMENT_CONFIG_GUIDE.md`. Regenerate Supabase service keys before sharing sandboxes, validate `supabase_tables.sql` edits with a migration in `migrations/`, and coordinate payment webhook secrets via the Creem scripts in `scripts/`. Avoid pushing `.env*` or log files to the repo.
