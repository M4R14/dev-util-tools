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

## Layout rule for these tools

The result comes before the input, or as close to the top as the content allows. These tools are
paste-once, read-many: someone pastes a response and then reads the findings repeatedly, so putting
the findings under two full-height input boxes meant scrolling on every look.

Measured on a twelve-user API response at a 1030px fold:

|                            | Before | After     |
| -------------------------- | ------ | --------- |
| JSON Compare — Differences | 720px  | **277px** |
| JSONPath — Result          | 770px  | **455px** |
| cURL Parser — Body         | 1382px | **839px** |

Inputs use `ui/CodeInput`: `resize-y` rather than a fixed height, plus an `NL / NC` counter in the
same shape the Diff Viewer uses. The fixed boxes showed 256px of a 3,360px document — about 155
lines hidden — with nothing on screen to say so.

## JSON Compare

Compares **parsed values**, not text. The Diff Viewer answers a different question and gets this
one wrong: two identical payloads whose keys serialise in a different order are reported as 100%
changed, and a real one-field difference inside two hundred lines is left for the reader to find.

- Key order and whitespace are irrelevant.
- Array order **is** significant — order is meaningful in JSON, so a reordered array is a
  difference, not a false positive.
- `"1"` vs `1` is reported as `type-changed`, not `changed`. In API testing that distinction is
  usually the bug.
- Every difference carries a path: `$.data.items[3].price`. **Clicking it copies it** — that path
  is what gets pasted into a test assertion or a bug report. Scrolling the input to the matching
  line was considered and dropped: pasted JSON is often minified onto one line, where it would
  silently do nothing.

## JSONPath Extractor

A deliberate subset: property access, array indexing (including negative indexes), and `*`
wildcards over both objects and arrays.

Matched paths are listed behind a "Show N matched paths" toggle. Rendering the values and then
every resolved path doubled the page height for one dataset shown twice.

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

**Headers are triaged.** `triageHeaders` splits off the browser boilerplate — `sec-*`, `priority`,
`user-agent`, `accept-encoding` and friends — behind a toggle, leaving auth, content type, cookies
and custom `x-` headers in view. A real copy-as-cURL carries fifteen or more, and listing them in
order buried the body. Nothing is dropped; the tests assert the two halves still account for every
header.

**Body is shown before Headers**, because when a request is being debugged the question is usually
what was sent, not which `sec-fetch-*` values the browser attached.

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
- **Addresses use real tambon/amphoe/province/postcode rows** from
  [Sellsuki/thai-address-database](https://github.com/Sellsuki/thai-address-database). Bangkok gets
  แขวง/เขต, everywhere else ต./อ./จ.

Values come from `platform/randomUtils`, so there is one random source in the codebase.

### Why the address data is generated, not imported

`thai-address-database` is a **devDependency**, and `src/data/thaiAddresses.ts` is generated from it
by `npm run thai-addresses:generate`.

The package declares its build tooling — `@babel/cli`, `mocha`, `eslint-plugin-*`, `rimraf` — under
`dependencies` rather than `devDependencies`, so installing it as a runtime dependency pulls **181
packages** into every production install for what is ultimately one JSON file. Generating instead
keeps the real data and leaves the app's 22 runtime dependencies alone; nothing from the package
reaches the bundle.

385 rows covering all 77 provinces, sampled with an even stride so no province is represented by a
single amphoe. A fake-data generator needs _valid_ combinations, not all 7,420 of them.

**The house number and street are invented** — only the administrative part and postcode are real.
A generic street name can therefore land in an upcountry address.

Rerun the generator if Thailand's postcodes change; the output file says it is generated and should
not be hand-edited.

**These are fictitious but valid by construction, so a value can collide with a real one by
chance.** The UI says so; keep it there.

Not on the AI bridge: output is random, so a bridge call would not be reproducible.

## Related

- [Tool Registry](../04-tool-registry.md)
- [Adding a New Tool](../05-adding-new-tool.md)
- [AI Bridge](./ai-bridge.md)
- [Send Output To Another Tool](../features/send-to-tool-features.md)
