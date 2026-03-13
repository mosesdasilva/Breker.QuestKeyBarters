# AGENTS.md

## Project Summary
This repository is an SPT server-side mod that adds trader barters for quest-related keys to reduce progression stalls caused by RNG key spawns.

Current scope:
- add barter offers to existing traders
- keep offers limited and progression-friendly
- keep barter definitions data-driven in JSON

Main goal:
- maintain and extend quest-key barter offers safely without breaking trader assort data, balance checks, or packaging

## Repo Map
Core runtime:
- `src/mod.ts`: main runtime logic
- `package.json`: mod metadata, scripts, SPT version, declared entry

Primary data:
- `config/barters.json`: active barter definitions used at runtime
- `config/presets/easy-mode/barters.json`: alternate preset data
- `config/presets/normal-mode/barters.json`: alternate preset data

Validation data:
- `database/templates/items.json`: item IDs used by tests
- `database/templates/prices.json`: price data used by tests

Tests:
- `tests/mod.test.ts`: runtime behavior tests
- `tests/barters-config.test.ts`: config integrity and balance tests

Build and tooling:
- `build.mjs`: packaging script
- `vitest.config.ts`: test config
- `tsconfig.json`: TypeScript config and `@spt/*` path mapping
- `.eslintrc.json`: lint rules already visible in the repo
- `.buildignore`: package exclusions

Reference types:
- `types/`: local SPT type declarations used for TypeScript authoring

Docs:
- `docs/config-format.md`: barter config schema and editing guidance
- `docs/release-checklist.md`: release and packaging checklist

## How The Mod Works
`postDBLoad()` resolves the SPT logger and database, then pushes every entry from `config/barters.json` into the target trader assort.

Flow:
1. load `config/barters.json`
2. map trader names to SPT trader IDs
3. create assort item entries
4. attach barter requirements and loyalty level
5. generate a unique Mongo-style offer ID when the same item ID is reused on the same trader

## Working Rules For Codex
- Prefer small, reviewable diffs.
- Treat `config/barters.json` as the main source of truth for gameplay changes.
- Do not rewrite unrelated code or reformat files just to satisfy style warnings.
- Preserve the existing structure: one runtime file, JSON-driven config, Vitest tests.
- Avoid over-engineering. This repo is intentionally simple.
- Make assumptions explicit when repo behavior is unclear.
- Do not fabricate new runtime systems, preset loaders, config formats, or build steps unless requested.
- Ask before large refactors, release-pipeline changes, or broad gameplay rebalance changes.
- When changing barter data, keep progression intent intact: helpful, limited, and not overpowered.
- Do not treat `dist/` as source of truth unless release work is explicitly requested.

## Workflow Expectations
- Work in an XP-style rhythm: small safe changes, frequent validation, and clear checkpoints.
- Prefer TDD when practical: add or adjust a test near the behavior change, then implement the change.
- Treat the user as an active pair-programming partner: surface assumptions, tradeoffs, and unclear repo behavior early.
- When a task reaches a meaningful checkpoint, suggest a commit instead of silently accumulating a large batch.
- Prefer early and frequent commits for significant changes, but ask the user before committing unless they already asked for one.
- Keep commits scoped to a single logical change when practical.

## Validation Workflow
Default:
- `npm test`

If runtime logic changed:
- run `npm test`
- confirm existing tests still cover trader insertion and duplicate offer ID behavior

If barter/config data changed:
- run `npm test`
- verify JSON validity
- verify item IDs and trader names remain valid
- verify balance intent still makes sense

Optional lint check:
- `npx eslint src tests --ext .ts`
- lint is informational unless the task is specifically about lint/style cleanup

Packaging check, only when release work is requested:
- `npm run build`

A task is not done until:
- relevant tests pass
- changed JSON is valid
- no obvious barter data regression is introduced
- any unverified assumptions are called out

## Testing And Refactoring Expectations
Add or update tests when:
- runtime behavior changes
- config validation rules change
- a bug fix would be easy to regress
- duplicate offer IDs, trader mapping, or config integrity rules are touched

Refactor when:
- duplication or confusion is reduced
- behavior does not change unexpectedly
- review remains easy

Keep refactors easy to review:
- separate behavior changes from cleanup when practical
- avoid mixing mass config edits with runtime refactors
- keep names and structure close to the existing code unless there is a clear benefit

## Living Rules
This file is intended to evolve with the project.

When the user states a durable repo rule, workflow guardrail, or "do/don't do this again" instruction:
- prefer updating `AGENTS.md` in the same task
- if the rule is ambiguous, broad, or could affect future workflow significantly, ask for confirmation before editing
- keep additions short, concrete, and repo-specific
- prefer adding rules under the most relevant section instead of creating noise
- avoid logging one-off preferences that are unlikely to matter again

Examples of rules worth recording:
- validation steps that should always be run
- release guardrails
- config editing constraints
- known pitfalls and regression patterns
- workflow rules the user expects Codex to remember

## Known Gaps
- There is no `npm run lint` script even though ESLint is configured.
- `package.json` points to `src/mod.js`, but the repo source is TypeScript; release/runtime entry expectations should be manually confirmed.
- Preset switching appears manual; runtime currently imports only `config/barters.json`.
- Build output exists in-repo, so generated artifacts should not be treated as hand-maintained source unless release work is explicitly requested.
