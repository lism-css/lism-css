/* eslint-disable no-console */
console.log('[SWELL] on Prefetch');

const IS_TEST_MODE = false;
function checkCanPrefetch() {
	// prefetch をブラウザがサポートしているかどうか
	const prefetcher = document.createElement('link');
	const isPrefetchSupported = prefetcher.relList && prefetcher.relList.supports && prefetcher.relList.supports('prefetch');
	if (!isPrefetchSupported) return false;

	// IntersectionObserver をブラウザがサポートしているかどうか
	const isObserveSupported = window.IntersectionObserver && 'isIntersecting' in IntersectionObserverEntry.prototype;
	if (!isObserveSupported) return false;

	// Promise をサポートしているかどうか
	const isPromiseSupported = 'undefined' !== typeof Promise; // !!window.Promise
	if (!isPromiseSupported) return false;

	// ユーザーの接続が遅くないか、データセーバーが ON かどうかチェック
	const isSlowConnection = navigator.connection && (navigator.connection.saveData || (navigator.connection.effectiveType || '').includes('2g')); //slow-2g or 2g なら slow 判定
	if (isSlowConnection) return false;

	return true;
}

function getIgnoreKeywords() {
	const defaultKeywords = ['/wp-admin/', '/wp-admin/'];

	// , で分割して配列化
	const ignorePrefetchKeys = (window.swellVars?.ignorePrefetchKeys || '').split(',');

	// defaultKeywords とマージ
	const keywords = ignorePrefetchKeys.reduce((accumulator, key) => {
		// 空白を削除
		const filteredKey = key.trim();
		// 空要素以外を追加する
		if (filteredKey !== '') {
			accumulator.push(key);
		}
		return accumulator;
	}, defaultKeywords);

	if (IS_TEST_MODE) console.log('除外キーワード一覧: ' + keywords);
	return keywords;
}

