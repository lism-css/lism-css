/**
 * Chat コンポーネントの共通プロパティ処理
 */

export const defaultProps = {
  avatar: {
    lismClass: 'c--chat_avatar',
    bgc: 'base',
    ar: '1/1',
    bdrs: '99',
    'aria-hidden': 'true',
  },
  name: {
    lismClass: 'c--chat_name',
    c: 'text-2',
    fs: 'italic',
    fz: '2xs',
    lh: '1',
    py: '5',
    px: '10',
    aslf: 'end',
  },
  body: {
    lismClass: 'c--chat_body',
    pos: 'relative',
  },
  deco: {
    lismClass: 'c--chat_deco',
    util: 'cbox',
    isSkipFlow: true,
    pos: 'absolute',
  },
  content: {
    lismClass: 'c--chat_content',
    util: 'cbox',
    bdrs: '30',
    p: '20',
    lh: 's',
  },
} as const;

export type ChatProps = {
  variant?: string;
  direction?: string;
  keycolor?: string;
  [key: string]: unknown;
};

/**
 * Chat コンポーネントのルートプロパティを生成
 */
export default function getChatProps({ variant = 'speak', direction = 'start', keycolor = 'gray', ...props }: ChatProps) {
  return {
    lismClass: 'c--chat',
    variant,
    keycolor,
    'data-chat-dir': direction,
    ji: direction,
    ...props,
  };
}
