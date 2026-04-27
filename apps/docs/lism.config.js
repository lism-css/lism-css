import DEFAULT_CONFIG from 'lism-css/default-config';
const { props, tokens } = DEFAULT_CONFIG;

export default {
  props: {
    // p="box" → -p:box へ出力できるようにする。（CSS生成はCLIビルドor手動追加が必要）
    p: { utils: { box: '2em' } },

    // filter: { utils: { 'blur:s': 'blur(3px)', 'blur:m': 'blur(5px)' } },
  },
  // トークン追加
  tokens: {
    // ltsはトークン値がクラス化されるので、 lts="xl" → -lts:xl になる（CSSは手動追加必要）
    lts: [...(tokens.lts || []), 'xl'],
  },
};
