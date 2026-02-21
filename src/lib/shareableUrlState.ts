import { z } from 'zod';

export type ShareableQueryParam = {
  key: string;
  value: string | null | undefined;
  defaultValue?: string;
};

const shareableQueryParamSchema = z.object({
  key: z.string().min(1),
  value: z.string().nullable().optional(),
  defaultValue: z.string().optional(),
});
const shareableQueryParamsSchema = z.array(shareableQueryParamSchema);
const queryStringSchema = z.string();

const normalizeValue = (value: string | null | undefined) => value ?? '';

export const buildShareableSearchParams = (
  currentQuery: string,
  params: ShareableQueryParam[],
): URLSearchParams => {
  const parsedCurrentQuery = queryStringSchema.parse(currentQuery);
  const parsedParams = shareableQueryParamsSchema.parse(params);
  const nextParams = new URLSearchParams(parsedCurrentQuery);

  for (const param of parsedParams) {
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
