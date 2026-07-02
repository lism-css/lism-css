import '@testing-library/jest-dom/vitest';

// jsdom の requestAnimationFrame は実フレームに紐づかないため setTimeout ベースの shim に差し替える。
// 同期実行にはせず 1 tick 遅らせることで、「次フレームで実行される」という非同期境界を再現する
Object.defineProperty(window, 'requestAnimationFrame', {
  value: (cb: FrameRequestCallback) => window.setTimeout(() => cb(performance.now()), 0),
  writable: true,
});

// jsdom は HTMLDialogElement.showModal / close を実装していないため最小スタブ
if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  }
}
