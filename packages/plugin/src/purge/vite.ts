import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { basename, dirname } from 'node:path/posix';
import type { Plugin } from 'vite';
import { extractLismClasses } from './extract';
import { purgeLismCss } from './core';
import { LISM_CSS_SIGNATURE, formatReport, hasCssSourceMappingUrl, resolveKnownSelectors, stripCssSourceMappingUrl } from './shared';
import type { LismPurgeOptions } from './options';

export type { LismPurgeOptions } from './options';
export type { KnownSelectorSet } from './core';

function decodeAssetSource(source: string | Uint8Array): string {
  return typeof source === 'string' ? source : new TextDecoder().decode(source);
}

const REF_EXT = /\.(html?|js|mjs|cjs|json|txt|xml|map)$/;
// `<name>[.-]<hash>.css` 形式のハッシュ部を判定する。Vite 既定・本プラグインの shortContentHash はいずれも
// 8 文字英数字なので 8 文字ちょうどに限定する。緩い判定だと `my-styles.css` の `-styles` 等を誤ってハッシュ扱いしてしまう（#496）。
const HASHED_CSS_NAME = /^(.+)([.-])([A-Za-z0-9_-]{8})\.css$/;

interface RenameInfo {
  oldName: string;
  newName: string;
  oldBase: string;
  newBase: string;
}

function shortContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function getRenamedCssFileName(fileName: string, content: string): RenameInfo | null {
  const oldBase = basename(fileName);
  const match = HASHED_CSS_NAME.exec(oldBase);
  if (!match) return null;

  const newBase = `${match[1]}${match[2]}${shortContentHash(content)}.css`;
  if (newBase === oldBase) return null;

  const dir = dirname(fileName);
  return {
    oldName: fileName,
    newName: dir === '.' ? newBase : `${dir}/${newBase}`,
    oldBase,
    newBase,
  };
}

function replaceRenamedReferences(content: string, renames: RenameInfo[]): string {
  let out = content;
  for (const { oldName, newName, oldBase, newBase } of renames) {
    out = out.split(oldName).join(newName);
    if (oldBase !== oldName) {
      out = out.split(oldBase).join(newBase);
    }
  }
  return out;
}

// manifestやHTMLへ新しいCSS名を反映するため、Vite metadataのimportedCssを更新する。
function updateImportedCss(importedCss: Set<string> | undefined, renames: RenameInfo[]): void {
  if (!importedCss) return;
  for (const { oldName, newName } of renames) {
    if (importedCss.has(oldName)) {
      importedCss.delete(oldName);
      importedCss.add(newName);
    }
  }
}

export function lismPurge(options: LismPurgeOptions = {}): Plugin {
  return {
    name: 'lism-css:purge',
    apply: 'build',
    enforce: 'post',
    generateBundle(_outputOptions, bundle) {
      // known は build 実行時に解決する（関数形式の遅延解決にも対応）。
      const known = resolveKnownSelectors(options.known);
      const used = new Set<string>();
      const cssTargets: string[] = [];

      for (const [key, asset] of Object.entries(bundle)) {
        if (asset.type === 'asset') {
          if (key.endsWith('.css')) {
            cssTargets.push(key);
            continue;
          }
          if (/\.(html?|js|mjs|cjs)$/.test(key)) {
            extractLismClasses(decodeAssetSource(asset.source), used);
          }
        } else if (asset.type === 'chunk') {
          extractLismClasses(asset.code, used);
        }
      }

      let beforeBytes = 0;
      let afterBytes = 0;
      const renames: RenameInfo[] = [];
      const staleCssMaps = new Set<string>();

      for (const key of cssTargets) {
        const asset = bundle[key];
        if (asset.type !== 'asset') continue;
        const source = decodeAssetSource(asset.source);
        if (!LISM_CSS_SIGNATURE.test(source)) continue;
        const purged = purgeLismCss(source, { used, safelist: options.safelist, known });
        // purge差分もsourcemap参照も無ければ、末尾空白だけでrenameやhash再計算が走らないよう素通しする。
        if (purged === source && !hasCssSourceMappingUrl(source)) continue;
        const output = stripCssSourceMappingUrl(purged);
        asset.source = output;
        staleCssMaps.add(`${asset.fileName}.map`);
        const rename = getRenamedCssFileName(asset.fileName, output);
        if (rename) {
          asset.fileName = rename.newName;
          delete bundle[key];
          bundle[rename.newName] = asset;
          renames.push(rename);
        }
        beforeBytes += Buffer.byteLength(source);
        afterBytes += Buffer.byteLength(output);
      }

      if (staleCssMaps.size > 0) {
        for (const [key, asset] of Object.entries(bundle)) {
          if (asset.type === 'asset' && staleCssMaps.has(asset.fileName)) delete bundle[key];
        }
      }

      if (renames.length > 0) {
        for (const asset of Object.values(bundle)) {
          if (asset.type === 'chunk') {
            asset.code = replaceRenamedReferences(asset.code, renames);
            updateImportedCss(asset.viteMetadata?.importedCss, renames);
          } else if (REF_EXT.test(asset.fileName)) {
            asset.source = replaceRenamedReferences(decodeAssetSource(asset.source), renames);
          }
        }
      }

      if (options.report && beforeBytes > 0) {
        this.info(formatReport(beforeBytes, afterBytes));
      }
    },
  };
}
