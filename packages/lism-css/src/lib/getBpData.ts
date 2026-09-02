import filterEmptyObj from './helper/filterEmptyObj';
import hasSomeKeys from './helper/hasSomeKeys';
import { BREAK_POINTS_ALL, BREAK_POINTS_OBJ } from '../../config/defaults/breakpoints';

type BpValue = string | number | boolean | object | null | undefined;

type BpKey = (typeof BREAK_POINTS_OBJ)[number];

export type BpData = {
  base?: BpValue;
} & Partial<Record<BpKey, BpValue>>;

export type BpDataInput = boolean | string | number | BpValue[] | Partial<Record<BpKey, BpValue>> | Record<string, unknown> | null | undefined;

/** Prop値をbaseと各ブレイクポイントのオブジェクトへ揃える。 */
export default function getBpData(propVal: BpDataInput): BpData {
  if (true === propVal) return { base: true };

  // 0 の場合も base: 0 として扱う
  if (propVal !== 0 && !propVal) return {};

  if (typeof propVal === 'string' || typeof propVal === 'number') {
    return { base: propVal };
  }

  if (Array.isArray(propVal)) {
    // 配列記法のインデックス→キー対応は固定（[base, sm, md, lg, xl]）。xs は含まれない。
    const values: Record<string, BpValue> = {};
    propVal.forEach((r, i) => {
      values[`${BREAK_POINTS_ALL[i]}`] = r;
    });
    return filterEmptyObj(values);
  }

  // BPキーを含まないオブジェクトはsides等のbase値として扱う。
  if (hasSomeKeys(propVal, BREAK_POINTS_OBJ)) {
    return filterEmptyObj(propVal);
  }

  return filterEmptyObj({ base: propVal });
}
