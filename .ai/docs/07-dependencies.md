# Dependencies (Production)

| Package                    | Purpose                                                                                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react`, `react-dom`       | UI framework (v19)                                                                                                                                                                                                  |
| `react-router-dom`         | Client-side routing (v7)                                                                                                                                                                                            |
| `lucide-react`             | Icon library                                                                                                                                                                                                        |
| `@radix-ui/react-slider`   | Accessible slider primitive                                                                                                                                                                                         |
| `@radix-ui/react-switch`   | Accessible toggle switch                                                                                                                                                                                            |
| `@radix-ui/react-slot`     | Polymorphic component pattern (asChild)                                                                                                                                                                             |
| `class-variance-authority` | Button/component variant system                                                                                                                                                                                     |
| `clsx` + `tailwind-merge`  | Conditional + deduplicated Tailwind class merging                                                                                                                                                                   |
| `sonner`                   | Toast notifications                                                                                                                                                                                                 |
| `dayjs`                    | Date/time manipulation (+ utc & timezone plugins)                                                                                                                                                                   |
| `diff`                     | Line-based text diffing (Myers algorithm)                                                                                                                                                                           |
| `minisearch`               | Fuzzy full-text search index                                                                                                                                                                                        |
| `marked`                   | Markdown parsing for blog post rendering                                                                                                                                                                            |
| `xml-formatter`            | XML prettify/minify                                                                                                                                                                                                 |
| `jwt-decode`               | JWT base64url + JSON parsing. Deliberately not used on its own: it skips segment-count and claim-shape checks, so `src/lib/tools/jwt.ts` keeps that validation. Verifies nothing.                                   |
| `jose`                     | JWT signing and HMAC verification over Web Crypto (`src/lib/tools/jwtSign.ts`). Splits into its own lazy chunk (~21 kB raw) loaded only by the two JWT tools; never reaches the eager bundle. Secure contexts only. |
| `zod`                      | Runtime schema validation for tool/lib inputs and query payloads                                                                                                                                                    |
| `@google/genai`            | Google Gemini AI API client                                                                                                                                                                                         |

---

## Related

- [Project Overview](01-project-overview.md) — Tech stack summary
- [Build, Env & Conventions](08-build-env-conventions.md) — Vendor chunks & build config
- [Architecture](02-architecture.md) — How dependencies are used in patterns
