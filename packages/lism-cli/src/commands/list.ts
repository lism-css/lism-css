import { fetchCatalog } from '../registry.js';
import { logger } from '../logger.js';

export async function listCommand(): Promise<void> {
  logger.info('コンポーネント一覧を取得中...');

  const catalog = await fetchCatalog();

  logger.log(`\nLism UI v${catalog.version}\n`);
  logger.log('コンポーネント:');

  for (const component of catalog.components) {
    const helpers = component.helpers.length > 0 ? ` (helpers: ${component.helpers.join(', ')})` : '';
    logger.log(`  - ${component.name}${helpers}`);
  }

  logger.log(`\n合計: ${catalog.components.length} コンポーネント`);
}
