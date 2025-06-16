// src/utils/checkImage.ts
import { existsSync } from 'fs';
import { join } from 'path';

export function imageExists(imagePath: string): boolean {
	const fullPath = join(process.cwd(), 'public', imagePath);
	return existsSync(fullPath);
}

export const isLibSidebar = (entry: any) => {
	const isLibGroup = entry.type === 'group' && (entry.label === 'Templates' || entry.label === 'Components' || entry.label === 'Sections');
	return isLibGroup || entry.label === 'Lism Library';
};
export const isBothSidebar = (entry: any) => {
	// return false;
	return entry.type !== 'group' && (entry.label === 'Templates' || entry.label === 'UI Components');
};
