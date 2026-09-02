export default function splitWithComma(str: string | string[]): string[] {
  if (Array.isArray(str)) return str;

  if (typeof str !== 'string') return [];

  return str.split(',').map((s) => s.trim());
}
