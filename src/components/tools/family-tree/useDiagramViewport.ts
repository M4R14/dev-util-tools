import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../../lib/platform/motion';

/**
 * Never shrinks past this. It was 55% first, which turned out to be the worst of both worlds: a
 * fourteen-sibling generation rendered its names at seven pixels — unreadable — and still needed
 * horizontal scrolling. Below this, scrolling at a legible size is the better trade.
 */
const MIN_FIT_SCALE = 0.85;
export const ZOOM_STEP = 0.2;
const ZOOM_RANGE = { min: 0.4, max: 2.5 };

export interface RevealTarget {
  /** Scrolling happens only when this changes, not whenever the coordinates move. */
  key: string;
  x: number;
  y: number;
}

interface UseDiagramViewportOptions {
  contentWidth: number;
  contentHeight: number;
  reveal: RevealTarget | null;
}

export interface DiagramViewport {
  /** Goes on the scrolling element; the hook reads its size and drives its scroll position. */
  scrollRef: React.RefObject<HTMLDivElement>;
  scale: number;
  /** True while following the panel size rather than a zoom the reader picked. */
  isFitted: boolean;
  zoomBy: (delta: number) => void;
  fit: () => void;
  panHandlers: {
    onPointerDown: (event: React.PointerEvent) => void;
    onPointerMove: (event: React.PointerEvent) => void;
    onPointerUp: (event: React.PointerEvent) => void;
    onPointerCancel: (event: React.PointerEvent) => void;
  };
}

/**
 * How much of the diagram is on screen, and where.
 *
 * Zoom, fit, drag-to-pan and scroll-to-reveal all read or write the same two numbers — the scroll
 * offsets of one element — so they are one module rather than four sets of hooks tangled together
 * in the renderer.
 *
 * The element this drives must have a **fixed height**. `fit` measures the box to choose a scale,
 * so a height that grew with the content would feed back into the number that produced it.
 */
export const useDiagramViewport = ({
  contentWidth,
  contentHeight,
  reveal,
}: UseDiagramViewportOptions): DiagramViewport => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  /** `null` means "follow the panel"; a number is an explicit zoom the reader chose. */
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) =>
      setViewport({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /**
   * The largest scale that still shows the whole tree, within what stays readable.
   *
   * This was capped at 1, which made Fit a permanently dead button for any tree narrower than the
   * panel — which is most of them. Fitting means filling the box, so it scales up as well as down.
   * Both axes count, or a tall tree "fits" the width and runs off the bottom.
   */
  const fitScale =
    viewport.width === 0 || contentWidth === 0 || contentHeight === 0
      ? 1
      : Math.min(
          ZOOM_RANGE.max,
          Math.max(
            MIN_FIT_SCALE,
            Math.min(viewport.width / contentWidth, viewport.height / contentHeight),
          ),
        );

  const scale = zoom ?? fitScale;

  const zoomBy = (delta: number) =>
    setZoom((current) =>
      Math.min(ZOOM_RANGE.max, Math.max(ZOOM_RANGE.min, (current ?? fitScale) + delta)),
    );

  const revealedRef = useRef<string | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !reveal) return;

    /*
     * Only on a change of target. The editor writes through on every keystroke, which rebuilds the
     * layout, which would otherwise re-centre the diagram under the cursor on every letter typed.
     */
    if (revealedRef.current === reveal.key) return;
    revealedRef.current = reveal.key;

    container.scrollTo({
      left: reveal.x * scale - container.clientWidth / 2,
      top: reveal.y * scale - container.clientHeight / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [reveal, scale]);

  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  const panHandlers: DiagramViewport['panHandlers'] = {
    onPointerDown: (event) => {
      // Let clicks on a member reach the member.
      if ((event.target as Element).closest('[data-member]')) return;

      const container = scrollRef.current;
      if (!container) return;

      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        left: container.scrollLeft,
        top: container.scrollTop,
      };
      container.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      const drag = dragRef.current;
      const container = scrollRef.current;
      if (!drag || !container) return;

      container.scrollLeft = drag.left - (event.clientX - drag.x);
      container.scrollTop = drag.top - (event.clientY - drag.y);
    },
    onPointerUp: (event) => {
      dragRef.current = null;
      scrollRef.current?.releasePointerCapture(event.pointerId);
    },
    onPointerCancel: (event) => {
      dragRef.current = null;
      scrollRef.current?.releasePointerCapture(event.pointerId);
    },
  };

  return {
    scrollRef,
    scale,
    isFitted: zoom === null,
    zoomBy,
    fit: () => setZoom(null),
    panHandlers,
  };
};
