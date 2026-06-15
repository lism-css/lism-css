type PlainObject = Record<string, unknown>;

function isObj(value: unknown): value is PlainObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

type DeepMergeResult<T, U> = T extends PlainObject
  ? U extends PlainObject
    ? {
        [K in keyof T | keyof U]: K extends keyof U ? (K extends keyof T ? DeepMergeResult<T[K], U[K]> : U[K]) : K extends keyof T ? T[K] : never;
      }
    : T
  : U extends PlainObject
    ? U
    : T;

/**
 * 深いマージを行う関数
 * @param origin - マージ先となる元オブジェクト
 * @param source - マージするソース（このデータに更新される）
 * @returns マージされたオブジェクト
 */
export function objDeepMerge<T extends Record<string, unknown>, U extends Record<string, unknown>>(origin: T, source: U): DeepMergeResult<T, U> {
  const result = { ...origin } as Record<string, unknown>;

  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      const originValue = result[key];
      const sourceValue = (source as Record<string, unknown>)[key];

      if (!originValue) {
        // origin側に存在しない新たなキーの場合はそのまま追加する
        result[key] = sourceValue;
      } else if (isObj(sourceValue) && isObj(originValue)) {
        // どちらもオブジェクトの場合は再帰的にマージ
        result[key] = objDeepMerge(originValue, sourceValue);
      } else {
        // どちらかのデータがobjectではない場合、そのまま上書き
        result[key] = sourceValue;
      }
    }
  }

  return result as DeepMergeResult<T, U>;
}

type TokenValueMap = Record<string, string | number>;
type TokenValuesChannel = Record<string, TokenValueMap>;

/**
 * tokenValues チャンネル（#431 / Option B）のキーを tokens カタログへ畳み込む。
 *
 * 値（CSS変数の定義）の出力は serializeTokenValues / SCSS 側が担い、ここではキーだけを既存カタログへ
 * 登録する。これにより同じキーが「ユーティリティ生成（tokenClass:1）」と「ランタイム TOKENS（prop 受理）」の
 * 双方に乗り、`lts="2xl"` のように値を1か所書くだけで利用できるようになる。
 *
 * - 配列形式トークン（lts/fz 等）: 配列末尾へ未登録キーを追加。
 * - オブジェクト形式トークン（space/c/palette の { pre, values }）: values へ追加し pre は保持。
 * - 既定に無い新規トークン: 配列形式として新設。
 *
 * 入力 tokens は破壊せず、変更があったトークンだけ複製した新オブジェクトを返す。
 */
export function foldTokenValues(tokens: PlainObject | undefined, tokenValues: TokenValuesChannel | undefined): PlainObject {
  const result: PlainObject = { ...(tokens ?? {}) };
  if (!tokenValues) return result;

  for (const [tokenKey, valueMap] of Object.entries(tokenValues)) {
    const keys = Object.keys(valueMap ?? {});
    if (keys.length === 0) continue;

    const existing = result[tokenKey];
    if (isObj(existing) && ('pre' in existing || 'values' in existing)) {
      // オブジェクト形式（{ pre, values }）: values へ追加し pre は保持する。
      const values: unknown[] = Array.isArray(existing.values) ? [...(existing.values as unknown[])] : [];
      for (const key of keys) if (!values.includes(key)) values.push(key);
      result[tokenKey] = { ...existing, values };
    } else {
      // 配列形式 or 新規トークン。
      const values: unknown[] = Array.isArray(existing) ? [...(existing as unknown[])] : [];
      for (const key of keys) if (!values.includes(key)) values.push(key);
      result[tokenKey] = values;
    }
  }

  return result;
}

type DeepArrayToSet<T> = T extends unknown[] ? Set<T[number]> : T extends PlainObject ? { [K in keyof T]: DeepArrayToSet<T[K]> } : T;

/**
 * オブジェクト内の配列を再帰的にSetに変換する関数
 * @param obj - 変換対象のオブジェクト
 * @returns 変換されたオブジェクト
 */
export function arrayConvertToSet<T>(obj: T): DeepArrayToSet<T> {
  // 配列の場合はSetに変換
  if (Array.isArray(obj)) {
    return new Set(obj) as DeepArrayToSet<T>;
  }

  // オブジェクトの場合は再帰的に処理
  if (isObj(obj)) {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        result[key] = arrayConvertToSet(obj[key]);
      }
    }
    return result as DeepArrayToSet<T>;
  }

  // その他の値はそのまま返す
  return obj as DeepArrayToSet<T>;
}
