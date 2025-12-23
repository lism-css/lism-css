import buildCSS from './build-css.js';
import buildConfig from './build-config.js';
import { CONFIG } from '../config/index.ts';

await buildConfig(CONFIG);
await buildCSS();
