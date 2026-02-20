export interface UrlParam {
  key: string;
  value: string;
}

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

  const nextParams = [...currentParams];
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

  const nextParams = [...currentParams, { key: newKey, value: newValue }];

  return buildUrlWithParams(parsedUrl, nextParams);
};

export const removeUrlParam = (
  parsedUrl: URL | null,
  currentParams: UrlParam[],
  index: number
): string | null => {
  if (!parsedUrl) return null;
  if (index < 0 || index >= currentParams.length) return null;

  const nextParams = currentParams.filter((_, paramIndex) => paramIndex !== index);

  return buildUrlWithParams(parsedUrl, nextParams);
};
