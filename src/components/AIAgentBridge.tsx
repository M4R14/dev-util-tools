import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ToolLayout from './ui/ToolLayout';
import {
  AI_BRIDGE_SCHEMA,
  AI_TOOL_CATALOG,
  AI_TOOL_OPERATIONS,
  AIToolRequest,
  AIToolResponse,
  runAITool,
} from '../lib/aiToolBridge';

interface AIBridgeWindow {
  catalog: () => typeof AI_TOOL_CATALOG;
  run: (request: AIToolRequest) => AIToolResponse;
}

declare global {
  interface Window {
    DevPulseAI?: AIBridgeWindow;
  }
}

const parsePayloadParam = (payloadParam: string | null): AIToolRequest | null => {
  if (!payloadParam) return null;
  try {
    return JSON.parse(payloadParam) as AIToolRequest;
  } catch {
    return null;
  }
};

const parseQueryRequest = (params: URLSearchParams): AIToolRequest | null => {
  const payloadRequest = parsePayloadParam(params.get('payload'));
  if (payloadRequest) return payloadRequest;

  const tool = params.get('tool');
  const operation = params.get('op');
  if (!tool || !operation) return null;

  const input = params.get('input') ?? '';
  const optionsRaw = params.get('options');
  let options: Record<string, unknown> | undefined;
  if (optionsRaw) {
    try {
      const parsed = JSON.parse(optionsRaw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        options = parsed as Record<string, unknown>;
      }
    } catch {
      options = undefined;
    }
  }

  return { tool: tool as AIToolRequest['tool'], operation, input, options };
};

const AIAgentBridge: React.FC = () => {
  const [params] = useSearchParams();
  const location = useLocation();
  const [response, setResponse] = useState<AIToolResponse | null>(null);

  useEffect(() => {
    window.DevPulseAI = {
      catalog: () => AI_TOOL_CATALOG,
      run: (request: AIToolRequest) => runAITool(request),
    };

    return () => {
      delete window.DevPulseAI;
    };
  }, []);

  const request = useMemo(() => parseQueryRequest(params), [params]);
  const mode = params.get('mode') === 'result-only' ? 'result-only' : 'full';
  const includeCatalog = params.get('includeCatalog') !== 'false';
  const isCatalogEndpoint = location.pathname.endsWith('/catalog');
  const isSpecEndpoint = location.pathname.endsWith('/spec');

  useEffect(() => {
    if (isCatalogEndpoint || isSpecEndpoint) {
      setResponse(null);
      return;
    }
    if (!request) {
      setResponse(null);
      return;
    }
    setResponse(runAITool(request));
  }, [isCatalogEndpoint, isSpecEndpoint, request]);

  const responseText = useMemo(
    () => {
      if (isCatalogEndpoint) {
        return JSON.stringify(
          {
            endpoint: '/ai-bridge/catalog',
            catalog: AI_TOOL_CATALOG,
            operations: AI_TOOL_OPERATIONS,
          },
          null,
          2,
        );
      }

      if (isSpecEndpoint) {
        return JSON.stringify(
          {
            endpoint: '/ai-bridge/spec',
            schema: AI_BRIDGE_SCHEMA,
          },
          null,
          2,
        );
      }

      if (mode === 'result-only') {
        return JSON.stringify(
          response?.ok
            ? { ok: true, result: response.result }
            : {
                ok: false,
                error: response?.error ?? 'No request provided',
                errorDetails: response?.errorDetails,
              },
          null,
          2,
        );
      }

      return JSON.stringify(
        {
          endpoint: '/ai-bridge',
          request,
          response,
          ...(includeCatalog ? { catalog: AI_TOOL_CATALOG } : {}),
        },
        null,
        2,
      );
    },
    [includeCatalog, isCatalogEndpoint, isSpecEndpoint, mode, request, response],
  );

  return (
    <ToolLayout title="AI Agent Bridge">
      <div className="max-w-5xl mx-auto space-y-4">
        <p className="text-sm text-muted-foreground">
          Machine-readable bridge for AI/browser agents via query params and{' '}
          <code>window.DevPulseAI.run()</code>.
        </p>
        <p className="text-xs text-muted-foreground">
          Endpoints: <code>/ai-bridge</code>, <code>/ai-bridge/catalog</code>,{' '}
          <code>/ai-bridge/spec</code>. Query options: <code>mode=result-only</code>,{' '}
          <code>includeCatalog=false</code>.
        </p>
        <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
          <li>
            <code>/ai-bridge</code>: execute tool requests and return runtime result/error.
          </li>
          <li>
            <code>/ai-bridge/catalog</code>: return only available tools and supported operations
            (discovery endpoint).
          </li>
          <li>
            <code>/ai-bridge/spec</code>: return JSON Schema for request/response contracts
            (machine validation endpoint).
          </li>
        </ul>
        <section className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
          <h3 className="text-sm font-semibold">Endpoint Usage</h3>
          <pre className="text-xs overflow-auto">
{`1) /ai-bridge
Use for real execution of a tool request.
Example:
/ai-bridge?tool=json-formatter&op=format&input={"a":1}

2) /ai-bridge/catalog
Use for discovery (which tools/operations exist) before running anything.
Example:
/ai-bridge/catalog

3) /ai-bridge/spec
Use for machine validation of request/response structure via JSON Schema.
Example:
/ai-bridge/spec`}
          </pre>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
            <h3 className="text-sm font-semibold">Quickstart</h3>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
              <li>Open this page at <code>/ai-bridge</code>.</li>
              <li>Read available tools with <code>window.DevPulseAI.catalog()</code>.</li>
              <li>Run tool operations with <code>window.DevPulseAI.run(request)</code>.</li>
            </ol>
          </section>
          <section className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
            <h3 className="text-sm font-semibold">Request Shape</h3>
            <pre className="text-xs overflow-auto">
{`{
  tool: 'json-formatter' | 'xml-formatter' | 'base64-tool' | 'case-converter' | 'url-parser' | 'diff-viewer' | 'thai-date-converter',
  operation: string,
  input?: unknown,
  options?: Record<string, unknown>
}`}
            </pre>
          </section>
        </div>
        <section className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
          <h3 className="text-sm font-semibold">Examples</h3>
          <pre className="text-xs overflow-auto">
{`// Browser API
window.DevPulseAI.run({
  tool: 'json-formatter',
  operation: 'format',
  input: '{"a":1,"b":2}',
  options: { indent: 2 }
});

// Query mode
/ai-bridge?tool=case-converter&op=convert&input=hello%20world&options={"target":"snake"}
/ai-bridge?payload={"tool":"diff-viewer","operation":"compare","input":{"original":"a","modified":"b"}}`}
          </pre>
        </section>
        <pre
          id="ai-bridge-response"
          className="rounded-xl border border-border bg-muted/30 p-4 text-xs overflow-auto"
        >
          {responseText}
        </pre>
      </div>
    </ToolLayout>
  );
};

export default AIAgentBridge;
