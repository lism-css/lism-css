/**
 * `tokens.json`（lism.config 互換の tokens オブジェクト）の検証と、その反映経路。
 *
 * 反映は2経路必要なので、検証済み tokens から生成した lism.config モジュール1本を両方の入口にする。
 * 1. React ランタイム（props → `var()` 変換）… `lismConfigAlias({ configPath })` で `lism-css/config.js` を差し替え
 * 2. CSS 変数定義 … `loadBuildConfigs(dataDir, { configPath }).mainConfig` を `serializeTokens()` へ
 *
 * ダーク時の値は `tokens.dark.json` が持ち、`serializeTokens()` の後ろに `.set--dark` ブロックとして足す。
 * lism.config にはダークの概念が無いため、こちらは経路1（React ランタイム）には流さない。
 *
 * 契約違反は警告にせず必ずエラーにする（警告だと `check` 成功の意味が崩れるため）。
 */
import fs from 'node:fs';
import path from 'node:path';

import { loadBuildConfigs, loadDefaultConfig, serializeTokens } from '@lism-css/plugin/builder';
import getTokenVarName from 'lism-css/lib/getTokenVarName';

import { isPlainObject, MockupContractError, type MockupTokens, type TokenEntry, type TokenGroupEntry } from './types.js';

export const TOKENS_FILENAME = 'tokens.json';
export const DARK_TOKENS_FILENAME = 'tokens.dark.json';

/**
 * ダーク時のトークンを載せるスコープクラス。
 *
 * `:root.set--dark` ではなく素のクラスにして、ページ全体・ページの一部・トークン一覧の
 * プレビュー箱のどれにも同じ仕組みで付けられるようにする。命名は lism-css の
 * スコープクラス（`set--s` / `set--bxsh`）に合わせている。
 */
export const DARK_SCOPE_CLASS = 'set--dark';

/**
 * 生成する lism.config モジュールのファイル名。
 *
 * `.mjs` にしない。`loadBuildConfigs()` の jiti は ESM ファイルをネイティブ import で読むため、
 * 同じパスを書き換えても Node の ESM キャッシュが効いて `tokens.json` の変更を拾えなくなる。
 * `.js`（jiti の transform 経路 + `moduleCache: false`）なら毎回読み直される。
 */
export const GENERATED_CONFIG_FILENAME = 'lism.config.js';

/** 新しいキーの追加を許可するトークン種別。それ以外は既存キーの値上書きのみ。 */
const NEW_KEY_ALLOWED_TOKENS = new Set(['color']);

/**
 * トークンキーに使えない予約キー。
 *
 * `writeConfigModule()` が書き出すのは `export default { ... }` のオブジェクトリテラルで、
 * その中の `"__proto__": ...` はプロトタイプ設定構文と解釈されるため own key として残らない。
 * 検証だけ通って生成 CSS とトークン一覧から黙って消えるより、ここで契約違反にする。
 */
const RESERVED_TOKEN_KEY = '__proto__';

