// テスト用の最小ビューア entry。仮想モジュールの契約（pages / tokens.css）だけを確認する。
import 'virtual:lism-mockup/tokens.css';
import { pages, title } from 'virtual:lism-mockup/pages';

globalThis.__LISM_MOCK_TEST__ = { pages, title };
