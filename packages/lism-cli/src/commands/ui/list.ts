import { fetchCatalog, type FetchOptions } from './fetcher.js';
import { logger } from '../../logger.js';

interface ListOptions {
  force?: boolean;
  ref?: string;
}

export async function listCommand(options: ListOptions = {}): Promise<void> {
  logger.info('コンポーネント一覧を取得中...');

  const fetchOpts: FetchOptions = { ref: options.ref, force: options.force };
  const catalog = await fetchCatalog(fetchOpts);

  logger.log(`\nLism UI v${catalog.version}\n`);
  logger.log('コンポーネント:');

  for (const component of catalog.components) {
    const helpers = component.helpers.length > 0 ? ` (helpers: ${component.helpers.join(', ')})` : '';
    logger.log(`  - ${component.name}${helpers}`);
  }

  logger.log(`\n合計: ${catalog.components.length} コンポーネント`);
}
