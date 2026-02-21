import type { ToolErrorCode } from './types';

export interface ToolErrorTaxonomyEntry {
  status: number;
  title: string;
  type: string;
}

export const ERROR_TAXONOMY: Record<
  ToolErrorCode,
  ToolErrorTaxonomyEntry
> = {
  UNSUPPORTED_TOOL: {
    status: 400,
    title: 'Unsupported Tool',
    type: 'https://devpulse.ai/problems/unsupported_tool',
  },
  UNSUPPORTED_OPERATION: {
    status: 400,
    title: 'Unsupported Operation',
    type: 'https://devpulse.ai/problems/unsupported_operation',
  },
  INVALID_OPTION: {
    status: 400,
    title: 'Invalid Option',
    type: 'https://devpulse.ai/problems/invalid_option',
  },
  INVALID_INPUT: {
    status: 400,
    title: 'Invalid Input',
    type: 'https://devpulse.ai/problems/invalid_input',
  },
  INVALID_REQUEST: {
    status: 400,
    title: 'Invalid Request',
    type: 'https://devpulse.ai/problems/invalid_request',
  },
  EXECUTION_ERROR: {
    status: 500,
    title: 'AI Bridge Execution Error',
    type: 'https://devpulse.ai/problems/execution_error',
  },
};
