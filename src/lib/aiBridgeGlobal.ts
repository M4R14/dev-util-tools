import type {
  AIToolBatchOptions,
  AIToolBatchResponse,
  AIToolCatalogItem,
  AIToolRequest,
  AIToolResponse,
} from './aiToolBridge';

/**
 * `window.DevPulseAI` — the entry point browser-driving agents use.
 *
 * Two deliberate choices:
 *
 * 1. **Installed for the whole app, not just `/ai-bridge`.** It used to live in that route's
 *    component and was deleted on unmount, so an agent that navigated anywhere else lost the API
 *    mid-task.
 *
 * 2. **The methods are async and load the runner on first call.** The tool runners pull in
 *    xml-formatter, simple-xml-to-json, diff and dayjs — roughly 10 kB gzipped that every visitor
 *    would otherwise download for a feature only agents use. Lazy-importing keeps the API present
 *    everywhere without putting that in the eager bundle.
 *
 * The object exists from app start, so presence is the readiness check. `devpulse-ai-ready` is
 * dispatched as well for agents that would rather listen than poll.
 */

export const AI_BRIDGE_READY_EVENT = 'devpulse-ai-ready';

export interface DevPulseAIApi {
  /** Bumped when the shape of this object changes. */
  version: number;
  catalog: () => Promise<AIToolCatalogItem[]>;
  /** One tool's catalog entry — cheaper to read than the whole catalog. */
  describe: (tool: string) => Promise<AIToolCatalogItem>;
  run: (request: AIToolRequest) => Promise<AIToolResponse>;
  runBatch: (
    requests: AIToolRequest[],
    options?: AIToolBatchOptions,
  ) => Promise<AIToolBatchResponse[]>;
}

declare global {
  interface Window {
    DevPulseAI?: DevPulseAIApi;
  }
}

const loadBridge = () => import('./aiToolBridge');

const api: DevPulseAIApi = {
  version: 2,
  catalog: async () => (await loadBridge()).AI_TOOL_CATALOG,
  describe: async (tool) => (await loadBridge()).describeAITool(tool),
  run: async (request) => (await loadBridge()).runAITool(request),
  runBatch: async (requests, options) => (await loadBridge()).runAIToolBatch(requests, options),
};

/** Installs the API and returns a teardown function. */
export const installDevPulseAI = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  window.DevPulseAI = api;
  window.dispatchEvent(new CustomEvent(AI_BRIDGE_READY_EVENT));

  return () => {
    if (window.DevPulseAI === api) {
      delete window.DevPulseAI;
    }
  };
};
