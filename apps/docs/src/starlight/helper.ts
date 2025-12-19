// src/utils/checkImage.ts
import { existsSync } from 'fs';
import { join } from 'path';

export function imageExists(imagePath: string): boolean {
	const fullPath = join(process.cwd(), 'public', imagePath);
	return existsSync(fullPath);
}

export const isLibTabGroup = (entry: any, target: string = '') => {
	if (entry.type === 'group') {
		// 最初のリンクurlを調べる（存在しない場合は安全にfalseを返す）
		const firstEntry = entry.entries?.[0];
		const childHref = firstEntry?.href;
		if (!childHref) return false;
		return childHref.includes(`/lib/${target}`);
	}
	return false;
	// return entry.type === 'group' && (entry.label === 'Templates' || entry.label === 'Components' || entry.label === 'Page Layout');
};
export const isLibSidebar = (entry: any) => {
	return isLibTabGroup(entry) || entry.label === 'Docs';
};
export const isBothSidebar = (entry: any) => {
	// return false;
	return entry.type !== 'group' && entry.label === 'Template Library';
};
