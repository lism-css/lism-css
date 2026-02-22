import { meta } from '../data/meta.js';

type ToolResult = {
	content: { type: 'text'; text: string }[];
	isError?: boolean;
};

export function success(data: Record<string, unknown>): ToolResult {
	return {
		content: [{ type: 'text' as const, text: JSON.stringify({ meta, ...data }, null, 2) }],
	};
}

export function error(message: string, extra?: Record<string, unknown>): ToolResult {
	return {
		content: [{ type: 'text' as const, text: JSON.stringify({ meta, error: message, ...extra }, null, 2) }],
		isError: true,
	};
}
