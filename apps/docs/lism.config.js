export default {
  props: {
    // p="box" → -p:box へ出力できるようにする。（lism-css/vite プラグインが lism.config.js から CSS を自動生成）
    p: { utils: { box: '2em' } },

    // filter: { utils: { 'blur:s': 'blur(3px)', 'blur:m': 'blur(5px)' } },
  },
  // トークン追加（値付きフラットマップ。既定トークンへ deep-merge される）
  tokens: {
    // lts はトークン値がクラス化されるので、値を書くと lts="2xl" → -lts:2xl になる（CSS もプラグインが自動生成）
    lts: { '2xl': '.5em' },
  },
};
