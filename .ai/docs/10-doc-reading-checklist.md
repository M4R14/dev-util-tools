# Doc Reading Checklist (Anti-Miss Protocol)

Use this checklist before code edits to avoid missing architecture/location rules in docs.

## 1) Define Scope in 30 Seconds

Fill these fields first:

- User request (one sentence):
- Target feature/tool:
- Expected layer(s): `components` / `hooks` / `lib` / `data` / `services` / `context`
- Non-target layer(s) that should not be touched:

## 2) Required Docs (Always Read)

Read these in order:

1. `.ai/README.ai.md`
2. `.ai/docs/03-directory-map.md`
3. `.ai/docs/04-tool-registry.md`
4. `.ai/docs/08-build-env-conventions.md`

Then read only relevant docs:

- New tool: `.ai/docs/05-adding-new-tool.md`
- Shared type/interface change: `.ai/docs/06-types-and-interfaces.md`
- UI composition change: `.ai/docs/09-ui-building-blocks.md`
- Tool-specific behavior: `.ai/docs/tools/<tool>.md`

## 3) Build a Mapping Table Before Editing

Create a quick map for the request:

| Concern | Source of truth | Target file(s) |
|---|---|---|
| Route/page wiring | `App.tsx`, registry docs | `src/App.tsx`, `src/data/tools.tsx` |
| UI layout | directory map + UI docs | `src/components/**` |
| Data/constants | directory map | `src/data/**` |
| Pure logic | directory map | `src/lib/**` |

Rule:

- `components` = UI composition/presentation
- `data` = constants, metadata, static specs/templates
- `lib` = pure logic/transform/parse utilities

## 4) Fast Reality Check Against Repo

Run:

```bash
rg --files src | sort
```

Then verify planned file placement matches `03-directory-map.md`.

## 5) Pre-Edit Gate

Do not edit yet if any item is unclear:

- File location is ambiguous
- Doc and actual tree conflict
- Ownership of `data` vs `lib` is unclear

If unclear, stop and resolve by:

1. Choosing the stricter documented path.
2. If conflict remains, ask user before moving files.

## 6) Post-Edit Validation

Minimum checks:

```bash
npm run typecheck
```

Recommended:

```bash
npm run lint
```

## 7) Final Response Checklist

Before replying, confirm:

- Mentioned changed files are the actual changed files.
- Structure still matches docs (or docs were updated in same change).
- No logic file left in `components` by accident.
- No constant/spec file left in `lib` by accident.
