# QA & API Tools

Five tools added for the day-to-day dev/QA loop: comparing responses, reading timestamps out of
logs, unpacking a request, pulling one value from a large payload, and filling forms.

| Tool                | Route                  | Lib                              | AI Bridge        |
| ------------------- | ---------------------- | -------------------------------- | ---------------- |
| JSON Compare        | `/json-compare`        | `lib/tools/jsonCompare.ts`       | ✅ `compare`     |
| JSONPath Extractor  | `/json-path`           | `lib/tools/jsonPath.ts`          | ✅ `query`       |
| cURL Parser         | `/curl-parser`         | `lib/tools/curlParser.ts`        | ✅ `parse`       |
| Unix Timestamp      | `/timestamp-converter` | `lib/tools/timestamp.ts`         | ✅ `parse`       |
| Test Data Generator | `/test-data-generator` | `lib/tools/testDataGenerator.ts` | ❌ random output |

## JSON Compare

Compares **parsed values**, not text. The Diff Viewer answers a different question and gets this
one wrong: two identical payloads whose keys serialise in a different order are reported as 100%
changed, and a real one-field difference inside two hundred lines is left for the reader to find.

- Key order and whitespace are irrelevant.
- Array order **is** significant — order is meaningful in JSON, so a reordered array is a
  difference, not a false positive.
- `"1"` vs `1` is reported as `type-changed`, not `changed`. In API testing that distinction is
  usually the bug.
- Every difference carries a path: `$.data.items[3].price`.

## JSONPath Extractor

A deliberate subset: property access, array indexing (including negative indexes), and `*`
wildcards over both objects and arrays.

**Filters and recursive descent are not supported and are rejected explicitly** rather than
silently returning nothing — `$..id` and `$.data[?(@.id>1)]` both raise a named error. Supporting
them would turn a reader into an expression evaluator, which is not safe on pasted input.

## cURL Parser

Reads the quoting rules curl commands actually use — single quotes, double quotes with backslash
escapes, `\`-newline continuations — and stops there.

**It is not a shell.** Variables, expansion and subshells are not evaluated. Anything not
understood is listed under "Not interpreted" rather than dropped, so nothing disappears silently.

Follows curl's own rule that a body implies `POST` unless `-X` says otherwise, and joins repeated
`-d` flags with `&`.

## Unix Timestamp

The unit is detected from **digit count**, not magnitude: ≤11 digits is seconds, 12–14 is
milliseconds, 15+ is microseconds. Guessing by magnitude reads a millisecond value as a date in the
year 56000 — the classic log-reading mistake.

Shows UTC, Bangkok, local, ISO 8601, relative, and both epoch units at once, because reading a log
usually needs the server time and the user's time together.

Values beyond the JavaScript Date range (±8.64e15 ms, reachable only at 19+ digits) are rejected
with a named error.

## Test Data Generator

Fake Thai data that **passes the validation it will be typed into** — the point generic fake-data
libraries miss, since Thai-looking strings get rejected by Thai check digits.

- National ID and tax ID carry a real weighted checksum; the test suite asserts every generated ID
  passes the app's own `analyzeThaiId`.
- Mobile numbers use prefixes actually issued in Thailand (06/08/09).
- Card numbers satisfy Luhn by construction.
- Emails use reserved example domains so a stray send cannot reach a real inbox.

Values come from `platform/randomUtils`, so there is one random source in the codebase.

**These are fictitious but valid by construction, so a value can collide with a real one by
chance.** The UI says so; keep it there.

Not on the AI bridge: output is random, so a bridge call would not be reproducible.

## Related

- [Tool Registry](../04-tool-registry.md)
- [Adding a New Tool](../05-adding-new-tool.md)
- [AI Bridge](./ai-bridge.md)
- [Send Output To Another Tool](../features/send-to-tool-features.md)
