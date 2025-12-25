import satori from 'satori';
import fs from 'node:fs';
import path from 'node:path';

// OG画像用のSVGを生成する
export async function renderOgSvg(title: string, tags: string[]) {
	const fontUrl600 = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.19/files/noto-sans-jp-japanese-600-normal.woff';

	// publicディレクトリのパスを取得
	const publicDir = path.resolve(process.cwd(), 'public');

	// 背景画像とロゴをBase64エンコードして読み込む
	const bgImagePath = path.join(publicDir, 'og-bg.jpg');
	const logoPath = path.join(publicDir, 'logo.png');

	const bgImageBase64 = fs.readFileSync(bgImagePath).toString('base64');
	const bgImageDataUrl = `data:image/jpeg;base64,${bgImageBase64}`;

	// PNGロゴを読み込み
	const logoBase64 = fs.readFileSync(logoPath).toString('base64');
	const logoDataUrl = `data:image/png;base64,${logoBase64}`;

	// フォントを取得
	const fontData600 = await fetch(fontUrl600).then((res) => {
		if (!res.ok) throw new Error(`Failed to fetch font 600: ${res.statusText}`);
		return res.arrayBuffer();
	});

	return satori(
		<div
			style={{
				display: 'flex',
				height: '100%',
				width: '100%',
				position: 'relative',
			}}
		>
			{/* 背景画像 */}
			<img
				src={bgImageDataUrl}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
				}}
			/>
			{/* コンテンツコンテナ（左側に配置） */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'flex-start',
					padding: '80px',
					width: '60%',
					height: '100%',
					position: 'relative',
					// backgroundColor: 'rgba(25, 25, 25, 0.1)',
				}}
			>
				{/* ロゴ */}
				<img
					src={logoDataUrl}
					style={{
						height: '36px',
						marginBottom: '36px',
						marginTop: '-18px',
					}}
				/>
				{/* タイトル */}
				<div
					style={{
						display: 'flex',
						fontSize: 60,
						fontWeight: '600',
						color: '#1a1a1a',
						lineHeight: 1.4,
						lineBreak: 'strict',
						wordBreak: 'keep-all',
						// backgroundColor: 'rgba(25, 25, 25, 0.1)',
					}}
				>
					{title}
				</div>
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Noto Sans JP',
					data: fontData600,
					weight: 600,
					style: 'normal',
				},
			],
		}
	);
}
