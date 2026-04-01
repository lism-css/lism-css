import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { meta } from '../data/meta.js';

export const READ_ONLY_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

type ToolResult = {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
};

export function success(data: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ meta, ...data }, null, 2) }],
  };
}

export function notFound(message: string, extra?: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ meta, error: message, ...extra }, null, 2) }],
  };
}

export function error(message: string, extra?: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ meta, error: message, ...extra }, null, 2) }],
    isError: true,
  };
}

export function markdownResponse(text: string): ToolResult {
  return {
    content: [{ type: 'text' as const, text }],
  };
}
