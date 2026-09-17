import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

/**
 * Visualizzatore a schermo intero per le foto delle acquisizioni.
 *
 * Interazioni:
 *   - rotella / pinch  -> zoom centrato sul puntatore
 *   - trascinamento    -> pan (solo quando si e' gia' zoomato)
 *   - doppio click     -> alterna adatta-schermo <-> 3x nel punto cliccato
 *   - Esc / sfondo / X -> chiude
 *
 * Reso in un portal su document.body: le foto vivono dentro <Modal> (z-[100]) e
 * un overlay annidato resterebbe intrappolato nel suo stacking context.
 */

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const WHEEL_STEP = 1.25;
const BUTTON_STEP = 1.5;
const DOUBLE_CLICK_SCALE = 3;
const DRAG_THRESHOLD_PX = 4;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const INITIAL_VIEW = { scale: MIN_SCALE, x: 0, y: 0 };

export default function ImageLightbox({ open, src, alt = '', title = '', onClose }) {
  const containerRef = useRef(null);
  const pointersRef = useRef(new Map());
  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const draggedRef = useRef(false);

  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [view, setView] = useState(INITIAL_VIEW);

  const isZoomed = view.scale > MIN_SCALE;

  // Quanto puo' scorrere l'immagine: solo la parte che deborda dal contenitore.
  // Serve la dimensione "fit" (object-contain), non quella naturale.
  const clampPoint = useCallback(
    (point, scale) => {
      const container = containerRef.current;
      if (!container || !natural.width || !natural.height) {
        return { x: 0, y: 0 };
      }

      const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
      const fit = Math.min(containerWidth / natural.width, containerHeight / natural.height);
      const maxX = Math.max(0, (natural.width * fit * scale - containerWidth) / 2);
      const maxY = Math.max(0, (natural.height * fit * scale - containerHeight) / 2);

      return { x: clamp(point.x, -maxX, maxX), y: clamp(point.y, -maxY, maxY) };
    },
    [natural.height, natural.width]
  );

  // Zoom mantenendo fermo il punto sotto il puntatore (focal point zoom).
  const zoomTo = useCallback(
    (nextScaleRaw, focal) => {
      setView((current) => {
        const nextScale = clamp(nextScaleRaw, MIN_SCALE, MAX_SCALE);
        if (nextScale === current.scale) return current;

        const container = containerRef.current;
        if (!container) return { ...current, scale: nextScale };

        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const focalX = (focal?.x ?? centerX) - centerX;
        const focalY = (focal?.y ?? centerY) - centerY;
        const ratio = nextScale / current.scale;

        const next = {
          x: focalX * (1 - ratio) + current.x * ratio,
          y: focalY * (1 - ratio) + current.y * ratio,
        };

        return { scale: nextScale, ...clampPoint(next, nextScale) };
      });
    },
    [clampPoint]
  );

  const resetView = useCallback(() => setView(INITIAL_VIEW), []);

  // Ogni foto riparte adattata allo schermo.
  useEffect(() => {
    resetView();
    setNatural({ width: 0, height: 0 });
  }, [src, resetView]);

  // Esc chiude; blocca lo scroll della pagina sotto l'overlay.
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      // capture + stopPropagation: la modale sottostante non deve chiudersi anche lei.
      event.stopPropagation();
      onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  // Listener non-passivo: React registra 'wheel' come passivo e preventDefault verrebbe ignorato.
  useEffect(() => {
    const container = containerRef.current;
    if (!open || !container) return undefined;

    const handleWheel = (event) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? WHEEL_STEP : 1 / WHEEL_STEP;
      zoomTo(view.scale * factor, { x: event.clientX, y: event.clientY });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [open, view.scale, zoomTo]);

  const handlePointerDown = (event) => {
    const container = containerRef.current;
    if (!container) return;

    container.setPointerCapture?.(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    draggedRef.current = false;

    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale: view.scale };
      panRef.current = null;
      return;
    }

    panRef.current = { startX: event.clientX, startY: event.clientY, originX: view.x, originY: view.y };
  };

  const handlePointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size >= 2) {
      const pinch = pinchRef.current;
      if (!pinch || pinch.distance <= 0) return;

      const [a, b] = [...pointersRef.current.values()];
      draggedRef.current = true;
      zoomTo(pinch.scale * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.distance), {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      });
      return;
    }

    const pan = panRef.current;
    if (!pan) return;

    const deltaX = event.clientX - pan.startX;
    const deltaY = event.clientY - pan.startY;
    if (Math.abs(deltaX) > DRAG_THRESHOLD_PX || Math.abs(deltaY) > DRAG_THRESHOLD_PX) {
      draggedRef.current = true;
    }

    setView((current) => {
      if (current.scale <= MIN_SCALE) return current;
      return {
        ...current,
        ...clampPoint({ x: pan.originX + deltaX, y: pan.originY + deltaY }, current.scale),
      };
    });
  };

  const handlePointerUp = (event) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) panRef.current = null;
  };

  const handleDoubleClick = (event) => {
    zoomTo(isZoomed ? MIN_SCALE : DOUBLE_CLICK_SCALE, { x: event.clientX, y: event.clientY });
  };

  // Click sullo sfondo chiude, ma non se stiamo finendo un pan.
  const handleBackdropClick = (event) => {
    if (event.target !== event.currentTarget) return;
    if (draggedRef.current) return;
    onClose?.();
  };

  const handleImageLoad = (event) => {
    setNatural({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    });
  };

  if (!open || !src) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950/90 backdrop-blur-sm">
      <header className="flex flex-none items-center gap-3 px-4 py-3 text-white">
        <div className="min-w-0 flex-1">
          {title && <p className="truncate text-sm font-semibold">{title}</p>}
        </div>

        <div className="flex flex-none items-center gap-1.5">
          <span className="mr-1 hidden min-w-[3.5rem] text-center text-xs font-semibold tabular-nums text-slate-300 sm:block">
            {Math.round(view.scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => zoomTo(view.scale / BUTTON_STEP)}
            disabled={view.scale <= MIN_SCALE}
            title="Riduci"
            className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ZoomOut className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => zoomTo(view.scale * BUTTON_STEP)}
            disabled={view.scale >= MAX_SCALE}
            title="Ingrandisci"
            className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ZoomIn className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={resetView}
            disabled={!isZoomed}
            title="Adatta allo schermo"
            className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Maximize2 className="h-5 w-5" />
          </button>

          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            title="Apri in una nuova scheda"
            className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
          >
            <ExternalLink className="h-5 w-5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            title="Chiudi (Esc)"
            className="ml-1 rounded-lg bg-red-600/80 p-2 transition hover:bg-red-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onClick={handleBackdropClick}
        className={`relative min-h-0 flex-1 touch-none select-none overflow-hidden ${
          isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
      >
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          draggable={false}
          className="pointer-events-none absolute inset-0 m-auto max-h-full max-w-full object-contain"
          style={{
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
            transition: panRef.current || pinchRef.current ? 'none' : 'transform 120ms ease-out',
          }}
        />
      </div>

      <footer className="flex-none px-4 py-2 text-center text-xs text-slate-400">
        Rotella o pinch per zoomare · doppio click per adattare · trascina per spostare · Esc per chiudere
      </footer>
    </div>,
    document.body
  );
}
