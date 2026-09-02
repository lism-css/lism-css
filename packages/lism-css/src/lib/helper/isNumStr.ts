export default function isNumStr(val: unknown): val is `${number}` {
  if (typeof val !== 'string') return false;
  return !isNaN(Number(val));
}
