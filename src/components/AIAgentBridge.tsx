import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { BookOpen, Braces, Compass, TerminalSquare, Workflow } from 'lucide-react';
import ToolLayout from './ui/ToolLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { CopyButton } from './ui/CopyButton';
import { cn } from '../lib/utils';
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

const REQUEST_SHAPE_SNIPPET = `{
  tool: 'json-formatter' | 'xml-formatter' | 'base64-tool' | 'case-converter' | 'url-parser' | 'diff-viewer' | 'thai-date-converter',
  operation: string,
  input?: unknown,
  options?: Record<string, unknown>
}`;

const WINDOW_API_SNIPPET = `// Important: open /ai-bridge first so window.DevPulseAI is initialized.
const catalog = window.DevPulseAI.catalog();

const response = window.DevPulseAI.run({
  tool: 'url-parser',
  operation: 'parse',
  input: 'https://example.com/path?a=1'
});

if (response.ok) {
  console.log(response.result);
} else {
  console.error(response.error, response.errorDetails);
}`;

const QUERY_EXAMPLE_SNIPPET = `/ai-bridge?tool=json-formatter&op=format&input={"a":1}
/ai-bridge?tool=case-converter&op=convert&input=hello%20world&options={"target":"snake"}
/ai-bridge?payload={"tool":"diff-viewer","operation":"compare","input":{"original":"a","modified":"b"}}
/ai-bridge?tool=url-parser&op=parse&input=example.com&mode=result-only
/ai-bridge?tool=json-formatter&op=format&input={"a":1}&includeCatalog=false`;

const ENDPOINT_SPECS = [
  {
    path: '/ai-bridge',
    title: 'Execution Endpoint',
    summary: 'Run a tool request and return runtime result/error.',
    usage: 'Use when agent needs real execution output.',
    example: '/ai-bridge?tool=json-formatter&op=format&input={"a":1}',
  },
  {
    path: '/ai-bridge/catalog',
    title: 'Discovery Endpoint',
    summary: 'Return available tools and supported operations only.',
    usage: 'Use before planning calls to avoid invalid tool/operation.',
    example: '/ai-bridge/catalog',
  },
  {
    path: '/ai-bridge/spec',
    title: 'Schema Endpoint',
    summary: 'Return JSON Schema for request/response contracts.',
    usage: 'Use for machine validation and contract-aware prompting.',
    example: '/ai-bridge/spec',
  },
] as const;

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
      <div className="max-w-6xl mx-auto space-y-5">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Workflow className="h-4 w-4 text-primary" />
              AI Agent Bridge
            </CardTitle>
            <CardDescription>
              Bridge สำหรับ AI/browser agents โดยรองรับ query execution, capability discovery และ
              schema validation ในหน้าเดียว
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Query options: <code>mode=result-only</code>, <code>includeCatalog=false</code>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {ENDPOINT_SPECS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Card
                key={item.path}
                className={cn(isActive ? 'border-primary/40 bg-primary/5' : 'bg-muted/20')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                  <CardDescription className="text-xs">
                    <code>{item.path}</code>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-xs text-muted-foreground">
                  <p>{item.summary}</p>
                  <p>{item.usage}</p>
                  <div className="rounded-md border border-border/80 bg-background/60 p-2">
                    <div className="font-medium text-foreground mb-1">Example</div>
                    <code className="break-all">{item.example}</code>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                Quickstart
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
                <li>เปิดหน้า <code>/ai-bridge</code> เพื่อ initialize `window.DevPulseAI`</li>
                <li>เรียก <code>window.DevPulseAI.catalog()</code> เพื่อดู tool/operation</li>
                <li>ส่ง request ด้วย <code>window.DevPulseAI.run(request)</code></li>
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-muted/20">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Braces className="h-4 w-4 text-primary" />
                  Request Shape
                </CardTitle>
                <CardDescription className="text-xs">โครงสร้าง input มาตรฐาน</CardDescription>
              </div>
              <CopyButton value={REQUEST_SHAPE_SNIPPET} />
            </CardHeader>
            <CardContent className="pt-0">
              <pre className="text-xs overflow-auto rounded-md border border-border/80 bg-background/70 p-3">
                {REQUEST_SHAPE_SNIPPET}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-muted/20">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TerminalSquare className="h-4 w-4 text-primary" />
                  window.DevPulseAI
                </CardTitle>
                <CardDescription className="text-xs">
                  Browser API สำหรับ agent orchestration
                </CardDescription>
              </div>
              <CopyButton value={WINDOW_API_SNIPPET} />
            </CardHeader>
            <CardContent className="pt-0">
              <pre className="text-xs overflow-auto rounded-md border border-border/80 bg-background/70 p-3">
                {WINDOW_API_SNIPPET}
              </pre>
            </CardContent>
          </Card>

          <Card className="bg-muted/20">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Query Examples
                </CardTitle>
                <CardDescription className="text-xs">
                  ตัวอย่าง URL สำหรับ automation/script
                </CardDescription>
              </div>
              <CopyButton value={QUERY_EXAMPLE_SNIPPET} />
            </CardHeader>
            <CardContent className="pt-0">
              <pre className="text-xs overflow-auto rounded-md border border-border/80 bg-background/70 p-3">
                {QUERY_EXAMPLE_SNIPPET}
              </pre>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/20">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm">Live Response</CardTitle>
              <CardDescription className="text-xs">
                JSON output ตาม endpoint/query ปัจจุบัน
              </CardDescription>
            </div>
            <CopyButton value={responseText} />
          </CardHeader>
          <CardContent className="pt-0">
            <pre
              id="ai-bridge-response"
              className="rounded-md border border-border/80 bg-background/70 p-3 text-xs overflow-auto"
            >
              {responseText}
            </pre>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default AIAgentBridge;
