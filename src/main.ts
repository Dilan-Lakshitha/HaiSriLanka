/**
 * Boot after first paint frame so the static LCP <img> in index.html can paint
 * before Angular's long parse/eval tasks contend for the main thread.
 */
const start = () =>
  import('./bootstrap').then((m) => m.bootstrap()).catch((err) => console.error(err));

if (typeof requestAnimationFrame === 'function') {
  requestAnimationFrame(() => {
    requestAnimationFrame(start);
  });
} else {
  setTimeout(start, 0);
}
