/** BoxLink上でAltを押している間だけリンク判定を外し、文字選択を有効にする。 */
export default function enableSelectTextWithAltKeyAtBoxLink() {
  const boxes = document.querySelectorAll('.is--boxLink');

  boxes.forEach((box) => {
    let isAltPressed = false;
    let dragging = false;

    function startDragEvents() {
      if (dragging) return;
      dragging = true;
      box.classList.add('-linkoff');
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', cleanup);
      window.addEventListener('pointercancel', cleanup);
    }

    function cleanup() {
      box.classList.remove('-linkoff');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', cleanup);
      window.removeEventListener('pointercancel', cleanup);
      dragging = false;
    }

    function onPointerMove(e) {
      if (!e.altKey) {
        cleanup();
      }
    }

    function onKeyDown(e) {
      if (e.altKey && !isAltPressed) {
        isAltPressed = true;
        startDragEvents();
      }
    }

    function onKeyUp(e) {
      if (!e.altKey && isAltPressed) {
        isAltPressed = false;
        cleanup();
      }
    }

    box.addEventListener('pointerenter', (e) => {
      console.log('pointerenter');

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);

      if (e && 'altKey' in e && e.altKey && !isAltPressed) {
        isAltPressed = true;
        startDragEvents();
      }
    });

    box.addEventListener('pointerleave', () => {
      console.log('pointerleave');

      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      cleanup();
      isAltPressed = false;
    });
  });
}
