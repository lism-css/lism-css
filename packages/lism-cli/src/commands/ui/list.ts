import { fetchCatalog, type FetchOptions, type RegistryCatalog } from './fetcher.js';
import { logger } from '../../logger.js';
import { t } from '../../i18n.js';

interface ListOptions {
  ref?: string;
}

export async function listCommand(options: ListOptions = {}): Promise<void> {
  logger.info(t('ui.list.fetching'));

  const fetchOpts: FetchOptions = { ref: options.ref };
  let catalog: RegistryCatalog;
  try {
    catalog = await fetchCatalog(fetchOpts);
  } catch (err) {
    const refInfo = options.ref ? ` (ref: ${options.ref})` : '';
    const reason = err instanceof Error ? err.message : String(err);
    logger.error(t('ui.catalogFailed', { refInfo, reason }));
    process.exit(1);
  }

  logger.log(`\nLism UI v${catalog.version}\n`);
  logger.log(t('ui.list.header'));

  for (const component of catalog.components) {
    const helpers = component.helpers.length > 0 ? ` (helpers: ${component.helpers.join(', ')})` : '';
    logger.log(`  - ${component.name}${helpers}`);
  }

  logger.log(`\n${t('ui.list.total', { count: catalog.components.length })}`);
}
