/**
 * Chat コンポーネントの共通プロパティ処理
 */

export const defaultProps = {
  avatar: {
    bgc: 'base',
    ar: '1/1',
    bdrs: '99',
    'aria-hidden': 'true',
  },
  name: {
    c: 'text-2',
    fs: 'italic',
    fz: '2xs',
    lh: '1',
    py: '5',
    px: '10',
    aslf: 'end',
  },
  body: {
    pos: 'relative',
  },
  deco: {
    util: 'cbox',
    isSkipFlow: true,
    pos: 'absolute',
  },
  content: {
    util: 'cbox',
    bdrs: '30',
    p: '20',
    lh: 's',
  },
} as const;

export type ChatProps = {
  direction?: string;
  keycolor?: string;
  [key: string]: unknown;
};

/**
 * Chat コンポーネントのルートプロパティを生成（className以外の共通props）
 */
export default function getChatProps({ direction = 'start', keycolor = 'gray', ...props }: ChatProps) {
  return {
    keycolor,
    'data-chat-dir': direction,
    ji: direction,
    ...props,
  };
}
