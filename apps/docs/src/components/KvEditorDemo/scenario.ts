// AIパネルで再生するシナリオ定義。
// 各ステップは「前ステップのコードへの文字列置換（edits）」として定義し、
// resultCode（そのステップ完了時点のエディター全文）は INITIAL_HTML から順に適用して導出する。
// - コードの重複を持たないため、initial-code.ts の変更は自動で全ステップへ波及する
// - 置換対象が見つからない・一意でない場合はモジュール初期化時に即エラー
//   （edits と初期コードの不整合を沈黙させない。エラー時はデモ全体が動かなくなるので開発中に必ず気づける）
// NOTE: 文言・変更内容は仮。デザイン確認後に調整する。
import { INITIAL_HTML } from './initial-code';

export interface ScenarioStep {
  /** ユーザー側の依頼として表示するメッセージ */
  userMessage: string;
  /** AIの応答として表示するメッセージ（HTMLタブ再生時） */
  aiMessage: string;
  /** JSXタブ再生時のAI応答（表記の違いを反映。省略時は aiMessage で代用） */
  aiMessageJsx?: string;
  /** ステップ完了時のエディターHTML全文（JSXタブでは htmlToJsx で変換して再生する） */
  resultCode: string;
}

/** ステップの定義。resultCode は edits を前ステップのコードへ適用して導出する */
interface ScenarioStepDef extends Omit<ScenarioStep, 'resultCode'> {
  /** 前ステップのコードに適用する文字列置換（[置換前, 置換後]）。置換前は一意に特定できる長さで書くこと */
  edits: [from: string, to: string][];
}

const STEP_DEFS: ScenarioStepDef[] = [
  {
    userMessage: 'キャッチコピーを目立たせて',
    aiMessage: '見出しにブランドカラーを適用します。-c:brand クラスを追加しますね。',
    aiMessageJsx: '見出しにブランドカラーを適用します。c="brand" props を追加しますね。',
    edits: [['-fz:5xl -ta:center"', '-fz:5xl -ta:center -c:brand"']],
  },
  {
    userMessage: 'ボタンをピル型にしたい',
    aiMessage: 'Get Started ボタンの角丸を -bdrs:99 に変更し、左右の余白を広げます。',
    aiMessageJsx: 'Get Started ボタンの角丸を bdrs="99" に変更し、左右の余白を広げます。',
    edits: [
      ['-px:15 -py:10 -bgc:text', '-px:20 -py:10 -bgc:text'],
      ['-bdrs:20 -fw:500', '-bdrs:99 -fw:500'],
    ],
  },
  {
    userMessage: 'ボタンまわりを縦並びにできる？',
    aiMessage: 'レイアウトを l--flex から l--stack に切り替えて縦並びにします。',
    aiMessageJsx: 'レイアウトを Flex から Stack コンポーネントに切り替えて縦並びにします。',
    edits: [['<div class="l--flex -jc:center -ai:center -g:15 -mbs:40">', '<div class="l--stack -ai:center -g:10 -mbs:40">']],
  },
];

/** 文字列置換を順に適用する。置換前の文字列がちょうど1回現れなければ即エラー（誤置換・波及漏れの検知） */
const applyEdits = (code: string, edits: [from: string, to: string][]): string =>
  edits.reduce((acc, [from, to]) => {
    const count = acc.split(from).length - 1;
    if (count !== 1) {
      throw new Error(`scenario edit target must match exactly once (found ${count}): "${from}"`);
    }
    return acc.replace(from, to);
  }, code);

// INITIAL_HTML から各ステップの resultCode を順に導出する（resultCode は全文かつ累積）
let code = INITIAL_HTML;
export const SCENARIO: ScenarioStep[] = STEP_DEFS.map(({ edits, ...step }) => {
  code = applyEdits(code, edits);
  return { ...step, resultCode: code };
});
