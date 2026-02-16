import { useMemo } from 'react';
import { ToolMetadata } from '../types';
import { TOOLS } from '../config/tools';

/**
 * Hook to filter tools based on a search term.
 * 
 * @param searchTerm The term to search for (case-insensitive)
 * @param tools Optional list of tools to search through. Defaults to all TOOLS.
 * @returns Filtered array of ToolMetadata
 */
export const useToolSearch = (searchTerm: string, tools: ToolMetadata[] = TOOLS): ToolMetadata[] => {
  return useMemo(() => {
    if (!searchTerm.trim()) {
      return tools;
    }

    const normalizedTerm = searchTerm.toLowerCase().trim();

    return tools.filter(tool => 
      tool.name.toLowerCase().includes(normalizedTerm) ||
      tool.description.toLowerCase().includes(normalizedTerm)
    );
  }, [searchTerm, tools]);
};
