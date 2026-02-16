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

export const updateUrlParam = (
  parsedUrl: URL | null,
  currentParams: UrlParam[],
  index: number,
  newKey: string,
  newValue: string
): string | null => {
  if (!parsedUrl) return null;

  // Create new params array
  const nextParams = [...currentParams];
  nextParams[index] = { key: newKey, value: newValue };

  // Update URL search string
  const newSearchParams = new URLSearchParams();
  nextParams.forEach((p) => {
    if (p.key) newSearchParams.append(p.key, p.value);
  });

  const newUrl = new URL(parsedUrl.toString());
  newUrl.search = newSearchParams.toString();

  return newUrl.toString();
};
