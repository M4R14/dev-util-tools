import { z } from 'zod';

export interface UrlParam {
  key: string;
  value: string;
}

const urlParamSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const urlParamsSchema = z.array(urlParamSchema);
const nonNegativeIntSchema = z.number().int().nonnegative();

export const parseUrl = (input: string): { parsed: URL | null; error: string | null; params: UrlParam[] } => {
  if (!input) {
    return { parsed: null, error: null, params: [] };
  }

  try {
    let urlToCheck = input;

    // Basic check for protocol, assume https if missing for parsing purposes
    if (!input.match(/^[a-zA-Z][a-zA-Z\d+\-.]*:/)) {
      urlToCheck = 'https://' + input;
    }

    const url = new URL(urlToCheck);
    const params: UrlParam[] = [];
    url.searchParams.forEach((value, key) => {
      params.push({ key, value });
    });

    return { parsed: url, error: null, params };
  } catch {
    return { parsed: null, error: 'Invalid URL format', params: [] };
  }
};

const buildUrlWithParams = (parsedUrl: URL, nextParams: UrlParam[]): string => {
  const searchParams = new URLSearchParams();

  nextParams.forEach((param) => {
    if (param.key) {
      searchParams.append(param.key, param.value);
    }
  });

  const nextUrl = new URL(parsedUrl.toString());
  nextUrl.search = searchParams.toString();

  return nextUrl.toString();
};

export const updateUrlParam = (
  parsedUrl: URL | null,
  currentParams: UrlParam[],
  index: number,
  newKey: string,
  newValue: string
): string | null => {
  if (!parsedUrl) return null;
  if (!nonNegativeIntSchema.safeParse(index).success) return null;
  if (!z.string().safeParse(newKey).success || !z.string().safeParse(newValue).success) return null;

  const parsedParams = urlParamsSchema.safeParse(currentParams);
  if (!parsedParams.success) return null;

  const nextParams = [...parsedParams.data];
  nextParams[index] = { key: newKey, value: newValue };

  return buildUrlWithParams(parsedUrl, nextParams);
};

export const addUrlParam = (
  parsedUrl: URL | null,
  currentParams: UrlParam[],
  newKey: string,
  newValue: string
): string | null => {
  if (!parsedUrl) return null;
  if (!z.string().safeParse(newKey).success || !z.string().safeParse(newValue).success) return null;

  const parsedParams = urlParamsSchema.safeParse(currentParams);
  if (!parsedParams.success) return null;

  const nextParams = [...parsedParams.data, { key: newKey, value: newValue }];

  return buildUrlWithParams(parsedUrl, nextParams);
};

export const removeUrlParam = (
  parsedUrl: URL | null,
  currentParams: UrlParam[],
  index: number
): string | null => {
  if (!parsedUrl) return null;
  if (!nonNegativeIntSchema.safeParse(index).success) return null;

  const parsedParams = urlParamsSchema.safeParse(currentParams);
  if (!parsedParams.success) return null;
  if (index < 0 || index >= parsedParams.data.length) return null;

  const nextParams = parsedParams.data.filter((_, paramIndex) => paramIndex !== index);

  return buildUrlWithParams(parsedUrl, nextParams);
};
