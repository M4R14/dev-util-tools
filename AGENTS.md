# AGENTS.md

Repository rules for AI coding agents working in this project.

## Mandatory Pre-Edit Protocol

Before editing any file, you must run `.ai/docs/10-doc-reading-checklist.md`.

Minimum required docs to read first:

1. `README.md`
2. `.ai/README.ai.md`
3. `.ai/docs/01-project-overview.md`
4. `.ai/docs/02-architecture.md`
5. `.ai/docs/03-directory-map.md`
6. `.ai/docs/04-tool-registry.md`
7. `.ai/docs/08-build-env-conventions.md`
8. `.ai/docs/10-doc-reading-checklist.md`

For tool-specific work, also read `.ai/docs/tools/<tool>.md` before editing.

## Scope Mapping Gate

Before first edit, define:

1. User request in one sentence.
2. Target tool/feature.
3. Intended layer(s): `components`, `hooks`, `data`, `lib`, `services`, `context`.
4. Non-target layers to avoid.

Then verify planned file locations against the current tree:

```bash
rg --files src | sort
```

## File Placement Rules

- `src/components/**`: UI composition and presentation only.
- `src/hooks/**`: React state/effects and tool interaction logic.
- `src/data/**`: constants, metadata, static specs/templates.
- `src/lib/**`: pure logic, parsing, transformations (no React UI).
- `src/services/**`: integration/service clients (e.g., external APIs).

If a change crosses layers, map target files before editing.

## Conflict Handling

If documentation and current tree disagree:

1. Follow the stricter documented path.
2. Update docs in the same change when code structure is intentionally changed.
3. If still ambiguous, ask the user before moving files.

## Documentation Sync Gate

If code behavior or structure changes, update matching docs in the same change:

1. `.ai/docs/03-directory-map.md` for file structure changes.
2. `.ai/docs/04-tool-registry.md` for tool mapping changes.
3. `.ai/docs/tools/<tool>.md` for tool behavior/UI/action changes.
4. `.ai/README.ai.md` when workflow, entry points, or capabilities change.

## Validation Gate

After edits to code, run:

```bash
npm run typecheck
```

Recommended:

```bash
npm run lint
```

For doc-only changes, lint/typecheck is optional.

## Final Response Contract

Final response must include:

1. What changed (behavior + structure).
2. Exact files updated.
3. Validation status (what was run / not run).
