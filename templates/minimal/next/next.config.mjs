import { withLism } from '@lism-css/plugin/next';

/** @type {import('next').NextConfig} */
const nextConfig = {};

// withLism は lism.config.js を読み、config 反映済み CSS を `.lism-css/css/*` へ事前生成して
// `lism-css/<entry>.css` をその生成物へ alias する（Next.js には Vite/Astro のような bare CSS import の
// 横取り口が無いため）。dev 中は lism.config.js の変更を watch して CSS / 型を自動再生成する。
export default withLism(nextConfig);
