# Seeklume Agent Guide

This file is the working agreement for AI agents in this repository.
Read it before making changes.

## First Context To Read

Before implementation work, read:

- `PROJECT_LOG.md`
- `docs/planning/*.md`

Use those files as the source of truth for current project status,
constraints, validation gaps, release process, and handoff context.

## Product And Technical Direction

- Keep the current `docs/` static site path.
- Keep GitHub Pages + Cloudflare + Supabase.
- Do not introduce React, Vue, Vite, TypeScript, or a new frontend framework
  unless the user explicitly changes the technical direction.
- Treat Seeklume as a long-lived teaching product, not a throwaway demo.
- Prefer small, reversible engineering slices over broad rewrites.

## Hard Safety Rules

- Do not commit or push unless the user explicitly authorizes it.
- Do not run production Supabase migrations unless the user explicitly
  authorizes that exact action.
- Do not use destructive git commands such as `git reset --hard` or
  `git checkout --` to discard work unless explicitly requested.
- The worktree may contain user changes. Do not revert changes you did not
  make. Work around them or ask only if they block the task.
- Do not put API keys, service role keys, tokens, passwords, cookies, or
  student/private content into public files.
- Keep feature work, UI polish, data correction, and architecture refactoring
  as separate themes.

## Editing Rules

- Use `apply_patch` for manual file edits.
- Keep changes scoped to the requested theme.
- Update `PROJECT_LOG.md` after substantive changes.
- When adding or changing a pure module export under
  `docs/grammar-fill/modules/`, update:
  - `scripts/check_grammar_modules.py`
  - `tests/smoke.spec.js`
  - `PROJECT_LOG.md`
  - relevant docs under `docs/planning/`

## Architecture Rules

- Prefer existing modules in `docs/grammar-fill/modules/` over adding logic
  back into `docs/grammar-fill/index.html`.
- Pure modules must not depend on DOM, browser storage, network calls, alerts,
  confirms, or direct document access.
- `docs/grammar-fill/index.html` is still large. Continue reducing it by
  extracting one coherent model/rule/state slice at a time.
- Keep legacy global variables only as compatibility bridges when needed, but
  route new state changes through the relevant model or `GrammarAppState`.

## Validation Rules

Baseline command:

```bash
npm run check
```

This is the release gate for local engineering work. It currently includes
grammar bank checks, module boundary checks, public secret scanning, Supabase
migration checks, Edge Function contract checks, static site checks, and
Playwright smoke tests.

For smaller iterations, use targeted checks first, then run the baseline:

```bash
python3 scripts/check_grammar_modules.py
npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"
npm run check
```

If tests cannot be run, say so clearly and explain the remaining risk.

## Supabase And AI Boundaries

- Any Supabase schema change must have a migration, rollback, and RLS check.
- Real production migration execution requires explicit user authorization.
- Edge Functions must keep contract docs, POST/CORS/auth/error handling, and
  key configuration checks aligned.
- Real Supabase account/RLS/admin tests, real Word sample success-rate tests,
  and real AI/Edge Function long-document tests require real environments or
  user-provided samples.

## User-Facing Completion Report

When finishing a task, report:

- what changed
- where to try it in the app, when useful
- what validation ran
- what remains blocked by authorization, real accounts, real samples, or human
  review

Keep the explanation practical. The user is using this project as a teaching
product and needs to understand the operational impact, not just the code diff.

