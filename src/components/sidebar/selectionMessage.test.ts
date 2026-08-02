import { describe, expect, it } from 'vitest';
import type { LucideIcon } from 'lucide-react';
import { ToolID, type ToolMetadata } from '../../types';
import { describeSidebarSelection } from './selectionMessage';

const iconStub = (() => null) as unknown as LucideIcon;

const makeTool = (id: ToolID, name: string): ToolMetadata => ({
  id,
  name,
  description: `${name} description`,
  icon: iconStub,
});

const tools = [
  makeTool(ToolID.JSON_FORMATTER, 'JSON Formatter'),
  makeTool(ToolID.XML_FORMATTER, 'XML Formatter'),
  makeTool(ToolID.BASE64_TOOL, 'Base64 Tool'),
];

describe('describeSidebarSelection', () => {
  it('names the tool and its position, counting from one', () => {
    expect(describeSidebarSelection(tools, 0)).toBe('JSON Formatter, 1 of 3');
    expect(describeSidebarSelection(tools, 2)).toBe('Base64 Tool, 3 of 3');
  });

  it('says nothing before the first arrow key', () => {
    // selectedIndex starts at -1; announcing then would interrupt the user unprompted.
    expect(describeSidebarSelection(tools, -1)).toBe('');
  });

  it('says nothing when the index outruns the list', () => {
    // Filtering can shrink the list before selectedIndex is reset.
    expect(describeSidebarSelection(tools, 7)).toBe('');
  });

  it('says nothing when there is nothing to select', () => {
    expect(describeSidebarSelection([], 0)).toBe('');
  });
});
