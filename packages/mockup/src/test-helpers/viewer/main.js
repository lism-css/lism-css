// テスト用の最小ビューア entry。仮想モジュールの契約（pages / tokens.css / tokens）だけを確認する。
import 'virtual:lism-mockup/tokens.css';
import { pages, title } from 'virtual:lism-mockup/pages';
import { tokenGroups } from 'virtual:lism-mockup/tokens';

globalThis.__LISM_MOCK_TEST__ = { pages, title, tokenGroups };
