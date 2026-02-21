import type { AIToolRequest } from './aiToolBridge';
import { z } from 'zod';

const aiToolRequestSchema = z.object({
  tool: z.string().min(1),
  operation: z.string().min(1),
  input: z.unknown().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
});

const queryOptionsSchema = z.record(z.string(), z.unknown());
const nonEmptyStringSchema = z.string().min(1);

export const parsePayloadParam = (payloadParam: string | null): AIToolRequest | null => {
  if (!payloadParam) return null;
  try {
    const parsed = aiToolRequestSchema.safeParse(JSON.parse(payloadParam));
    if (!parsed.success) {
      return null;
    }
    return parsed.data as AIToolRequest;
  } catch {
    return null;
  }
};

export const parseQueryRequest = (params: URLSearchParams): AIToolRequest | null => {
  const payloadRequest = parsePayloadParam(params.get('payload'));
  if (payloadRequest) return payloadRequest;

  const tool = params.get('tool');
  const operation = params.get('op');
  if (!nonEmptyStringSchema.safeParse(tool).success || !nonEmptyStringSchema.safeParse(operation).success) {
    return null;
  }

  const input = params.get('input') ?? '';
  const optionsRaw = params.get('options');
  let options: Record<string, unknown> | undefined;
  if (optionsRaw) {
    try {
      const parsed = queryOptionsSchema.safeParse(JSON.parse(optionsRaw));
      if (parsed.success) {
        options = parsed.data;
      }
    } catch {
      options = undefined;
    }
  }

  return { tool: tool as AIToolRequest['tool'], operation, input, options };
};

export const normalizeQueryInput = (
  rawInput: string,
  currentPath: string,
): { target?: string; error?: string } => {
  const raw = rawInput.trim();
  if (!raw) return {};

  let target = raw;
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const parsed = new URL(raw);
      target = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return { error: 'Invalid URL format' };
    }
  } else if (raw.startsWith('?')) {
    target = `${currentPath}${raw}`;
  } else if (raw.startsWith('tool=') || raw.startsWith('payload=')) {
    target = `/ai-bridge?${raw}`;
  } else if (raw === '/catalog' || raw === 'catalog') {
    target = '/ai-bridge/catalog';
  } else if (raw === '/spec' || raw === 'spec') {
    target = '/ai-bridge/spec';
  } else if (raw === '/catalog.json' || raw === 'catalog.json') {
    target = '/ai-bridge/catalog.json';
  } else if (raw === '/spec.json' || raw === 'spec.json') {
    target = '/ai-bridge/spec.json';
  }

  const aiBridgeIndex = target.indexOf('/ai-bridge');
  if (aiBridgeIndex > 0) {
    target = target.slice(aiBridgeIndex);
  }

  if (!target.startsWith('/ai-bridge')) {
    return { error: 'Query must target /ai-bridge, /ai-bridge/catalog, or /ai-bridge/spec' };
  }

  return { target };
};
