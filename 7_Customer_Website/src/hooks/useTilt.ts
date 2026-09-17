import { useCallback, useRef, type MouseEvent, type RefObject } from 'react';

interface Tilt<T extends HTMLElement> {
  ref: RefObject<T>;
  onMouseMove: (e: MouseEvent<T>) => void;
  onMouseLeave: () => void;
}

/**
 * 3D tilt-on-hover — rotates the element toward the cursor and moves a
 * glare highlight (via --gx/--gy consumed by `.tilt-glare::after`).
 * Pure CSS transforms, no libraries. Safe no-op on touch devices
 * (no mousemove fires, so cards stay flat).
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(maxDeg = 9): Tilt<T> {
  const ref = useRef<T>(null);

  const onMouseMove = useCallback(
    (e: MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const ry = (px - 0.5) * maxDeg * 2;
      const rx = (0.5 - py) * maxDeg * 2;
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    },
    [maxDeg],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
