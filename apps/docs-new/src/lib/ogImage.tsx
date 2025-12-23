import satori from 'satori';

// OG画像用のSVGを生成する
export async function renderOgSvg(title: string, tags: string[]) {
	const fontUrl600 = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.19/files/noto-sans-jp-japanese-600-normal.woff';
	// const fontUrl500 = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.19/files/noto-sans-jp-japanese-500-normal.woff';

	// 並列でフォントを取得
	const [fontData600] = await Promise.all([
		fetch(fontUrl600).then((res) => {
			if (!res.ok) throw new Error(`Failed to fetch font 600: ${res.statusText}`);
			return res.arrayBuffer();
		}),
		// fetch(fontUrl500).then((res) => {
		//     if (!res.ok) throw new Error(`Failed to fetch font 500: ${res.statusText}`);
		//     return res.arrayBuffer();
		// }),
	]);

	return satori(
		<div
			style={{
				display: 'flex',
				height: '100%',
				width: '100%',
				padding: '1%',
				backgroundColor: '#4a6375',
			}}
		>
			<div
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					padding: '4%',
					backgroundColor: '#fff',
					borderRadius: '0 12px 12px 0',
					backgroundImage: 'linear-gradient(110deg, #4a6375 20%, transparent 0%), linear-gradient(75deg, #f0eee9 20%, transparent 0%)',
				}}
			>
				<div
					style={{
						display: 'flex',
						fontSize: 72,
						fontWeight: '600',
						color: '#000',
						marginLeft: '25%',
						marginBottom: '40px',
						width: '75%',
						lineBreak: 'strict',
						wordBreak: 'keep-all',
					}}
				>
					{title}
				</div>
				<div
					style={{
						display: 'flex',
						fontSize: 32,
						fontWeight: '600',
						position: 'absolute',
						bottom: '32px',
						right: '32px',
						color: '#4a6375',
					}}
				>
					lism-css.com
				</div>
			</div>
		</div>,
		{
			width: 1200 * 1.5,
			height: 630 * 1.5,
			fonts: [
				{
					name: 'Noto Sans JP',
					data: fontData600,
					weight: 600,
					style: 'normal',
				},
				// {
				//     name: 'Noto Sans JP',
				//     data: fontData500,
				//     weight: 500,
				//     style: 'normal',
				// },
			],
		}
	);
}
