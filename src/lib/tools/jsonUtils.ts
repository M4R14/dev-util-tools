export const DEFAULT_JSON_INDENT = 2;

/**
 * JSON document transforms shared by the tool UI (`useJsonFormatter`) and the AI bridge
 * (`handlers/jsonFormatter`). Every function throws the native `SyntaxError` raised by
 * `JSON.parse` when the input is not valid JSON — callers decide how to present it.
 */

export const formatJson = (raw: string, indent: number = DEFAULT_JSON_INDENT): string =>
  JSON.stringify(JSON.parse(raw), null, indent);

export const minifyJson = (raw: string): string => JSON.stringify(JSON.parse(raw));

/** Throws when `raw` is not valid JSON, otherwise returns nothing. */
export const assertValidJson = (raw: string): void => {
  JSON.parse(raw);
};