function setPrefetch() {
	// prefetch可能かチェック
	if (!checkCanPrefetch()) return;

	const QUEUED_URLS = new Set();
	const PREFETCHED_URLS = new Set();

	// タッチデバイスの判定
	const IS_TOUCH_DEVICE =
		'ontouchstart' in window ||
		navigator.maxTouchPoints > 0 ||
		// navigator.msMaxTouchPoints > 0 ||
		window.matchMedia('(pointer:coarse)').matches;
	if (IS_TEST_MODE) console.log('タッチデバイスかどうか: ' + IS_TOUCH_DEVICE);

	// 各オプション値をセット (window.swllllPrefetchOptions を定義することで上書き可能にしてる)
	const OPTIONS = {
		delay: 0,
		maxRPS: 3, // RPS: (1秒あたりのリクエスト数)
		hoverDelay: 50, // マウスオーバーしてから URL をキューに追加するまでの時間 (ms)
		observerDelay: 500, // ビューポートに入ってから URL をキューに追加するまでの時間 (ms)
		ignoreKeywords: getIgnoreKeywords(),
		...window.swllllPrefetchOptions,
	};

	// <link rel="prefetch" ...> を head 内に挿入する Promise 処理
	const addPrefetch = (url) =>
		new Promise((resolve, reject) => {
			const link = document.createElement(`link`);
			link.rel = `prefetch`;
			link.href = url;
			link.onload = resolve;
			link.onerror = reject;
			document.head.appendChild(link);
		});

	// 5000ms でタイムアウトさせるようにして prefetch 投げる
	const prefetchWithTimeout = (url) => {
		const timer = setTimeout(() => {
			stopPreloading();
			console.log('レスポンスが遅いため、プリロードを中断しました: ' + url);
		}, 5000);

		addPrefetch(url)
			.then(() => {
				if (IS_TEST_MODE) console.log('prefetch link 追加完了: ' + url);
			})
			.catch((error) => {
				console.error(error, url);
			})
			.finally(() => clearTimeout(timer));
	};

	// URL をキューに追加
	const addUrlToQueue = (url, processImmediately = false) => {
		if (PREFETCHED_URLS.has(url) || QUEUED_URLS.has(url)) return;

		// 外部 URL はプリロードしない
		const origin = window.location.origin;
		if (url.substring(0, origin.length) !== origin) return;

		// 現在のページはプリロードしない
		if (window.location.href === url) return;

		// 除外リストと照らし合わせる
		const hasIgonoreKeywords = OPTIONS.ignoreKeywords.some((keyword) => {
			return url.includes(keyword);
		});
		if (hasIgonoreKeywords) {
			if (IS_TEST_MODE) console.log('除外キーワード該当:', url);
			return;
		}

		if (IS_TEST_MODE) console.log('キューに追加: ' + url);

		// processImmediately が true の時 (maxRPS が0 or マウスホバー時) はすぐに処理
		if (processImmediately) {
			prefetchWithTimeout(url);
			PREFETCHED_URLS.add(url);
		} else {
			QUEUED_URLS.add(url);
		}
	};

	// ビューポート内に入ってきたリンクをキューに追加する (タッチデバイスのみ)
	const linksObserver = new IntersectionObserver((entries) => {
		// タッチデバイスではない (デスクトップブラウザ) の場合はキューに追加しない
		if (!IS_TOUCH_DEVICE) return;
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const url = entry.target.href;
				setTimeout(() => {
					if (IS_TEST_MODE) console.log('ビューポート内に入った: ' + url);

					// 最大RPS が 0 に設定されてるときは第2引数を true にしてすぐに処理させる
					addUrlToQueue(url, OPTIONS.maxRPS === 0);
				}, OPTIONS.observerDelay);
			}
		});
	});

	// RPS の数値に合わせて、 QUEUED_URLS を順番に処理していく
	const startQueue = () =>
		setInterval(() => {
			Array.from(QUEUED_URLS)
				.slice(0, OPTIONS.maxRPS)
				.forEach((url) => {
					prefetchWithTimeout(url);
					PREFETCHED_URLS.add(url); //処理が終わったら PREFETCHED_URLS へ追加
					QUEUED_URLS.delete(url); //さらに、QUEUED_URLS からは削除
				});
		}, 1000);

	let hoverTimer = null;

	// マウスホバー時にキューに追加。この時、第2引数の processImmediately は true にする
	const mouseOverListener = (event) => {
		const elm = event.target.closest('a');
		if (elm?.href && !PREFETCHED_URLS.has(elm.href)) {
			hoverTimer = setTimeout(() => {
				if (IS_TEST_MODE) console.log('マウスオーバーによるキューに追加開始: ' + elm.href);
				addUrlToQueue(elm.href, true);
			}, OPTIONS.hoverDelay);
		}
	};

	// タッチスタートイベントでも同様にキューに追加
	const touchStartListener = (event) => {
		const elm = event.target.closest('a');
		if (elm?.href && !PREFETCHED_URLS.has(elm.href)) {
			if (IS_TEST_MODE) console.log('タッチスタートによるキューに追加開始: ' + elm.href);
			addUrlToQueue(elm.href, true);
		}
	};

	// マウスアウト時、まだプリロードされてなければタイムアウトをクリアして処理を中断
	const mouseOutListener = (event) => {
		const elm = event.target.closest('a');
		if (elm?.href && !PREFETCHED_URLS.has(elm.href)) {
			if (IS_TEST_MODE) console.log('マウスアウトによるプリロード中断: ' + elm.href);
			clearTimeout(hoverTimer);
		}
	};

	// requestIdleCallback のコールバック関数を定義
	const requestIdleCallback =
		window.requestIdleCallback ||
		function (cb) {
			const start = Date.now();
			return setTimeout(() => {
				cb({
					didTimeout: false,
					timeRemaining() {
						return Math.max(0, 50 - (Date.now() - start));
					},
				});
			}, 1);
		};

	// サーバーからレスポンスが遅い時、中断させる
	const stopPreloading = () => {
		// 全てのリンクの監視を終了する
		document.querySelectorAll('a').forEach((e) => linksObserver.unobserve(e));

		// キューに追加されているURLをクリアする
		QUEUED_URLS.clear();

		// 全てのイベントリスナを削除する
		if (IS_TOUCH_DEVICE) {
			document.removeEventListener('touchstart', touchStartListener, true);
		} else {
			document.removeEventListener('mouseover', mouseOverListener, true);
			document.removeEventListener('mouseout', mouseOutListener, true);
		}
	};

	// キューの登録を開始する
	startQueue();

	// requestIdleCallback を使って、ブラウザがアイドル状態の時にビューポート内のリンクのプリロードを遅延発火
	requestIdleCallback(() => setTimeout(() => document.querySelectorAll('a').forEach((e) => linksObserver.observe(e)), OPTIONS.delay * 1000));

	// 各種イベントリスナを登録する
	const listenerOptions = { capture: true, passive: true };
	if (IS_TOUCH_DEVICE) {
		document.addEventListener('touchstart', touchStartListener, listenerOptions);
	} else {
		document.addEventListener('mouseover', mouseOverListener, listenerOptions);
		document.addEventListener('mouseout', mouseOutListener, listenerOptions);
	}
}

setPrefetch();
