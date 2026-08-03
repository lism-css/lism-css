import { logger } from '../logger.js';
import { t } from '../i18n.js';

/**
 * デザインモック機能は別パッケージ `@lism-css/mock` が提供する。
 * このコマンドは依存追加なしで案内のみを表示する。
 */
export function mockCommand(): void {
  logger.log(t('mock.guide'));
}
