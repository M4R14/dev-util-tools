# DevPulse AI Entry Point

> Purpose: make any AI coding agent productive in this repository within 1-2 minutes.
> Last updated: 2026-02-20

DevPulse is a React 19 + TypeScript + Vite single-page app with 13 developer tools and one Gemini-based assistant tool.

## Start Here (Read Order)

1. `README.md`  
Project/product overview and available scripts.
2. `.ai/docs/01-project-overview.md`  
Core stack and runtime expectations.
3. `.ai/docs/02-architecture.md`  
How routing, lazy loading, and state flow work.
4. `.ai/docs/04-tool-registry.md`  
Source of truth for Tool ID -> Route -> Component -> Hook -> Lib.
5. `.ai/docs/08-build-env-conventions.md`  
Build commands, env vars, and coding conventions.

## Fast Project Facts

- Framework: React + TypeScript + Vite
- Routing: `react-router-dom`
- Styling: Tailwind CSS + shared UI primitives in `src/components/ui`
- Tool metadata registry: `src/data/tools.tsx`
- Shared types: `src/types.ts`
- AI service: `src/services/gemini.ts`
- Important env var: `GEMINI_API_KEY` (optional)

## Agent Workflow

1. Clarify scope from user request.
2. Map affected tool(s) via `.ai/docs/04-tool-registry.md`.
3. Edit smallest surface area possible (prefer hook/lib first, then component).
4. Validate with:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test` (if tests are relevant)
5. Summarize changed files and behavior impact.

## Task Playbooks

### Add new tool
- Follow `.ai/docs/05-adding-new-tool.md` exactly.
- Keep naming convention:
  - Component: PascalCase (`MyTool.tsx`)
  - Hook/lib: camelCase (`useMyTool.ts`, `myTool.ts`)
- Update registry (`src/data/tools.tsx`) and any route/lazy-load wiring.

### Modify existing tool behavior
- Locate tool mapping in `.ai/docs/04-tool-registry.md`.
- Prefer editing hook/lib logic before JSX layout.
- Keep output deterministic for copy/share features.

### UI-only changes
- Reuse primitives from `src/components/ui`.
- Preserve keyboard accessibility and ARIA labels.
- Do not introduce new UI libraries unless required.

### AI Assistant changes
- Main entry: `src/components/tools/AIAssistant.tsx`
- Service/API layer: `src/services/gemini.ts`
- Respect existing localStorage/user preference behavior.

### AI Agent automation (new)
- Browser endpoint: `/ai-bridge`
- Runner: `src/lib/aiToolBridge.ts`
- Browser API: `window.DevPulseAI.catalog()` and `window.DevPulseAI.run(request)`
- Full guide: `.ai/docs/tools/ai-bridge.md`
- Supported tools for machine calls:
  - `json-formatter`: `format`, `minify`, `validate`
  - `xml-formatter`: `format`, `minify`, `validate`
  - `base64-tool`: `encode`, `decode`
  - `case-converter`: `convert` (`target`: `snake|kebab|camel|pascal`)
  - `url-parser`: `parse`
  - `diff-viewer`: `compare`
  - `thai-date-converter`: `format`, `parse`

#### Query mode examples
```text
/ai-bridge?tool=json-formatter&op=format&input={"a":1}
/ai-bridge?tool=case-converter&op=convert&input=hello%20world&options={"target":"snake"}
/ai-bridge?payload={"tool":"diff-viewer","operation":"compare","input":{"original":"a","modified":"b"}}
```

#### Browser API quickstart
```js
// 1) Open /ai-bridge page first
window.DevPulseAI.catalog();

window.DevPulseAI.run({
  tool: 'json-formatter',
  operation: 'format',
  input: '{"name":"devpulse","ok":true}',
  options: { indent: 2 },
});
```

## Definition of Done (for AI agents)

- Build/type/lint passes for touched areas.
- No unrelated refactor.
- Registry/types/docs updated when behavior or public interface changes.
- User-facing behavior is stated clearly in final summary.

## Documentation Index

| # | File | Use when... |
|---|---|---|
| 01 | `.ai/docs/01-project-overview.md` | Need quick stack and project model |
| 02 | `.ai/docs/02-architecture.md` | Need component graph and patterns |
| 03 | `.ai/docs/03-directory-map.md` | Need exact file location map |
| 04 | `.ai/docs/04-tool-registry.md` | Need tool-to-code mapping |
| 05 | `.ai/docs/05-adding-new-tool.md` | Adding a new tool |
| 06 | `.ai/docs/06-types-and-interfaces.md` | Updating shared types/contracts |
| 07 | `.ai/docs/07-dependencies.md` | Checking package purpose/impact |
| 08 | `.ai/docs/08-build-env-conventions.md` | Commands, env, naming conventions |
| 09 | `.ai/docs/09-ui-building-blocks.md` | Building UI with existing primitives |
| 10 | `.ai/docs/tools/*.md` | Working on a specific tool |
