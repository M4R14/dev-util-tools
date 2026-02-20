import { describe, it, expect } from 'vitest';
import { getToolById } from './data/tools';
import { ToolID } from './types';

interface ToolSmokeCase {
  id: ToolID;
  expectedName: string;
  load: () => Promise<{ default: unknown }>;
}

const MAIN_TOOL_SMOKE_CASES: ToolSmokeCase[] = [
  {
    id: ToolID.JSON_FORMATTER,
    expectedName: 'JSON Formatter',
    load: () => import('./components/tools/JSONFormatter'),
  },
  {
    id: ToolID.UUID_GENERATOR,
    expectedName: 'UUID Generator',
    load: () => import('./components/tools/UUIDGenerator'),
  },
  {
    id: ToolID.URL_PARSER,
    expectedName: 'URL Parser & Encoder',
    load: () => import('./components/tools/UrlParser'),
  },
  {
    id: ToolID.DIFF_VIEWER,
    expectedName: 'Diff Viewer',
    load: () => import('./components/tools/DiffViewer'),
  },
  {
    id: ToolID.PASSWORD_GEN,
    expectedName: 'Password Generator',
    load: () => import('./components/tools/PasswordGenerator'),
  },
];

describe('Main tool page smoke tests', () => {
  it.each(MAIN_TOOL_SMOKE_CASES)('loads module and registry for $id', async ({ id, expectedName, load }) => {
    const module = await load();
    expect(typeof module.default).toBe('function');

    const tool = getToolById(id);
    expect(tool).toBeDefined();
    expect(tool?.name).toBe(expectedName);
    expect(`/${tool?.id}`).toBe(`/${id}`);
  });
});
