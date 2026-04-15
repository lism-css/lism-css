/**
 * Chat コンポーネントの共通プロパティ処理
 */
import atts from 'lism-css/lib/helper/atts';
import buildModifierClass from '../../helper/buildModifierClass';

export const defaultProps = {
  avatar: {
    className: 'c--chat_avatar',
    bgc: 'base',
    ar: '1/1',
    bdrs: '99',
    'aria-hidden': 'true',
  },
  name: {
    className: 'c--chat_name',
    c: 'text-2',
    fs: 'italic',
    fz: '2xs',
    lh: '1',
    py: '5',
    px: '10',
    aslf: 'end',
  },
  body: {
    className: 'c--chat_body',
    pos: 'relative',
  },
  deco: {
    className: 'c--chat_deco',
    util: 'cbox',
    isSkipFlow: true,
    pos: 'absolute',
  },
  content: {
    className: 'c--chat_content',
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
  className?: string;
  [key: string]: unknown;
};

/**
 * Chat コンポーネントのルートプロパティを生成
 */
export default function getChatProps({ variant = 'speak', direction = 'start', keycolor = 'gray', className, ...props }: ChatProps) {
  return {
    className: atts(className, buildModifierClass('c--chat', { variant })),
    keycolor,
    'data-chat-dir': direction,
    ji: direction,
    ...props,
  };
}
