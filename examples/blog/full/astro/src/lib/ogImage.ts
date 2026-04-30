/**
 * OG画像生成
 * - satori にオブジェクトリテラルでノードツリーを渡し、SVG を生成
 * - sharp で PNG に変換
 * - src/assets/og/ 配下のフォント・背景・ロゴを Base64 で埋め込み
 *   （public/ ではなく src/ に置くことで配信物に含めない）
 */
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

const assetsDir = path.resolve(process.cwd(), 'src/assets/og');

// アセット読み込み（モジュール初期化時に1度だけ）
const bgImageBase64 = fs.readFileSync(path.join(assetsDir, 'og-bg.png')).toString('base64');
const bgImageDataUrl = `data:image/png;base64,${bgImageBase64}`;

const logoBase64 = fs.readFileSync(path.join(assetsDir, 'logo.png')).toString('base64');
const logoDataUrl = `data:image/png;base64,${logoBase64}`;

const fontData = fs.readFileSync(path.join(assetsDir, 'noto-sans-jp-600.woff'));

const WIDTH = 1200;
const HEIGHT = 630;

export async function renderOgPng(title: string): Promise<Buffer> {
  const tree = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative',
      },
      children: [
        {
          type: 'img',
          props: {
            src: bgImageDataUrl,
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              padding: '80px',
              width: '60%',
              height: '100%',
              position: 'relative',
            },
            children: [
              {
                type: 'img',
                props: {
                  src: logoDataUrl,
                  style: {
                    height: '36px',
                    marginBottom: '36px',
                    marginTop: '-18px',
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 60,
                    fontWeight: 600,
                    color: '#1a1a1a',
                    lineHeight: 1.4,
                    lineBreak: 'strict',
                    wordBreak: 'keep-all',
                  },
                  children: title,
                },
              },
            ],
          },
        },
      ],
    },
  };

  // satori の型は ReactNode だが、オブジェクトリテラルで同等の構造を渡す

  const svg = await satori(tree as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'Noto Sans JP',
        data: fontData,
        weight: 600,
        style: 'normal',
      },
    ],
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}
