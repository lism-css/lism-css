import { TOKENS } from '../../config/index';
import isMemberOf from './helper/isMemberOf';

export default function isTokenValue(tokenKey: string, value: unknown): boolean {
  if (!(tokenKey in TOKENS)) return false;

  return isMemberOf(TOKENS[tokenKey as keyof typeof TOKENS], value);
}
