/**
 * CLI の i18n（多言語化）基盤。
 *
 * - 既定は英語（`en`）。環境ロケールが `ja*` のときのみ日本語（`ja`）に切り替わる。
 * - `--lang <code>` オプションで明示上書き可能。
 * - メッセージ辞書は `messages.ts` に集約。
 */
import { execFileSync } from 'node:child_process';
import { messages, type MessageKey } from './messages.js';

export type Lang = 'ja' | 'en';

/**
 * macOS の OS 表示言語（`AppleLanguages` の先頭）を取得する。
 *
 * macOS では、OS 表示言語が日本語でもターミナルに渡る `LANG` が英語（例: `en_US.UTF-8`）
 * になる環境があるため、`defaults read -g AppleLanguages` を fallback として参照する。
 * macOS 以外・コマンド失敗時は `null` を返す。
 */
function detectAppleLanguage(): string | null {
  if (process.platform !== 'darwin') return null;
  try {
    // PATH 探索による意図しないバイナリ起動を避けるため macOS 標準の絶対パスを指定する
    const out = execFileSync('/usr/bin/defaults', ['read', '-g', 'AppleLanguages'], {
      encoding: 'utf8',
      timeout: 1000,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    // 出力例:
    //   (
    //       "ja-JP",
    //       "en-JP"
    //   )
    // 先頭の言語コードを取り出す。
    const match = out.match(/"?([A-Za-z]{2,}[-_A-Za-z]*)"?/);
    return match ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * 環境変数 / OS 表示言語 / Intl から現在のロケールを検出する。
 * `override` に `ja` / `en` が渡された場合はそれを優先。
 *
 * 判定順:
 * 1. `override`（`--lang ja|en` の明示指定）
 * 2. `LC_ALL` / `LANG` が `ja*`
 * 3. macOS の `AppleLanguages` 先頭が `ja*`
 * 4. `Intl` のロケールが `ja*`
 * 5. それ以外は `en`
 */
export function detectLang(override?: string): Lang {
  if (override === 'ja' || override === 'en') return override;
  const raw = (process.env.LC_ALL || process.env.LANG || '').toLowerCase();
  if (raw.startsWith('ja')) return 'ja';
  // macOS: ターミナルのロケールが英語でも OS 表示言語が日本語なら ja に倒す
  if (detectAppleLanguage()?.startsWith('ja')) return 'ja';
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
    if (locale.startsWith('ja')) return 'ja';
  } catch {
    // Intl が使えない環境ではフォールバック（en）に倒す
  }
  return 'en';
}

let currentLang: Lang = detectLang();

/** 現在の言語を取得する */
export function getLang(): Lang {
  return currentLang;
}

/** 現在の言語を設定する（未知の値は無視） */
export function setLang(lang: string | undefined): void {
  if (lang === 'ja' || lang === 'en') {
    currentLang = lang;
  }
}

/**
 * commander の parse より前に、argv から `--lang` / `--lang=` / `-L` を抽出して言語を設定する。
 * `--help` の description 表示や各コマンド description のキャプチャに間に合わせるのが目的。
 */
export function preScanLang(argv: string[]): void {
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lang') {
      const next = argv[i + 1];
      // 次トークンが別オプション（例: --force）の場合は値とみなさない
      if (next !== undefined && !next.startsWith('-')) {
        setLang(next);
      }
      return;
    }
    if (a.startsWith('--lang=')) {
      setLang(a.slice('--lang='.length));
      return;
    }
  }
}

/**
 * メッセージキーから現在の言語の文字列を取得し、必要に応じて `{name}` プレースホルダーを置換する。
 */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const entry = messages[key];
  if (!entry) return key;
  const template = entry[currentLang] ?? entry.en;
  return vars ? interpolate(template, vars) : template;
}

/**
 * ロケール非依存の 2 言語オブジェクトから現在の言語の値を返す。
 * TEMPLATES の label/description や、辞書化しにくい一時的な二択文字列で使う。
 */
export function tOf<T>(pair: { ja: T; en: T }): T {
  return pair[currentLang];
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = vars[name];
    return v === undefined ? `{${name}}` : String(v);
  });
}
