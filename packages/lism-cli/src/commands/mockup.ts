import { logger } from '../logger.js';
import { t } from '../i18n.js';

/**
 * 画面モックアップ機能は別パッケージ `@lism-css/mockup` が提供する。
 * このコマンドは依存追加なしで案内のみを表示する。
 */
export function mockupCommand(): void {
  logger.log(t('mockup.guide'));
}
