// テスト用の最小ビューア entry。仮想モジュールの契約（pages / tokens.css）だけを確認する。
import 'virtual:lism-mock/tokens.css';
import { pages, title } from 'virtual:lism-mock/pages';

globalThis.__LISM_MOCK_TEST__ = { pages, title };
