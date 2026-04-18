import { fetchCatalog, type FetchOptions, type RegistryCatalog } from './fetcher.js';
import { logger } from '../../logger.js';

interface ListOptions {
  ref?: string;
}

export async function listCommand(options: ListOptions = {}): Promise<void> {
  logger.info('コンポーネント一覧を取得中...');

  const fetchOpts: FetchOptions = { ref: options.ref };
  let catalog: RegistryCatalog;
  try {
    catalog = await fetchCatalog(fetchOpts);
  } catch (err) {
    const refInfo = options.ref ? ` (ref: ${options.ref})` : '';
    const reason = err instanceof Error ? err.message : String(err);
    logger.error(`カタログの取得に失敗しました${refInfo}: ${reason}`);
    process.exit(1);
  }

  logger.log(`\nLism UI v${catalog.version}\n`);
  logger.log('コンポーネント:');

  // PascalCase → kebab-case。複合語のみ `(NavMenu/)` のように実ディレクトリ名を併記
  const toKebabCase = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

  for (const component of catalog.components) {
    const kebab = toKebabCase(component.name);
    const dirLabel = kebab !== component.name.toLowerCase() ? ` (${component.name}/)` : '';
    const helpers = component.helpers.length > 0 ? ` [helpers: ${component.helpers.join(', ')}]` : '';
    logger.log(`  - ${kebab}${dirLabel}${helpers}`);
  }

  logger.log(`\n合計: ${catalog.components.length} コンポーネント`);
}
