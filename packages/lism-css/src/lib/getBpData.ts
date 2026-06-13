import filterEmptyObj from './helper/filterEmptyObj';
import hasSomeKeys from './helper/hasSomeKeys';
import { BREAK_POINTS_ALL, BREAK_POINTS_OBJ } from '../../config/index';

type BpValue = string | number | boolean | object | null | undefined;

// ブレイクポイントのキー型（オブジェクト記法で認識する全キー。xs を含む）
type BpKey = (typeof BREAK_POINTS_OBJ)[number];

// getBpData の戻り値型
export type BpData = {
  base?: BpValue;
} & Partial<Record<BpKey, BpValue>>;

// getBpData の入力型
export type BpDataInput =
  | boolean // boolean (true は { base: true } に、false は {} に変換)
  | string // 文字列
  | number // 数値
  | BpValue[] // 配列形式 [base, sm, md, lg, xl]
  | Partial<Record<BpKey, BpValue>> // ブレイクポイントオブジェクト { base: ..., sm: ..., ... }
  | Record<string, unknown> // その他のオブジェクト（sides props など）
  | null // null (空オブジェクトに変換)
  | undefined; // undefined (空オブジェクトに変換)

// BP指定に必要な規格化した形式のオブジェクトを返す.
//     ( string, array, obj → {_, sm, md, ...} の型のobjectに変換する. )
export default function getBpData(propVal: BpDataInput): BpData {
  if (true === propVal) return { base: true };

  // 0 の場合も base: 0 として扱う
  if (propVal !== 0 && !propVal) return {};

  if (typeof propVal === 'string' || typeof propVal === 'number') {
    return { base: propVal };
  }

  if (Array.isArray(propVal)) {
    // 配列記法のインデックス→キー対応は恒久固定（[base, sm, md, lg, xl]）。xs は含まれない。
    const values: Record<string, BpValue> = {};
    propVal.forEach((r, i) => {
      values[`${BREAK_POINTS_ALL[i]}`] = r;
    });
    return filterEmptyObj(values);
  }

  // オブジェクトの場合: BP指定オブジェクトか方向オブジェクトかを判定（xs を含む BREAK_POINTS_OBJ で判定）
  if (hasSomeKeys(propVal, BREAK_POINTS_OBJ)) {
    // 'sm', 'md' などがある場合はbp指定のオブジェクトとみなす
    return filterEmptyObj(propVal as Record<string, BpValue>);
  }

  // 方向オブジェクト(sides props)の場合
  return filterEmptyObj({ base: propVal as BpValue });
}
