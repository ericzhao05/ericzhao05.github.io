// Arrow keys step between star labels in orbit order; Enter activates the
// focused label (opens the section); Escape is handled by the overlay. Tab order
// already follows orbit order because star labels are appended in that order and
// moon labels stay tabindex=-1 until focused (spec §8.4).
export function initKeyboard(starEls: HTMLElement[]) {
  const NEXT = ["ArrowRight", "ArrowDown"];
  const PREV = ["ArrowLeft", "ArrowUp"];

  window.addEventListener("keydown", (e) => {
    if (![...NEXT, ...PREV].includes(e.key)) return;
    const active = document.activeElement as HTMLElement;
    let idx = starEls.indexOf(active);
    if (idx === -1) {
      idx = 0;
    } else {
      idx += NEXT.includes(e.key) ? 1 : -1;
      idx = (idx + starEls.length) % starEls.length;
    }
    e.preventDefault();
    starEls[idx].focus();
  });
}
