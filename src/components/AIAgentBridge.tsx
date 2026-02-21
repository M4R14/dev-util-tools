import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Braces, TerminalSquare } from 'lucide-react';
import ToolLayout from './ui/ToolLayout';
import SnippetCard from './ui/SnippetCard';
import {
  getAIToolSnapshot,
  AI_BRIDGE_SCHEMA,
  AI_TOOL_CATALOG,
  AI_TOOL_OPERATIONS,
  AIToolRequest,
  AIToolResponse,
  runAITool,
  runAIToolBatch,
} from '../lib/aiToolBridge';
import {
  QUERY_EXAMPLE_SNIPPET,
  QUERY_TEMPLATES,
  REQUEST_SHAPE_SNIPPET,
  WINDOW_API_SNIPPET,
  type BridgeEndpointPath,
} from '../data/aiBridge';
import { normalizeQueryInput, parseQueryRequest } from '../lib/aiBridgeQuery';
import {
  BridgeHeroCard,
  EndpointNavigatorCard,
  ExecutionModesCard,
  LiveResponseCard,
  QuickstartCard,
  RunQueryCard,
} from './ai-bridge';

interface AIBridgeWindow {
  catalog: () => typeof AI_TOOL_CATALOG;
  run: (request: AIToolRequest) => AIToolResponse;
  runBatch: (requests: AIToolRequest[]) => AIToolResponse[];
  getSnapshot: () => ReturnType<typeof getAIToolSnapshot>;
}

declare global {
  interface Window {
    DevPulseAI?: AIBridgeWindow;
  }
}

const AIAgentBridge: React.FC = () => {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [response, setResponse] = useState<AIToolResponse | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [queryError, setQueryError] = useState<string | null>(null);

  const request = useMemo(() => parseQueryRequest(params), [params]);
  const mode = params.get('mode') === 'result-only' ? 'result-only' : 'full';
  const includeCatalog = params.get('includeCatalog') !== 'false';

  const isCatalogEndpoint = location.pathname.endsWith('/catalog');
  const isSpecEndpoint = location.pathname.endsWith('/spec');
  const isExecuteEndpoint = location.pathname === '/ai-bridge';
  const isResultOnlyExecute = isExecuteEndpoint && mode === 'result-only';

  useEffect(() => {
    window.DevPulseAI = {
      catalog: () => AI_TOOL_CATALOG,
      run: (toolRequest: AIToolRequest) => runAITool(toolRequest),
      runBatch: (toolRequests: AIToolRequest[]) => runAIToolBatch(toolRequests),
      getSnapshot: () => getAIToolSnapshot(),
    };
    return () => {
      delete window.DevPulseAI;
    };
  }, []);

  useEffect(() => {
    if (isCatalogEndpoint || isSpecEndpoint || !request) {
      setResponse(null);
      return;
    }
    setResponse(runAITool(request));
  }, [isCatalogEndpoint, isSpecEndpoint, request]);

  const responseText = useMemo(() => {
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
          : { ok: false, error: response?.error ?? 'No request provided', errorDetails: response?.errorDetails },
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
  }, [includeCatalog, isCatalogEndpoint, isSpecEndpoint, mode, request, response]);

  useEffect(() => {
    setQueryInput(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  const handleRunQuery = () => {
    const { target, error } = normalizeQueryInput(queryInput, location.pathname);
    if (error) {
      setQueryError(error);
      return;
    }
    if (!target) return;

    setQueryError(null);
    if (target.endsWith('.json')) {
      window.location.assign(target);
      return;
    }
    navigate(target);
  };

  const handleSwitchEndpoint = (nextPath: BridgeEndpointPath) => {
    if (nextPath === '/ai-bridge') {
      const q = params.toString();
      navigate(q ? `${nextPath}?${q}` : nextPath);
      return;
    }
    navigate(nextPath);
  };

  const handleSetExecuteQueryOption = (key: 'mode' | 'includeCatalog', value?: string) => {
    const nextParams = new URLSearchParams(params);
    if (value === undefined) nextParams.delete(key);
    else nextParams.set(key, value);
    const next = nextParams.toString();
    navigate(next ? `/ai-bridge?${next}` : '/ai-bridge');
  };

  if (isResultOnlyExecute) {
    return (
      <ToolLayout title="AI Agent Bridge">
        <div className="max-w-5xl mx-auto">
          <pre
            id="ai-bridge-output"
            data-testid="ai-bridge-output"
            className="rounded-md border border-border/80 bg-background/70 p-4 text-xs overflow-auto whitespace-pre-wrap break-words"
          >
            {responseText}
          </pre>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout title="AI Agent Bridge">
      <div className="max-w-7xl mx-auto space-y-5">
        <BridgeHeroCard />

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-4 space-y-4">
            <EndpointNavigatorCard currentPath={location.pathname} onSwitch={handleSwitchEndpoint} />
            <ExecutionModesCard
              mode={mode}
              includeCatalog={includeCatalog}
              disabled={!isExecuteEndpoint}
              onSetOption={handleSetExecuteQueryOption}
            />
            <QuickstartCard />
          </div>

          <div className="xl:col-span-8 space-y-4">
            <RunQueryCard
              queryInput={queryInput}
              queryError={queryError}
              templates={QUERY_TEMPLATES}
              onQueryInputChange={setQueryInput}
              onRun={handleRunQuery}
              onReset={() => {
                setQueryInput('/ai-bridge');
                setQueryError(null);
              }}
              onPickTemplate={(value) => {
                setQueryInput(value);
                setQueryError(null);
              }}
            />
            <LiveResponseCard
              responseText={responseText}
              responseKey={`${location.pathname}${location.search}`}
            />
          </div>
        </div>

        <div className="space-y-4">
          <SnippetCard
            icon={<Braces className="h-4 w-4 text-primary" />}
            title="Request Shape"
            description="โครงสร้าง input มาตรฐาน"
            code={REQUEST_SHAPE_SNIPPET}
            language="javascript"
          />
          <SnippetCard
            icon={<TerminalSquare className="h-4 w-4 text-primary" />}
            title="window.DevPulseAI"
            description="Browser API สำหรับ agent orchestration"
            code={WINDOW_API_SNIPPET}
            language="javascript"
          />
          <SnippetCard
            icon={<BookOpen className="h-4 w-4 text-primary" />}
            title="Query Examples"
            description="ตัวอย่าง URL สำหรับ automation/script"
            code={QUERY_EXAMPLE_SNIPPET}
            language="bash"
          />
        </div>
      </div>
    </ToolLayout>
  );
};

export default AIAgentBridge;
