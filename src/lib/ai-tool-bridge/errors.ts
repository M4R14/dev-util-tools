import type { AIToolId, ToolErrorCode } from './types';

export class BridgeValidationError extends Error {
  code: ToolErrorCode;
  supportedOperations?: string[];
  supportedTools?: AIToolId[];
  didYouMean?: string;
  hints?: string[];
  status: number;

  constructor(
    message: string,
    details: {
      code: ToolErrorCode;
      supportedOperations?: string[];
      supportedTools?: AIToolId[];
      didYouMean?: string;
      hints?: string[];
      status?: number;
    },
  ) {
    super(message);
    this.name = 'BridgeValidationError';
    this.code = details.code;
    this.supportedOperations = details.supportedOperations;
    this.supportedTools = details.supportedTools;
    this.didYouMean = details.didYouMean;
    this.hints = details.hints;
    this.status = details.status ?? 400;
  }
}

export const getClosestMatch = (input: string, candidates: readonly string[]) => {
  const normalizedInput = input.trim().toLowerCase();
  if (!normalizedInput) {
    return candidates[0];
  }

  const levenshtein = (a: string, b: string) => {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
    );

    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    return matrix[a.length][b.length];
  };

  return candidates.reduce(
    (best, candidate) => {
      const score = levenshtein(normalizedInput, candidate.toLowerCase());
      return score < best.score ? { value: candidate, score } : best;
    },
    { value: candidates[0], score: Number.POSITIVE_INFINITY },
  ).value;
};

export const getOperationSuggestion = (operation: string, supportedOperations: readonly string[]) => {
  const lower = operation.toLowerCase();
  return (
    supportedOperations.find((op) => op.startsWith(lower)) ||
    supportedOperations.find((op) => op.includes(lower)) ||
    getClosestMatch(operation, supportedOperations)
  );
};
