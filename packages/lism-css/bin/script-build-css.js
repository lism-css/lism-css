import buildCSS from './build-css.js';
import buildConfig from './build-config.js';
import { CONFIG } from '../config/index.ts';
import { objDeepMerge } from '../config/helper.ts';
import propsFull from '../config/presets/props-full.ts';

await buildConfig(CONFIG);
// full.css 用（isVar系を除く全propsのBPをlgまで拡張）
await buildConfig(objDeepMerge(CONFIG, { props: propsFull }), '_prop-config-full.scss');
await buildCSS();
