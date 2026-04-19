/**
 * CLI の i18n（多言語化）基盤。
 *
 * - 既定は英語（`en`）。環境ロケールが `ja*` のときのみ日本語（`ja`）に切り替わる。
 * - `--lang <code>` オプションで明示上書き可能。
 * - メッセージ辞書は `messages.ts` に集約。
 */
import { messages, type MessageKey } from './messages.js';

export type Lang = 'ja' | 'en';

/**
 * 環境変数 / Intl から現在のロケールを検出する。
 * `override` に `ja` / `en` が渡された場合はそれを優先。
 */
export function detectLang(override?: string): Lang {
  if (override === 'ja' || override === 'en') return override;
  const raw = (process.env.LC_ALL || process.env.LANG || '').toLowerCase();
  if (raw.startsWith('ja')) return 'ja';
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
