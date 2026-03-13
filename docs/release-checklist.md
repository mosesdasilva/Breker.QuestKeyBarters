# Release Checklist

## Purpose
Use this checklist when preparing a build or release of the mod.

## Before Building
- confirm the intended changes are complete
- confirm only expected files were edited
- update user-facing docs if behavior or install expectations changed
- confirm `package.json` version is correct if this is a versioned release

## Validation
Run:
- `npm test`

Optional but useful:
- `npx eslint src tests --ext .ts`

Notes:
- ESLint currently reports warnings in the repo, so lint is informational unless doing lint cleanup.
- If barter data changed, sanity-check the edited entries for progression balance.

## Packaging
Run:
- `npm run build`

Then verify:
- `dist/` was produced successfully
- the packaged archive exists
- expected runtime files and config files are present
- no clearly dev-only files were packaged unexpectedly

## Manual Release Review
Check:
- README still matches current feature set
- install path instructions are still correct
- SPT compatibility in `package.json` and docs is still correct
- no accidental test-only or local-only artifacts were included

## Known Manual Confirmation Items
These should be verified before relying on a release:
- runtime entry expectations around `src/mod.js` vs TypeScript source
- whether packaged contents match what SPT actually expects at load time

## Ship Criteria
A release is ready when:
- relevant tests pass
- packaging succeeds
- docs are not obviously stale
- any unresolved manual checks are explicitly noted
