import { z } from 'zod';

/**
 * Structural comparison of two JSON documents.
 *
 * The Diff Viewer compares text, which answers the wrong question for an API response: two
 * identical payloads whose keys serialise in a different order are reported as 100% changed, and a
 * genuine one-field difference inside two hundred lines is left for the reader to find. Comparing
 * the parsed values instead makes key order and whitespace irrelevant and names the field that
 * actually moved.
 *
 * A `"1"` that should be `1` is called out as a type change rather than a value change, because in
 * API testing that distinction is usually the bug.
 */

export type JsonDifferenceKind = 'added' | 'removed' | 'changed' | 'type-changed';

export interface JsonDifference {
  /** Dot/bracket path to the value, e.g. `data.items[3].price`. `$` is the document root. */
  path: string;
  kind: JsonDifferenceKind;
  left?: unknown;
  right?: unknown;
  /** Present for `type-changed`, e.g. `string → number`. */
  leftType?: string;
  rightType?: string;
}

export interface JsonCompareResult {
  differences: JsonDifference[];
  /** True when the two documents are structurally identical, whatever their formatting. */
  identical: boolean;
}

const jsonTextSchema = z.string();

/** `typeof` collapses null and arrays into "object", which is exactly what matters here. */
export const jsonTypeOf = (value: unknown): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  jsonTypeOf(value) === 'object';

/** Bracket-quotes any key that is not a plain identifier, so paths stay copy-pasteable. */
const childPath = (parent: string, key: string): string =>
  /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;

const compareValues = (
  left: unknown,
  right: unknown,
  path: string,
  out: JsonDifference[],
): void => {
  const leftType = jsonTypeOf(left);
  const rightType = jsonTypeOf(right);

  if (leftType !== rightType) {
    out.push({ path, kind: 'type-changed', left, right, leftType, rightType });
    return;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const length = Math.max(left.length, right.length);
    for (let index = 0; index < length; index += 1) {
      const itemPath = `${path}[${index}]`;
      if (index >= left.length) {
        out.push({ path: itemPath, kind: 'added', right: right[index] });
      } else if (index >= right.length) {
        out.push({ path: itemPath, kind: 'removed', left: left[index] });
      } else {
        compareValues(left[index], right[index], itemPath, out);
      }
    }
    return;
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    // Union of both key sets, so a key present on only one side is reported rather than skipped.
    // Sorted so the report does not depend on serialisation order — the whole point of this tool.
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();

    for (const key of keys) {
      const nextPath = childPath(path, key);
      const inLeft = Object.prototype.hasOwnProperty.call(left, key);
      const inRight = Object.prototype.hasOwnProperty.call(right, key);

      if (!inLeft) {
        out.push({ path: nextPath, kind: 'added', right: right[key] });
      } else if (!inRight) {
        out.push({ path: nextPath, kind: 'removed', left: left[key] });
      } else {
        compareValues(left[key], right[key], nextPath, out);
      }
    }
    return;
  }

  if (left !== right) {
    out.push({ path, kind: 'changed', left, right });
  }
};

export const compareJsonValues = (left: unknown, right: unknown): JsonCompareResult => {
  const differences: JsonDifference[] = [];
  compareValues(left, right, '$', differences);

  return { differences, identical: differences.length === 0 };
};

/**
 * Parses both sides, then compares. Throws with the offending side named — "invalid JSON" alone
 * leaves the reader checking the wrong pane.
 */
export const compareJsonText = (leftText: string, rightText: string): JsonCompareResult => {
  const left = jsonTextSchema.parse(leftText);
  const right = jsonTextSchema.parse(rightText);

  let leftValue: unknown;
  let rightValue: unknown;

  try {
    leftValue = JSON.parse(left);
  } catch (error) {
    throw new Error(`Left side is not valid JSON: ${(error as Error).message}`);
  }

  try {
    rightValue = JSON.parse(right);
  } catch (error) {
    throw new Error(`Right side is not valid JSON: ${(error as Error).message}`);
  }

  return compareJsonValues(leftValue, rightValue);
};

export interface JsonCompareSummary {
  added: number;
  removed: number;
  changed: number;
  typeChanged: number;
  total: number;
}

export const summarizeJsonDifferences = (differences: JsonDifference[]): JsonCompareSummary => ({
  added: differences.filter((d) => d.kind === 'added').length,
  removed: differences.filter((d) => d.kind === 'removed').length,
  changed: differences.filter((d) => d.kind === 'changed').length,
  typeChanged: differences.filter((d) => d.kind === 'type-changed').length,
  total: differences.length,
});
