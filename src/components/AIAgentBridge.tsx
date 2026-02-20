import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Braces, Compass, Play, TerminalSquare, Workflow } from 'lucide-react';
import ToolLayout from './ui/ToolLayout';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { CopyButton } from './ui/CopyButton';
import { Textarea } from './ui/Textarea';
import { CodeHighlight } from './ui/CodeHighlight';
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

const QUERY_TEMPLATES = [
  {
    label: 'JSON Format',
    value: '/ai-bridge?tool=json-formatter&op=format&input={"name":"devpulse","ok":true}',
  },
  {
    label: 'Base64 Encode',
    value: '/ai-bridge?tool=base64-tool&op=encode&input=hello%20world',
  },
  {
    label: 'URL Parse',
    value: '/ai-bridge?tool=url-parser&op=parse&input=https://example.com/path?a=1',
  },
  {
    label: 'Diff Compare',
    value:
      '/ai-bridge?payload={"tool":"diff-viewer","operation":"compare","input":{"original":"a","modified":"b"}}',
  },
] as const;

const ENDPOINT_SPECS = [
  {
    path: '/ai-bridge',
    title: 'Execution Endpoint',
    summary: 'Run a tool request and return runtime result/error.',
  },
  {
    path: '/ai-bridge/catalog',
    title: 'Discovery Endpoint',
    summary: 'Return available tools and supported operations only.',
  },
  {
    path: '/ai-bridge/spec',
    title: 'Schema Endpoint',
    summary: 'Return JSON Schema for request/response contracts.',
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

interface SnippetCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  code: string;
  language: 'json' | 'xml' | 'javascript' | 'bash' | 'plaintext';
}

const SnippetCard: React.FC<SnippetCardProps> = ({ icon, title, description, code, language }) => {
  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
        <CopyButton value={code} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border border-border/80 bg-background/70 p-3">
          <CodeHighlight code={code} language={language} className="text-xs" />
        </div>
      </CardContent>
    </Card>
  );
};

const AIAgentBridge: React.FC = () => {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [response, setResponse] = useState<AIToolResponse | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [queryError, setQueryError] = useState<string | null>(null);

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
  const isExecuteEndpoint = location.pathname === '/ai-bridge';

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
  }, [includeCatalog, isCatalogEndpoint, isSpecEndpoint, mode, request, response]);

  useEffect(() => {
    setQueryInput(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  const handleRunQuery = () => {
    const raw = queryInput.trim();
    if (!raw) return;

    let target = raw;

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const parsed = new URL(raw);
        target = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        setQueryError('Invalid URL format');
        return;
      }
    } else if (raw.startsWith('?')) {
      target = `${location.pathname}${raw}`;
    } else if (raw.startsWith('tool=') || raw.startsWith('payload=')) {
      target = `/ai-bridge?${raw}`;
    } else if (raw === '/catalog' || raw === 'catalog') {
      target = '/ai-bridge/catalog';
    } else if (raw === '/spec' || raw === 'spec') {
      target = '/ai-bridge/spec';
    }

    if (!target.startsWith('/ai-bridge')) {
      setQueryError('Query must target /ai-bridge, /ai-bridge/catalog, or /ai-bridge/spec');
      return;
    }

    setQueryError(null);
    navigate(target);
  };

  const handleSwitchEndpoint = (nextPath: '/ai-bridge' | '/ai-bridge/catalog' | '/ai-bridge/spec') => {
    if (nextPath === '/ai-bridge') {
      const q = params.toString();
      navigate(q ? `${nextPath}?${q}` : nextPath);
      return;
    }
    navigate(nextPath);
  };

  const handleSetExecuteQueryOption = (key: 'mode' | 'includeCatalog', value?: string) => {
    const nextParams = new URLSearchParams(params);
    if (value === undefined) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    const next = nextParams.toString();
    navigate(next ? `/ai-bridge?${next}` : '/ai-bridge');
  };

  return (
    <ToolLayout title="AI Agent Bridge">
      <div className="max-w-7xl mx-auto space-y-5">
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

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-4 space-y-4">
            <Card className="bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Endpoint Navigator</CardTitle>
                <CardDescription className="text-xs">
                  Endpoint ปัจจุบัน: <code>{location.pathname}</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {ENDPOINT_SPECS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                        isActive
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-border/80 bg-background/60 hover:bg-muted/40',
                      )}
                      onClick={() =>
                        handleSwitchEndpoint(item.path as '/ai-bridge' | '/ai-bridge/catalog' | '/ai-bridge/spec')
                      }
                    >
                      <div className="text-xs font-semibold text-foreground">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        <code>{item.path}</code>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">{item.summary}</div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Execution Modes</CardTitle>
                <CardDescription className="text-xs">
                  Mode: <code>{mode}</code> | includeCatalog: <code>{String(includeCatalog)}</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={mode === 'full' ? 'default' : 'outline'}
                    disabled={!isExecuteEndpoint}
                    onClick={() => handleSetExecuteQueryOption('mode', undefined)}
                  >
                    mode=full
                  </Button>
                  <Button
                    size="sm"
                    variant={mode === 'result-only' ? 'default' : 'outline'}
                    disabled={!isExecuteEndpoint}
                    onClick={() => handleSetExecuteQueryOption('mode', 'result-only')}
                  >
                    mode=result-only
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant={includeCatalog ? 'default' : 'outline'}
                  disabled={!isExecuteEndpoint}
                  onClick={() =>
                    handleSetExecuteQueryOption('includeCatalog', includeCatalog ? 'false' : undefined)
                  }
                >
                  includeCatalog={includeCatalog ? 'true' : 'false'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" />
                  Quickstart
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
                  <li>
                    เปิด <code>/ai-bridge</code> เพื่อ initialize <code>window.DevPulseAI</code>
                  </li>
                  <li>เรียก <code>window.DevPulseAI.catalog()</code> เพื่อดูความสามารถ</li>
                  <li>ส่ง query หรือใช้ <code>window.DevPulseAI.run(request)</code></li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-8 space-y-4">
            <Card className="bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  Run Query
                </CardTitle>
                <CardDescription className="text-xs">
                  รองรับทั้งแบบเต็ม <code>/ai-bridge?tool=...</code>, แบบ query ล้วน{' '}
                  <code>tool=...</code>, หรือ shortcut <code>catalog/spec</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Textarea
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleRunQuery();
                    }
                  }}
                  placeholder="/ai-bridge?tool=json-formatter&op=format&input=%7B%22a%22%3A1%7D"
                  className="min-h-[88px] font-mono text-xs"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleRunQuery}>
                    Run Query
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setQueryInput('/ai-bridge');
                      setQueryError(null);
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUERY_TEMPLATES.map((template) => (
                    <Button
                      key={template.label}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setQueryInput(template.value);
                        setQueryError(null);
                      }}
                    >
                      {template.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: กด <code>Cmd/Ctrl + Enter</code> เพื่อ Run ได้ทันที
                </p>
                {queryError && <p className="text-xs text-destructive">{queryError}</p>}
              </CardContent>
            </Card>

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
                <div className="rounded-md border border-border/80 bg-background/70 p-3 min-h-[380px]">
                  <CodeHighlight
                    code={responseText}
                    language="json"
                    className="text-xs"
                    key={`${location.pathname}${location.search}`}
                  />
                </div>
              </CardContent>
            </Card>
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
