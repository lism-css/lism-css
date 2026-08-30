// AIパネルで再生するシナリオ定義（言語別）。
// 各ステップは「前ステップのコードへの文字列置換（edits）」として定義し、
// resultCode（そのステップ完了時点のエディター全文）は初期コードから順に適用して導出する。
// - コードの重複を持たないため、initial-code.ts の変更は自動で全ステップへ波及する
// - 置換対象が見つからない・一意でない場合はモジュール初期化時に即エラー
//   （edits と初期コードの不整合を沈黙させない。エラー時はデモ全体が動かなくなるので開発中に必ず気づける）
// NOTE: edits の from/to はクラス属性のみを対象にすること（リード文・href など言語で変わる
//       文字列に触れない）。edits は全言語で共有し、resultCode を言語別に導出している。
// NOTE: 文言・変更内容は仮。デザイン確認後に調整する。
import { INITIAL_HTML_BY_LANG, type DemoLang } from './initial-code';

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

/** ステップの定義。メッセージは言語別、edits は言語共有。resultCode は edits を前ステップのコードへ適用して導出する */
interface ScenarioStepDef {
  userMessage: Record<DemoLang, string>;
  aiMessage: Record<DemoLang, string>;
  aiMessageJsx?: Record<DemoLang, string>;
  /** 前ステップのコードに適用する文字列置換（[置換前, 置換後]）。置換前は一意に特定できる長さで書くこと */
  edits: [from: string, to: string][];
}

const STEP_DEFS: ScenarioStepDef[] = [
  {
    userMessage: {
      ja: 'キャッチコピーをもっと太くして',
      en: 'Make the headline bolder',
    },
    aiMessage: {
      ja: '見出しの太さを -fw:900 に変更します。',
      en: "I'll change the heading weight to -fw:900.",
    },
    aiMessageJsx: {
      ja: '見出しの太さを fw="900" に変更します。',
      en: 'I\'ll change the heading weight to fw="900".',
    },
    // -fw:700 は h1 だけが持つ（Get Started ボタンは -fw:500）ため一意に一致する
    edits: [['-fw:700', '-fw:900']],
  },
  {
    userMessage: {
      ja: '斜体にもしてみて',
      en: 'Make it italic too',
    },
    aiMessage: {
      ja: '見出しに -fs:italic を追加して斜体にします。',
      en: "I'll add -fs:italic to italicize the heading.",
    },
    aiMessageJsx: {
      ja: '見出しに fs="italic" を追加して斜体にします。',
      en: 'I\'ll add fs="italic" to italicize the heading.',
    },
    // -fw:900 は前ステップで h1 だけに入る
    edits: [['-fw:900', '-fw:900 -fs:italic']],
  },
  {
    userMessage: {
      ja: 'ボタンをピル型にしたい',
      en: 'Make the buttons pill-shaped',
    },
    aiMessage: {
      ja: 'Get Started ボタンの角丸を -bdrs:99 に、余白を -p:15 に変更します。',
      en: "I'll round the Get Started button with -bdrs:99 and bump its padding to -p:15.",
    },
    aiMessageJsx: {
      ja: 'Get Started ボタンの角丸を bdrs="99" に、余白を p="15" に変更します。',
      en: 'I\'ll round the Get Started button with bdrs="99" and bump its padding to p="15".',
    },
    // -p:10 は検索ボタンにもあるため、Get Started ボタン（a）だけが持つ並びで1編集にまとめて一意に一致させる
    edits: [['-p:10 -c:base -bdrs:20 -fw:500', '-p:15 -c:base -bdrs:99 -fw:500']],
  },
  {
    userMessage: {
      ja: '検索ボタンも同じ見た目に揃えて',
      en: 'Match the search button too',
    },
    aiMessage: {
      ja: '検索ボタンも -p:15 と -bdrs:99 に揃え、⌘K の角丸も -bdrs:99 にします。',
      en: "I'll apply -p:15 and -bdrs:99 to the search button, and round the ⌘K badge too.",
    },
    aiMessageJsx: {
      ja: '検索ボタンも p="15" と bdrs="99" に揃え、⌘K の角丸も bdrs="99" にします。',
      en: 'I\'ll apply p="15" and bdrs="99" to the search button, and round the ⌘K badge too.',
    },
    // -p:10 -bgc:base は検索ボタン（button）だけの並び。-bdrs:10 は ⌘K の span だけが持つ
    edits: [
      ['-p:10 -bgc:base -bdrs:20', '-p:15 -bgc:base -bdrs:99'],
      ['-bdrs:10', '-bdrs:99'],
    ],
  },
  {
    userMessage: {
      ja: 'ボタンまわりを縦並びにできる？',
      en: 'Can you stack the buttons vertically?',
    },
    aiMessage: {
      ja: 'レイアウトを l--flex から l--stack に切り替えて縦並びにします。',
      en: "I'll switch the layout from l--flex to l--stack to stack them vertically.",
    },
    aiMessageJsx: {
      ja: 'レイアウトを Flex から Stack コンポーネントに切り替えて縦並びにします。',
      en: "I'll switch from the Flex to the Stack component to stack them vertically.",
    },
    edits: [['<div class="l--flex -jc:center -ai:center -g:15">', '<div class="l--stack -ai:center -g:20">']],
  },
];

/** 文字列置換を順に適用する。置換前の文字列がちょうど1回現れなければ即エラー（誤置換・波及漏れの検知） */
const applyEdits = (code: string, edits: [from: string, to: string][]): string =>
  edits.reduce((acc, [from, to]) => {
    const count = acc.split(from).length - 1;
    if (count !== 1) {
      throw new Error(`scenario edit target must match exactly once (found ${count}): "${from}"`);
    }
    // 置換文字列内の `$&` 等が展開されないよう関数形式で渡す
    return acc.replace(from, () => to);
  }, code);

// 初期コードから各ステップの resultCode を順に導出する（resultCode は全文かつ累積）。
// 全言語を eager に導出することで、edits と初期コードの不整合をどの言語でも初期化時に検知する
const buildScenario = (lang: DemoLang): ScenarioStep[] => {
  let code = INITIAL_HTML_BY_LANG[lang];
  return STEP_DEFS.map(({ userMessage, aiMessage, aiMessageJsx, edits }) => {
    code = applyEdits(code, edits);
    return {
      userMessage: userMessage[lang],
      aiMessage: aiMessage[lang],
      aiMessageJsx: aiMessageJsx?.[lang],
      resultCode: code,
    };
  });
};

export const SCENARIO_BY_LANG: Record<DemoLang, ScenarioStep[]> = {
  ja: buildScenario('ja'),
  en: buildScenario('en'),
};
