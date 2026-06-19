import type { KnownSelectorSet, SafelistEntry } from './core';

// known は値そのものに加えて、ビルド時に評価される遅延解決関数も受け付ける。
// 動的 CSS ビルドプラグインが、生成した素の CSS から known を組み立てて渡すための連携ポイント。
export type KnownOption = KnownSelectorSet | (() => KnownSelectorSet | undefined);

export interface LismPurgeOptions {
  safelist?: SafelistEntry[];
  known?: KnownOption;
  report?: boolean;
}
