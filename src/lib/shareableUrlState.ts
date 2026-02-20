export type ShareableQueryParam = {
  key: string;
  value: string | null | undefined;
  defaultValue?: string;
};

const normalizeValue = (value: string | null | undefined) => value ?? '';

export const buildShareableSearchParams = (
  currentQuery: string,
  params: ShareableQueryParam[],
): URLSearchParams => {
  const nextParams = new URLSearchParams(currentQuery);

  for (const param of params) {
    const value = normalizeValue(param.value);
    const shouldDelete =
      value.length === 0 || (param.defaultValue !== undefined && value === param.defaultValue);

    if (shouldDelete) {
      nextParams.delete(param.key);
      continue;
    }

    nextParams.set(param.key, value);
  }

  return nextParams;
};
