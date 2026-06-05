import '@testing-library/jest-dom/vitest';

// jsdom の requestAnimationFrame はコールバックを即時実行しないため shim
Object.defineProperty(window, 'requestAnimationFrame', {
  value: (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  },
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
