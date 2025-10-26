import fs from 'node:fs';
import path from 'node:path';

import { normalizePath } from 'vite';

const TARGET_ID = 'lism-css/config.js';
const SEARCH = ['lism.config.mjs', 'lism.config.js', 'lism.config.ts'];

export default function mynpm(opts = {}) {
	let root = '';
	let userPath = null;

	// Memo: normalizePath は existsSync の前には使わない
	const resolveUserConfig = () => {
		if (opts.configPath) {
			const abs = path.resolve(root, opts.configPath);
			if (fs.existsSync(abs)) {
				return normalizePath(abs);
			} else {
				// 指定されたファイルが存在しない場合
				console.error(`指定されたファイルが存在しません: ${abs}`);
			}
		}

		for (const cand of SEARCH) {
			const abs = path.resolve(root, cand);
			if (fs.existsSync(abs)) return normalizePath(abs);
		}
		return null;
	};

	return {
		name: 'lism-css/vite-config-plugin',
		enforce: 'pre',

		configResolved(c) {
			root = c.root;
		},

		// ★ これがポイント：config フックで alias を注入して最優先で差し替える
		config(_, env) {
			userPath = resolveUserConfig();
			const cfg = {
				optimizeDeps: {
					// ここが重要：lism-css を deps バンドル対象から外す(キャッシュ対策)
					exclude: ['lism-css/config.js'],
				},
			};
			if (!userPath) return; // ユーザー設定が無ければ何もしない（デフォルトへ）

			cfg.resolve = {
				alias: {
					[TARGET_ID]: userPath,
				},
			};

			return cfg;
		},

		// ファイル更新時にリロードする
		handleHotUpdate({ server, modules, timestamp }) {
			//     if (!userPath) return;
			//     if (normalizePath(ctx.file) !== userPath) return;
			//     // 依存関係キャッシュの再構築を強制
			//     ctx.server.ws.send({ type: "full-reload" });
			const invalidatedModules = new Set();
			for (const mod of modules) {
				server.moduleGraph.invalidateModule(mod, invalidatedModules, timestamp, true);
			}
			server.ws.send({ type: 'full-reload' });
			return [];
		},
	};
}
