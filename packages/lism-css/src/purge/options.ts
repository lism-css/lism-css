import type { KnownSelectorSet, SafelistEntry } from './core';

export interface LismPurgeOptions {
  safelist?: SafelistEntry[];
  known?: KnownSelectorSet;
  report?: boolean;
}
