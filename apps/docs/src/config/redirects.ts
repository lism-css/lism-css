export type AstroRedirects = Record<string, string>;

export type VercelRedirect = {
  source: string;
  destination: string;
  statusCode: 301;
};

export const astroRedirects: AstroRedirects = {
  // /docs/ -> /docs/overview/
  '/docs/': '/docs/overview/',
  // 非root言語用のリダイレクト
  '/en/docs/': '/en/docs/overview/',
  // Dummy -> DummyText 移動に伴うリダイレクト（/docs/core-components/ から /ui/ 配下へ移動）
  '/docs/core-components/dummy/': '/ui/dummytext/',
  '/en/docs/core-components/dummy/': '/en/ui/dummytext/',
  // typography -> tokens/typography に移動
  '/docs/typography/': '/docs/tokens/typography/',
  '/en/docs/typography/': '/en/docs/tokens/typography/',
  // props/* -> property-class/* に移動（bd / hov / max-sz）
  '/docs/props/bd/': '/docs/property-class/bd/',
  '/docs/props/hov/': '/docs/property-class/hov/',
  '/docs/props/max-sz/': '/docs/property-class/max-sz/',
  '/en/docs/props/bd/': '/en/docs/property-class/bd/',
  '/en/docs/props/hov/': '/en/docs/property-class/hov/',
  '/en/docs/props/max-sz/': '/en/docs/property-class/max-sz/',
  // module-class -> primitives リネーム（#247）
  '/docs/module-class/': '/docs/primitives/',
  '/en/docs/module-class/': '/en/docs/primitives/',
  // /docs/modules/* -> /docs/primitives/* / /docs/trait-class/* リネーム（#247 / #305）
  // is--* は #305 で /docs/trait-class/ 配下に移動、キャメルケース primitive 5 件（#252）はターゲットもキャメルケースで終端
  '/docs/modules/is--container/': '/docs/trait-class/is--container/',
  '/docs/modules/is--wrapper/': '/docs/trait-class/is--wrapper/',
  '/docs/modules/is--layer/': '/docs/trait-class/is--layer/',
  '/docs/modules/is--boxlink/': '/docs/trait-class/is--boxLink/',
  '/docs/modules/l--box/': '/docs/primitives/l--box/',
  '/docs/modules/l--center/': '/docs/primitives/l--center/',
  '/docs/modules/l--frame/': '/docs/primitives/l--frame/',
  '/docs/modules/l--flow/': '/docs/primitives/l--flow/',
  '/docs/modules/l--flex/': '/docs/primitives/l--flex/',
  '/docs/modules/l--cluster/': '/docs/primitives/l--cluster/',
  '/docs/modules/l--stack/': '/docs/primitives/l--stack/',
  '/docs/modules/l--grid/': '/docs/primitives/l--grid/',
  '/docs/modules/l--tilegrid/': '/docs/primitives/l--tileGrid/',
  '/docs/modules/l--columns/': '/docs/primitives/l--columns/',
  '/docs/modules/l--fluidcols/': '/docs/primitives/l--autoColumns/',
  '/docs/modules/l--sidemain/': '/docs/primitives/l--withSide/',
  '/docs/modules/l--switchcols/': '/docs/primitives/l--switchColumns/',
  '/docs/modules/a--decorator/': '/docs/primitives/a--decorator/',
  '/docs/modules/a--divider/': '/docs/primitives/a--divider/',
  '/docs/modules/a--icon/': '/docs/primitives/a--icon/',
  '/docs/modules/a--spacer/': '/docs/primitives/a--spacer/',
  '/en/docs/modules/is--container/': '/en/docs/trait-class/is--container/',
  '/en/docs/modules/is--wrapper/': '/en/docs/trait-class/is--wrapper/',
  '/en/docs/modules/is--layer/': '/en/docs/trait-class/is--layer/',
  '/en/docs/modules/is--boxlink/': '/en/docs/trait-class/is--boxLink/',
  '/en/docs/modules/l--box/': '/en/docs/primitives/l--box/',
  '/en/docs/modules/l--center/': '/en/docs/primitives/l--center/',
  '/en/docs/modules/l--frame/': '/en/docs/primitives/l--frame/',
  '/en/docs/modules/l--flow/': '/en/docs/primitives/l--flow/',
  '/en/docs/modules/l--flex/': '/en/docs/primitives/l--flex/',
  '/en/docs/modules/l--cluster/': '/en/docs/primitives/l--cluster/',
  '/en/docs/modules/l--stack/': '/en/docs/primitives/l--stack/',
  '/en/docs/modules/l--grid/': '/en/docs/primitives/l--grid/',
  '/en/docs/modules/l--tilegrid/': '/en/docs/primitives/l--tileGrid/',
  '/en/docs/modules/l--columns/': '/en/docs/primitives/l--columns/',
  '/en/docs/modules/l--fluidcols/': '/en/docs/primitives/l--autoColumns/',
  '/en/docs/modules/l--sidemain/': '/en/docs/primitives/l--withSide/',
  '/en/docs/modules/l--switchcols/': '/en/docs/primitives/l--switchColumns/',
  '/en/docs/modules/a--decorator/': '/en/docs/primitives/a--decorator/',
  '/en/docs/modules/a--divider/': '/en/docs/primitives/a--divider/',
  '/en/docs/modules/a--icon/': '/en/docs/primitives/a--icon/',
  '/en/docs/modules/a--spacer/': '/en/docs/primitives/a--spacer/',
  // is--linkBox -> is--boxLink リネーム（#245）で漏れていた旧 URL 対応
  '/docs/modules/is--linkbox/': '/docs/trait-class/is--boxLink/',
  '/en/docs/modules/is--linkbox/': '/en/docs/trait-class/is--boxLink/',
  // 小文字 primitive URL -> キャメルケース互換リダイレクト（#252）
  // 一時的に公開されていた小文字 URL を踏んだ場合のフォールバック
  '/docs/primitives/is--boxlink/': '/docs/trait-class/is--boxLink/',
  '/docs/primitives/l--tilegrid/': '/docs/primitives/l--tileGrid/',
  '/docs/primitives/l--fluidcols/': '/docs/primitives/l--autoColumns/',
  '/docs/primitives/l--sidemain/': '/docs/primitives/l--withSide/',
  '/docs/primitives/l--switchcols/': '/docs/primitives/l--switchColumns/',
  '/en/docs/primitives/is--boxlink/': '/en/docs/trait-class/is--boxLink/',
  '/en/docs/primitives/l--tilegrid/': '/en/docs/primitives/l--tileGrid/',
  '/en/docs/primitives/l--fluidcols/': '/en/docs/primitives/l--autoColumns/',
  '/en/docs/primitives/l--sidemain/': '/en/docs/primitives/l--withSide/',
  '/en/docs/primitives/l--switchcols/': '/en/docs/primitives/l--switchColumns/',
  // is--* の primitives/ -> trait-class/ 移動（#305）
  // is--boxLink は既に小文字互換リダイレクトがあるため、Astro のケース非依存ルーティングと衝突する camelCase 版は登録しない
  '/docs/primitives/is--container/': '/docs/trait-class/is--container/',
  '/docs/primitives/is--wrapper/': '/docs/trait-class/is--wrapper/',
  '/docs/primitives/is--layer/': '/docs/trait-class/is--layer/',
  '/en/docs/primitives/is--container/': '/en/docs/trait-class/is--container/',
  '/en/docs/primitives/is--wrapper/': '/en/docs/trait-class/is--wrapper/',
  '/en/docs/primitives/is--layer/': '/en/docs/trait-class/is--layer/',
  // purge -> customize/purge 移動（Customize セクション化に伴う統合）
  '/docs/purge/': '/docs/customize/purge/',
  '/en/docs/purge/': '/en/docs/customize/purge/',
  // Chat をパッケージから削除し、Block Examples の作例ページへ転換（#557）
  '/ui/chat/': '/ui/block-examples/chat/',
  '/en/ui/chat/': '/en/ui/block-examples/chat/',
  // ui/examples/* -> ui/components/* へ移動（#557）
  // draft のまま未公開だったページは公開実績のある URL のみ登録する方針に従い対象外
  // Banner / Breadcrumb / Card / DividerLabel / Reel / Steps は ui/components/ に残るのでそのまま
  '/ui/examples/banner/': '/ui/components/banner/',
  '/ui/examples/breadcrumb/': '/ui/components/breadcrumb/',
  '/ui/examples/card/': '/ui/components/card/',
  '/ui/examples/dividerlabel/': '/ui/components/dividerlabel/',
  '/ui/examples/reel/': '/ui/components/reel/',
  '/ui/examples/steps/': '/ui/components/steps/',
  '/en/ui/examples/banner/': '/en/ui/components/banner/',
  '/en/ui/examples/breadcrumb/': '/en/ui/components/breadcrumb/',
  '/en/ui/examples/card/': '/en/ui/components/card/',
  '/en/ui/examples/dividerlabel/': '/en/ui/components/dividerlabel/',
  '/en/ui/examples/reel/': '/en/ui/components/reel/',
  '/en/ui/examples/steps/': '/en/ui/components/steps/',
  // FAQ を patterns/ へ移管（#566）
  // patterns にはカテゴリ単位のページがないため、一覧ページのカテゴリ見出し（アンカー）へ飛ばす。
  // #564 で張った ui/examples/* -> ui/components/* のリダイレクトは、連鎖を避けるため最終 URL へ張り直している。
  '/ui/components/faq/': '/patterns/#faq',
  // Hero は MDX を draft 化して本番非公開にしたため、作例のある patterns へ誘導する
  '/ui/components/hero/': '/patterns/#hero',
  '/ui/examples/faq/': '/patterns/#faq',
  '/ui/examples/hero/': '/patterns/#hero',
  '/en/ui/components/faq/': '/en/patterns/#faq',
  '/en/ui/components/hero/': '/en/patterns/#hero',
  '/en/ui/examples/faq/': '/en/patterns/#faq',
  '/en/ui/examples/hero/': '/en/patterns/#hero',
};

// Astro の static redirects では casing 違いの出力先が衝突するため、本番互換だけ Vercel 側に逃がす。
// Vercel の redirects はデフォルトで case-sensitive にマッチする。
export const vercelRedirects: VercelRedirect[] = [
  {
    source: '/docs/primitives/l--fluidCols/',
    destination: '/docs/primitives/l--autoColumns/',
    statusCode: 301,
  },
  {
    source: '/docs/primitives/l--sideMain/',
    destination: '/docs/primitives/l--withSide/',
    statusCode: 301,
  },
  {
    source: '/docs/primitives/l--switchCols/',
    destination: '/docs/primitives/l--switchColumns/',
    statusCode: 301,
  },
  {
    source: '/en/docs/primitives/l--fluidCols/',
    destination: '/en/docs/primitives/l--autoColumns/',
    statusCode: 301,
  },
  {
    source: '/en/docs/primitives/l--sideMain/',
    destination: '/en/docs/primitives/l--withSide/',
    statusCode: 301,
  },
  {
    source: '/en/docs/primitives/l--switchCols/',
    destination: '/en/docs/primitives/l--switchColumns/',
    statusCode: 301,
  },
];