/** 値の中の `var(--x)` 参照を拾う（`var( --x , fallback )` のような書き方も含む）。 */
const VAR_REFERENCE_PATTERN = /var\(\s*(--[\w-]+)/g;

/**
 * `serializeTokens()` が CSS 変数として出力しない値か。
 *
 * 一覧に出すのは「生成 CSS が実際に定義しているトークン」だけなので、除外規則は
 * `serializeTokens()` と揃える必要がある。片方だけ変わるズレを見つけやすいよう、
 * 複製したルールはこの関数1つに閉じ込める。
 */
function isOmittedTokenValue(value: string | number | null | undefined): boolean {
  return value === '-' || value === '' || value == null;
}

/** default-config の1トークン種別が持つ既存キー一覧（配列カタログにも対応）。 */
function defaultTokenKeys(catalog: unknown): string[] {
  if (Array.isArray(catalog)) return catalog.map((key) => String(key));
  if (isPlainObject(catalog)) return Object.keys(catalog);
  return [];
}

/** 1トークンファイルの検証ルール（ライトとダークで違うのはこの3点だけ）。 */
interface TokenFileRules {
  /** エラーメッセージに出すファイル名。 */
  filename: string;
  /** 新しいキーの追加を許可するトークン種別。 */
  newKeyAllowed: ReadonlySet<string>;
  /**
   * 既存キーであっても、比較対象が CSS 変数を持たない（`'-'` センチネル等）なら弾くか。
   *
   * ダークだけで有効になる。ライトに実値が無いトークンをダークにだけ持たせると
   * 「ライトに対する差分」として一覧に並べられなくなるため。
   */
  requireExistingValue: boolean;
}

const LIGHT_RULES: TokenFileRules = {
  filename: TOKENS_FILENAME,
  newKeyAllowed: NEW_KEY_ALLOWED_TOKENS,
  requireExistingValue: false,
};

const DARK_RULES: TokenFileRules = {
  filename: DARK_TOKENS_FILENAME,
  // ライトのどこにも存在しない完全な新規キーは弾く（`color` の例外はダークへ持ち込まない）。
  newKeyAllowed: new Set<string>(),
  requireExistingValue: true,
};

/** 未知キーのエラー文（ライトとダークで案内すべき直し方が違う）。 */
function unknownKeyMessage(rules: TokenFileRules, group: string, key: string, knownKeys: string[]): string {
  if (!rules.requireExistingValue) {
    return `${rules.filename}: "${group}.${key}" is not an existing token. Only "color" accepts new keys; other groups can override existing values only (${group}: ${knownKeys.join(', ')}).`;
  }
  const head = `${rules.filename}: "${group}.${key}" does not exist in the light theme.`;
  // 種別ごと上書き不可（`lh` / `flow` のように実値を手書き SCSS が持つもの）なら、
  // 空の候補リストを出しても直し方が分からないので、そう書く。
  if (knownKeys.length === 0) {
    return `${head} No token in "${group}" can be overridden: the light theme declares no CSS variable for this group.`;
  }
  return `${head} ${rules.filename} can only override tokens that ${TOKENS_FILENAME} or Lism CSS already defines (${group}: ${knownKeys.join(', ')}).`;
}

/**
 * 1つのトークンファイルの中身を検証する。
 *
 * @param raw         パース済みの JSON
 * @param knownTokens 既存キー判定の正（ライトは `defaultConfig.tokens`、ダークはマージ後のライト側トークン）
 * @param file        エラー表示用の絶対パス
 * @param rules       ライト / ダークで異なる部分
 */
function validateTokenFile(raw: unknown, knownTokens: Record<string, unknown>, file: string, rules: TokenFileRules): MockupTokens {
  if (!isPlainObject(raw)) {
    throw new MockupContractError(`${rules.filename} must contain a JSON object of token groups (e.g. { "color": { "brand": "#333" } }).`, {
      file,
    });
  }

  // ユーザー入力のキーを持たせる器は必ず null プロトタイプにする。
  // 素の `{}` だと `constructor` / `toString` が継承分と紛れ、下流の存在判定がプロトタイプ由来のキーに引っかかる。
  const tokens = Object.create(null) as MockupTokens;
  for (const [group, values] of Object.entries(raw)) {
    // `in` は `constructor` / `toString` / `__proto__` まで既知グループ扱いにしてしまうため hasOwn で判定する。
    if (!Object.hasOwn(knownTokens, group)) {
      throw new MockupContractError(`${rules.filename}: unknown token group "${group}". Available groups: ${Object.keys(knownTokens).join(', ')}.`, {
        file,
      });
    }
    if (!isPlainObject(values)) {
      throw new MockupContractError(`${rules.filename}: "${group}" must be an object of token key / value pairs.`, { file });
    }

    const catalog = knownTokens[group];
    // ダークは「実値を持つキー」だけを上書き対象にするため、案内するキー一覧も同じ条件で絞る。
    const knownKeys = rules.requireExistingValue
      ? defaultTokenKeys(catalog).filter((key) => isPlainObject(catalog) && !isOmittedTokenValue(catalog[key] as string | number | null))
      : defaultTokenKeys(catalog);

    const entry = Object.create(null) as Record<string, string | number>;
    for (const [key, value] of Object.entries(values)) {
      if (key === RESERVED_TOKEN_KEY) {
        throw new MockupContractError(
          `${rules.filename}: "${group}.${key}" cannot be used as a token key (the generated ${GENERATED_CONFIG_FILENAME} cannot carry it). Rename the token.`,
          { file }
        );
      }
      if (!knownKeys.includes(key) && !rules.newKeyAllowed.has(group)) {
        throw new MockupContractError(unknownKeyMessage(rules, group, key, knownKeys), { file });
      }
      if (typeof value !== 'string' && typeof value !== 'number') {
        throw new MockupContractError(`${rules.filename}: "${group}.${key}" must be a string or a number.`, { file });
      }
      entry[key] = value;
    }
    tokens[group] = entry;
  }

  return tokens;
}

/**
 * `tokens.json` の中身を検証する。
 *
 * @param raw          パース済みの `tokens.json`
 * @param defaultTokens `loadDefaultConfig()` の `tokens`（既存キー判定の正）
 * @param file         エラー表示用の絶対パス
 */
export function validateTokens(raw: unknown, defaultTokens: Record<string, unknown>, file: string): MockupTokens {
  return validateTokenFile(raw, defaultTokens, file, LIGHT_RULES);
}

/**
 * `tokens.dark.json` の中身を検証する。
 *
 * 上書きできるのは「ライト側に実値があるトークン」だけ。判定の正は default-config 単体ではなく
 * マージ後のライト側トークンで、`tokens.json` が `color` に足した独自キーもダークで上書きできる。
 *
 * @param raw        パース済みの `tokens.dark.json`
 * @param lightTokens `mergeLightTokens()` の結果（＝`mainConfig.tokens` 相当）
 * @param file       エラー表示用の絶対パス
 */
export function validateDarkTokens(raw: unknown, lightTokens: Record<string, unknown>, file: string): MockupTokens {
  return validateTokenFile(raw, lightTokens, file, DARK_RULES);
}

/**
 * マージ後のライト側トークン（`mainConfig.tokens` 相当）を組み立てる。
 *
 * `mainConfig` は `objDeepMerge(defaultConfig, 生成 config)` なので、default-config の各種別へ
 * `tokens.json` を重ねたものと一致する。ダークの検証と `.set--dark` の依存解決はどちらも
 * 「ライトが最終的に何を宣言しているか」が基準なので、この1か所で作って両方へ渡す。
 */
export function mergeLightTokens(defaultTokens: Record<string, unknown>, overrides: MockupTokens): Record<string, Record<string, string | number>> {
  const merged = Object.create(null) as Record<string, Record<string, string | number>>;

  for (const [group, catalog] of Object.entries(defaultTokens)) {
    const entry = Object.create(null) as Record<string, string | number>;
    if (isPlainObject(catalog)) {
      for (const [key, value] of Object.entries(catalog)) entry[key] = value as string | number;
    } else {
      // 配列カタログ（キーだけの登録）は CSS 変数を持たない。センチネルと同じ扱いにする。
      for (const key of defaultTokenKeys(catalog)) entry[key] = '-';
    }
    merged[group] = entry;
  }

  for (const [group, values] of Object.entries(overrides)) {
    const entry = merged[group] ?? (merged[group] = Object.create(null) as Record<string, string | number>);
    for (const [key, value] of Object.entries(values)) entry[key] = value;
  }

  return merged;
}

/** トークンファイルを読み込む。ファイルが無い場合は null（空トークン扱い）。 */
export function readTokensFile(dataDir: string, filename: string = TOKENS_FILENAME): { raw: unknown; file: string } | null {
  const file = path.join(dataDir, filename);

  // 存在確認と読み込みを分けると同じパスへ2回 syscall が走るので、読み込みの失敗（ENOENT）で
  // 「無い」を判定する。ENOENT 以外（権限エラー等）はここで握りつぶさず、そのまま投げ直す。
  let content: string;
  try {
    content = fs.readFileSync(file, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }

  try {
    return { raw: JSON.parse(content), file };
  } catch (error) {
    throw new MockupContractError(`${filename} is not valid JSON: ${(error as Error).message}`, { file });
  }
}

/**
 * ライト / ダークの2ファイルを読み、default-config を正として検証した結果を返す。
 *
 * ここで要るのはマージ前の default-config だけなので `loadDefaultConfig()` を使う。
 * `loadBuildConfigs()` だと user 設定の読み込みと full preset のマージまで走り、
 * dev watch で `tokens.json` を保存するたびに無駄な計算を繰り返すことになる。
 */
export async function loadTokens(dataDir: string): Promise<{ tokens: MockupTokens; darkTokens: MockupTokens }> {
  const light = readTokensFile(dataDir, TOKENS_FILENAME);
  const dark = readTokensFile(dataDir, DARK_TOKENS_FILENAME);
  if (!light && !dark) return { tokens: {}, darkTokens: {} };

  const defaultConfig = await loadDefaultConfig();
  const tokens = light ? validateTokens(light.raw, defaultConfig.tokens, light.file) : {};
  if (!dark) return { tokens, darkTokens: {} };

  return { tokens, darkTokens: validateDarkTokens(dark.raw, mergeLightTokens(defaultConfig.tokens, tokens), dark.file) };
}

/** 検証済み tokens から lism.config モジュールを生成し、そのパスを返す。 */
export function writeConfigModule(dir: string, tokens: MockupTokens): string {
  const file = path.join(dir, GENERATED_CONFIG_FILENAME);
  const body = `// Generated by @lism-css/mockup from ${TOKENS_FILENAME}. Do not edit.\nexport default ${JSON.stringify({ tokens }, null, 2)};\n`;
  fs.writeFileSync(file, body, 'utf-8');
  return file;
}

/** `.set--dark` ブロックに入る1トークン。 */
export interface DarkTokenEntry {
  group: string;
  key: string;
  varName: string;
  value: string;
  /** `tokens.dark.json` が直接指定したものか（false は依存で再宣言されたもの）。 */
  isDeclared: boolean;
}

/** 値の中で参照している CSS 変数名。 */
function referencedVarNames(value: string): string[] {
  return [...value.matchAll(VAR_REFERENCE_PATTERN)].map((match) => match[1]);
}

/**
 * `.set--dark` ブロックへ入れるトークンを、ライトのグループ順・キー順で並べて返す。
 *
 * `tokens.dark.json` の指定に加え、その値を参照して組み立てられているライト側トークンも
 * 同じブロックへ再宣言する。CSS カスタムプロパティの `var()` は「宣言した要素の計算値」を作る
 * 時点で解決されるため、`.set--dark { --L: 70% }` だけでは `:root` で確定済みの
 * `--red: oklch(var(--L) …)` は変わらない。再宣言して初めてダークの `--L` で組み直される。
 * lism-css の `.set--s` / `.set--bxsh`（TOKEN_SCOPE）が依存トークンを再宣言しているのと同じ理屈。
 *
 * 参照は連鎖しうる（`--L` → `--red`、`--fz--base` → `--hl-unit` → `--hl--base`）ため、
 * 追加が起きなくなるまで繰り返す。
 *
 * @param lightTokens `mergeLightTokens()` の結果
 * @param darkTokens  検証済み `tokens.dark.json`
 */
export function collectDarkTokens(lightTokens: Record<string, unknown>, darkTokens: MockupTokens): DarkTokenEntry[] {
  // 配列カタログ等は CSS 変数を持たないので、`serializeTokens()` と同じ規則で最初に外す。
  const groupEntries = Object.entries(lightTokens).filter((pair): pair is [string, Record<string, string | number>] => isPlainObject(pair[1]));

  /** 再宣言済みトークンの CSS 変数名。ここに載る変数を参照する値が、次の再宣言対象になる。 */
  const declaredVarNames = new Set<string>();
  /** `${group}\0${key}` → ブロックへ出す値。 */
  const declared = new Map<string, string>();
  const entryId = (group: string, key: string) => `${group}\0${key}`;

  for (const [group, values] of Object.entries(darkTokens)) {
    for (const [key, value] of Object.entries(values)) {
      if (isOmittedTokenValue(value)) continue;
      declared.set(entryId(group, key), String(value));
      declaredVarNames.add(getTokenVarName(group, key));
    }
  }
  if (declared.size === 0) return [];

  let added = true;
  while (added) {
    added = false;
    for (const [group, values] of groupEntries) {
      for (const [key, value] of Object.entries(values)) {
        const id = entryId(group, key);
        if (declared.has(id) || isOmittedTokenValue(value)) continue;
        if (!referencedVarNames(String(value)).some((name) => declaredVarNames.has(name))) continue;

        declared.set(id, String(value));
        declaredVarNames.add(getTokenVarName(group, key));
        added = true;
      }
    }
  }

  // 並びはライト側に揃える（一覧のダークセクションが元のセクションと同じ順で読める）。
  const entries: DarkTokenEntry[] = [];
  for (const [group, values] of groupEntries) {
    for (const key of Object.keys(values)) {
      const value = declared.get(entryId(group, key));
      if (value === undefined) continue;
      entries.push({
        group,
        key,
        varName: getTokenVarName(group, key),
        value,
        isDeclared: Object.hasOwn(darkTokens, group) && Object.hasOwn(darkTokens[group], key),
      });
    }
  }
  return entries;
}

/** `.set--dark` ブロックの CSS。ダーク宣言が無ければ空文字（＝クラス自体が存在しない）。 */
export function serializeDarkTokens(entries: DarkTokenEntry[]): string {
  if (entries.length === 0) return '';
  const decls = entries.map((entry) => `  ${entry.varName}: ${entry.value};`);
  return `.${DARK_SCOPE_CLASS} {\n${decls.join('\n')}\n}\n`;
}

/**
 * マージ済みトークンを、ビューアのトークン一覧が読める形へ整理する。
 *
 * 出すのは生成 CSS が実際に定義しているトークンだけ（`isOmittedTokenValue()` を参照）。
 * ダークのトークンを持つ種別には、元のセクションの直後に `色 (dark)` のセクションを足す。
 * 並べて比較できるようにするためで、中身は `.set--dark` ブロックが定義しているものと一致する。
 *
 * @param mergedTokens  `mainConfig.tokens`（`tokens.json` 反映後のマージ結果）
 * @param defaultTokens `defaultConfig.tokens`（既存キー判定の正）
 * @param overrides     検証済み `tokens.json`（`source` 判定に使う）
 * @param darkEntries   `collectDarkTokens()` の結果
 */
export function collectTokenGroups(
  mergedTokens: Record<string, unknown>,
  defaultTokens: Record<string, unknown>,
  overrides: MockupTokens,
  darkEntries: DarkTokenEntry[] = []
): TokenGroupEntry[] {
  const groups: TokenGroupEntry[] = [];

  const darkByGroup = new Map<string, DarkTokenEntry[]>();
  for (const entry of darkEntries) {
    const list = darkByGroup.get(entry.group);
    if (list) list.push(entry);
    else darkByGroup.set(entry.group, [entry]);
  }

  for (const [group, valueMap] of Object.entries(mergedTokens)) {
    // 配列カタログ（キーだけの登録）などは CSS 変数を持たないため、serializeTokens と同じ規則で飛ばす。
    if (!isPlainObject(valueMap)) continue;

    // 上書き元は null プロトタイプのユーザー入力なので、`in` ではなく hasOwn で own key だけを見る。
    const overrideGroup = Object.hasOwn(overrides, group) && isPlainObject(overrides[group]) ? overrides[group] : null;
    // 既存キー一覧は上書きがある種別でだけ必要（default しか無いなら判定に使わない）。
    const knownKeys = overrideGroup ? defaultTokenKeys(defaultTokens[group]) : [];

    const tokens: TokenEntry[] = [];
    // 値は string | number 前提（default-config の定義と `validateTokens` の契約）。serializeTokens と同じ見なし方。
    for (const [key, value] of Object.entries(valueMap as Record<string, string | number>)) {
      if (isOmittedTokenValue(value)) continue;

      const isOverride = overrideGroup !== null && Object.hasOwn(overrideGroup, key);
      const source: TokenEntry['source'] = isOverride ? (knownKeys.includes(key) ? 'overridden' : 'custom') : 'default';

      tokens.push({ key, varName: getTokenVarName(group, key), value: String(value), source });
    }

    if (tokens.length === 0) continue;
    groups.push({ id: group, group, label: group, tokens });

    const dark = darkByGroup.get(group);
    if (!dark) continue;
    groups.push({
      id: `${group}--dark`,
      group,
      label: `${group} (dark)`,
      isDark: true,
      tokens: dark.map((entry) => ({
        key: entry.key,
        varName: entry.varName,
        value: entry.value,
        // ダークのセクションはすべてライトからの差分なので一覧では区別しないが、
        // 「直接書いたもの」と「依存で再宣言されたもの」の別はここで保っておく。
        source: entry.isDeclared ? 'overridden' : 'default',
      })),
    });
  }

  return groups;
}

/**
 * 生成 config を反映した CSS 変数定義と、その内訳（ビューアのトークン一覧用）を作る。
 *
 * ビューアは Lism 標準の `lism-css/main.css` を読むため、main 側の BuildConfig を直列化する。
 * React ランタイム（`lism.config.js` は `isFullMode` を持たない）も main 側の prop 設定で動くので、
 * CSS・コンポーネント・トークン一覧の3つがすべて同じモードで揃う。
 * CSS と一覧は必ず同じ config から作る（この関数の中で `loadBuildConfigs()` を1回だけ呼び、両者のずれを防ぐ）。
 */
export async function buildTokensArtifacts(
  dataDir: string,
  configPath: string,
  overrides: MockupTokens,
  darkOverrides: MockupTokens = {}
): Promise<{ css: string; groups: TokenGroupEntry[] }> {
  const { mainConfig, defaultConfig } = await loadBuildConfigs(dataDir, { configPath });
  const darkEntries = collectDarkTokens(mainConfig.tokens, darkOverrides);

  return {
    css: serializeTokens(mainConfig) + serializeDarkTokens(darkEntries),
    groups: collectTokenGroups(mainConfig.tokens, defaultConfig.tokens, overrides, darkEntries),
  };
}
