# AGENTS.md

Repository rules for AI coding agents working in this project.

## Mandatory Pre-Edit Protocol

Before editing any file, you must run `.ai/docs/10-doc-reading-checklist.md`.

Minimum required docs to read first:

1. `.ai/README.ai.md`
2. `.ai/docs/03-directory-map.md`
3. `.ai/docs/04-tool-registry.md`
4. `.ai/docs/08-build-env-conventions.md`
5. `.ai/docs/10-doc-reading-checklist.md`

## File Placement Rules

- `src/components/**`: UI composition and presentation only.
- `src/data/**`: constants, metadata, static specs/templates.
- `src/lib/**`: pure logic, parsing, transformations (no React UI).

If a change crosses layers, map target files before editing.

## Conflict Handling

If documentation and current tree disagree:

1. Follow the stricter documented path.
2. Update docs in the same change when code structure is intentionally changed.
3. If still ambiguous, ask the user before moving files.

## Validation Gate

After edits, run:

```bash
npm run typecheck
```

Recommended:

```bash
npm run lint
```
