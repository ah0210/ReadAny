/**
 * Mobile iframe event handlers — bridges events from foliate-js iframe
 * to the main window via postMessage.
 *
 * Mobile-optimized: prioritizes touch events over mouse events.
 */

const LONG_HOLD_THRESHOLD = 500;
let longHoldTimeout: ReturnType<typeof setTimeout> | null = null;

const handleTouchEv = (bookKey: string, event: TouchEvent, type: string) => {
  const touch = event.targetTouches[0];
  const touches: Array<{
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
  }> = [];
  if (touch) {
    touches.push({
      clientX: touch.clientX,
      clientY: touch.clientY,
      screenX: touch.screenX,
      screenY: touch.screenY,
    });
  }
  window.postMessage(
    { type, bookKey, timeStamp: Date.now(), targetTouches: touches },
    "*",
  );
};

export const handleKeydown = (bookKey: string, event: KeyboardEvent) => {
  window.postMessage(
    {
      type: "iframe-keydown",
      bookKey,
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
    },
    "*",
  );
};

export const handleMousedown = (bookKey: string, event: MouseEvent) => {
  longHoldTimeout = setTimeout(() => {
    longHoldTimeout = null;
  }, LONG_HOLD_THRESHOLD);

  window.postMessage(
    {
      type: "iframe-mousedown",
      bookKey,
      button: event.button,
      clientX: event.clientX,
      clientY: event.clientY,
    },
    "*",
  );
};

export const handleMouseup = (bookKey: string, event: MouseEvent) => {
  const isLongHold = !longHoldTimeout;
  if (longHoldTimeout) {
    clearTimeout(longHoldTimeout);
    longHoldTimeout = null;
  }
  window.postMessage(
    {
      type: "iframe-mouseup",
      bookKey,
      button: event.button,
      clientX: event.clientX,
      clientY: event.clientY,
      isLongHold,
    },
    "*",
  );
};

export const handleWheel = (bookKey: string, event: WheelEvent) => {
  event.preventDefault();
  window.postMessage(
    {
      type: "iframe-wheel",
      bookKey,
      deltaMode: event.deltaMode,
      deltaX: event.deltaX,
      deltaY: event.deltaY,
    },
    "*",
  );
};

export const handleTouchStart = (bookKey: string, event: TouchEvent) =>
  handleTouchEv(bookKey, event, "iframe-touchstart");

export const handleTouchMove = (bookKey: string, event: TouchEvent) =>
  handleTouchEv(bookKey, event, "iframe-touchmove");

export const handleTouchEnd = (bookKey: string, event: TouchEvent) =>
  handleTouchEv(bookKey, event, "iframe-touchend");

/**
 * Register all iframe event handlers on a loaded document.
 * Called each time a new section is loaded by foliate-view.
 */
export function registerIframeEventHandlers(bookKey: string, doc: Document): void {
  // biome-ignore lint: runtime flag on Document
  if ((doc as any).__readany_mobile_events) return;
  // biome-ignore lint: runtime flag on Document
  (doc as any).__readany_mobile_events = true;

  doc.addEventListener("keydown", handleKeydown.bind(null, bookKey));
  doc.addEventListener("mousedown", handleMousedown.bind(null, bookKey));
  doc.addEventListener("mouseup", handleMouseup.bind(null, bookKey));
  doc.addEventListener("wheel", handleWheel.bind(null, bookKey), { passive: false });
  doc.addEventListener("touchstart", handleTouchStart.bind(null, bookKey));
  doc.addEventListener("touchmove", handleTouchMove.bind(null, bookKey));
  doc.addEventListener("touchend", handleTouchEnd.bind(null, bookKey));
}
