"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Stroke = { points: Point[]; w: number; h: number };

export function HandwritingPad({
  onChange,
  defaultImage,
  className,
}: {
  onChange: (dataUrl: string) => void;
  defaultImage?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const pointerId = useRef<number | null>(null);
  const defaultLoaded = useRef(false);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = container.clientWidth;
    const h = Math.max(160, Math.round(w * 0.4));
    if (w === 0) return;
    setSize({ w, h });
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    const lineGap = 34;
    for (let y = lineGap; y < h; y += lineGap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (const stroke of strokesRef.current) {
      if (stroke.points.length === 0) continue;
      const sx = w / stroke.w;
      const sy = h / stroke.h;
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x * sx, stroke.points[0].y * sy);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * sx, stroke.points[i].y * sy);
      }
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    redraw();
    if (defaultImage && !defaultLoaded.current) {
      defaultLoaded.current = true;
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const w = container.clientWidth;
        const h = Math.max(160, Math.round(w * 0.4));
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = defaultImage;
    }
  }, [defaultImage, redraw]);

  useEffect(() => {
    const onResize = () => redraw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [redraw]);

  const emit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    if (strokesRef.current.length === 0) {
      onChange?.("");
      return;
    }
    onChange?.(canvas.toDataURL("image/png"));
  }, [onChange]);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (drawing.current) return;
    drawing.current = true;
    pointerId.current = e.pointerId;
    canvasRef.current?.setPointerCapture(e.pointerId);
    strokesRef.current = [
      ...strokesRef.current,
      { points: [pointFromEvent(e)], w: size.w || 1, h: size.h || 1 },
    ];
    lastPoint.current = pointFromEvent(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || e.pointerId !== pointerId.current) return;
    e.preventDefault();
    const p = pointFromEvent(e);
    const last = lastPoint.current;
    const stroke = strokesRef.current[strokesRef.current.length - 1];
    if (!stroke || !last) return;
    stroke.points.push(p);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const sx = size.w / stroke.w;
      const sy = size.h / stroke.h;
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(last.x * sx, last.y * sy);
      ctx.lineTo(p.x * sx, p.y * sy);
      ctx.stroke();
    }
    lastPoint.current = p;
  };

  const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || e.pointerId !== pointerId.current) return;
    drawing.current = false;
    pointerId.current = null;
    lastPoint.current = null;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    emit();
  };

  const undo = () => {
    strokesRef.current = strokesRef.current.slice(0, -1);
    redraw();
    emit();
  };

  const clear = () => {
    strokesRef.current = [];
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size.w, size.h);
    }
    redraw();
    emit();
  };

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          🖊️ Escreva sua resposta com a caneta ou o dedo
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={undo}
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ↩ Desfazer
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"
          >
            ✕ Limpar
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="touch-none overflow-hidden rounded-xl border-2 border-dashed border-indigo-300 bg-white dark:border-indigo-700"
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: size.h || 180, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          aria-label="Área para escrever a resposta com a caneta ou o dedo"
        />
      </div>
    </div>
  );
}