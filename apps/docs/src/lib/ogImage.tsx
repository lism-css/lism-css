import satori from 'satori';
import fs from 'node:fs';
import path from 'node:path';

interface OgImageParams {
  title: string;
  description?: string;
}

// 罫線・テキスト列・ロゴの位置は互いの間隔から決まるため、基準値から算出する
const RULE_INSET = 64;
const RULE_HEIGHT = 2;

// フォントとロゴを埋め込んだOG画像用SVGを生成する
export async function renderOgSvg({ title, description }: OgImageParams) {
  // OG画像生成用アセットのディレクトリパス（配信物に含めないため src 配下に配置）
  const assetsDir = path.resolve(process.cwd(), 'src/assets/og');

  const logoBase64 = fs.readFileSync(path.join(assetsDir, 'logo.png')).toString('base64');
  const logoDataUrl = `data:image/png;base64,${logoBase64}`;

  // satori は WOFF2 を読めないため、サブセット済みTTFを同梱している（生成は scripts/subset-og-font.ts）
  const fontData400 = fs.readFileSync(path.join(assetsDir, 'gen-interface-jp-400.ttf'));
  const fontData600 = fs.readFileSync(path.join(assetsDir, 'gen-interface-jp-600.ttf'));

  return satori(
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#fafafa',
        fontFamily: 'Gen Interface JP',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: RULE_INSET,
          left: 0,
          width: '100%',
          height: RULE_HEIGHT,
          backgroundColor: '#d4d4d4',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: RULE_INSET,
          left: 0,
          width: '100%',
          height: RULE_HEIGHT,
          backgroundColor: '#d4d4d4',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          position: 'absolute',
          top: RULE_INSET + RULE_HEIGHT + 48,
          left: 80,
          width: 960,
        }}
      >
        <div
          style={{
            // satori の lineClamp はブロック要素で動く
            display: 'block',
            fontSize: 72,
            fontWeight: 600,
            lineHeight: 1.375,
            letterSpacing: '0.0125em',
            color: '#1a1a1a',
            lineClamp: 2,
            textOverflow: 'ellipsis',
            lineBreak: 'strict',
            wordBreak: 'keep-all',
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: 'block',
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.625,
              letterSpacing: '0.0125em',
              color: '#555',
              lineClamp: 2,
              textOverflow: 'ellipsis',
            }}
          >
            {description}
          </div>
        ) : null}
      </div>
      <img
        src={logoDataUrl}
        style={{
          position: 'absolute',
          right: 32,
          bottom: RULE_INSET + RULE_HEIGHT + 29,
          height: 36,
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Gen Interface JP', data: fontData400, weight: 400, style: 'normal' },
        { name: 'Gen Interface JP', data: fontData600, weight: 600, style: 'normal' },
      ],
    }
  );
}
