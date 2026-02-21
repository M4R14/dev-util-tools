export const encodeUnicodeToBase64 = (value: string): string => {
  const escaped = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, p1: string) =>
    String.fromCharCode(parseInt(p1, 16)),
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
