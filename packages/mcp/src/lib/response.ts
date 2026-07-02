import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { meta } from '../data/meta.js';
import { isRunningFromSource } from './load-markdown.js';

export const READ_ONLY_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

type ToolResult = {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
};

export function success(data: Record<string, unknown>): ToolResult {
  const payload = { meta, ...data };
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

/** 候補を提示して次の行動を促す正常応答（isError は付けない）。 */
export function notFound(message: string, extra?: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ meta, message, ...extra }, null, 2) }],
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

/** ガイド/データ読み込み失敗時の共通エラー。
 *  npx 配布環境のユーザーに「pnpm build して」という実行不可能な指示を出さないよう、実行環境で文言を分ける */
export function loadFailureError(what: string, e: unknown): ToolResult {
  const detail = e instanceof Error ? e.message : String(e);
  const hint = isRunningFromSource
    ? 'Run "pnpm build" in packages/mcp and retry.'
    : 'The bundled data may be missing or corrupted — try reinstalling @lism-css/mcp (e.g. "npx -y @lism-css/mcp@latest").';
  return error(`Failed to load ${what}: ${detail}. ${hint}`);
}
