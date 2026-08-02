/**
 * Extracts a sample of real Thai addresses into src/data/thaiAddresses.ts.
 *
 * Source: https://github.com/Sellsuki/thai-address-database (devDependency).
 *
 * The package is not a runtime dependency because it declares its build tooling — @babel/cli,
 * mocha, eslint plugins, rimraf — under `dependencies` rather than `devDependencies`, so installing
 * it pulls 181 packages into every production install for what is, in the end, one JSON file.
 * Running it here instead keeps the real data and leaves the app's dependency tree alone.
 *
 * The full database is 7,420 tambon rows. A generator producing fake addresses does not need all of
 * them — it needs valid ones — so this takes a spread across every province.
 *
 * Regenerate with: npm run thai-addresses:generate
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const addressDb = require('thai-address-database');
const rawDb = require('thai-address-database/database/db.json');

const OUTPUT_PATH = path.join(process.cwd(), 'src/data/thaiAddresses.ts');
/** Districts kept per province. Enough variety to look plausible, small enough to embed. */
const PER_PROVINCE = 5;

// Province names in the raw file are dictionary-compressed, so the zipcodes are the only usable
// handle for reaching the library's expanded rows.
const zipcodes = new Set();
for (const province of rawDb.data) {
  for (const amphoe of province[1] ?? []) {
    for (const district of amphoe[1] ?? []) {
      zipcodes.add(district[1]);
    }
  }
}

const byProvince = new Map();
for (const zipcode of zipcodes) {
  for (const row of addressDb.searchAddressByZipcode(zipcode, 10000)) {
    if (!byProvince.has(row.province)) byProvince.set(row.province, []);
    byProvince.get(row.province).push(row);
  }
}

const sampled = [];
for (const [province, rows] of [...byProvince.entries()].sort(([a], [b]) =>
  a.localeCompare(b, 'th'),
)) {
  // Even stride rather than the first N, so a province is not represented only by one amphoe.
  const stride = Math.max(1, Math.floor(rows.length / PER_PROVINCE));
  for (
    let i = 0;
    i < rows.length && sampled.filter((r) => r.province === province).length < PER_PROVINCE;
    i += stride
  ) {
    sampled.push(rows[i]);
  }
}

const rowsLiteral = sampled
  .map(
    (row) =>
      `  { district: ${JSON.stringify(row.district)}, amphoe: ${JSON.stringify(row.amphoe)}, province: ${JSON.stringify(row.province)}, zipcode: '${row.zipcode}' },`,
  )
  .join('\n');

const file = `/**
 * Real Thai tambon / amphoe / province / postcode combinations.
 *
 * GENERATED — do not edit by hand. Run \`npm run thai-addresses:generate\` instead.
 *
 * Sampled from https://github.com/Sellsuki/thai-address-database, which is a devDependency so its
 * misplaced build tooling does not land in production installs. ${sampled.length} rows covering
 * ${byProvince.size} provinces, drawn evenly so no province is represented by a single amphoe.
 *
 * These are real places, which is the point: a postcode has to match its province or the address
 * will be rejected by the form it is pasted into.
 */

export interface ThaiAddressRow {
  /** ตำบล / แขวง */
  district: string;
  /** อำเภอ / เขต */
  amphoe: string;
  province: string;
  zipcode: string;
}

export const THAI_ADDRESSES: ThaiAddressRow[] = [
${rowsLiteral}
];
`;

writeFileSync(OUTPUT_PATH, file, 'utf8');
console.log(
  `[thai-addresses] wrote ${sampled.length} rows across ${byProvince.size} provinces to ${OUTPUT_PATH}`,
);
