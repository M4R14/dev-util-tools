/**
 * Unicode-safe Base64 transforms shared by the tool UI (`useBase64`) and the AI bridge
 * (`handlers/base64Tool`). `btoa`/`atob` only handle Latin-1, so text is percent-escaped
 * first — without this, Thai (and any non-ASCII) input throws.
 *
 * Both functions throw on invalid input; callers decide how to present the failure.
 */

export const encodeUnicodeToBase64 = (value: string): string => {
  const escaped = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

  return btoa(escaped);
};

export const decodeUnicodeFromBase64 = (value: string): string => {
  const decoded = atob(value);
  const escaped = decoded
    .split('')
    .map((char) => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`)
    .join('');

  return decodeURIComponent(escaped);
};
