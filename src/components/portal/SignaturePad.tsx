'use client';

import { useRef, useState, useCallback } from 'react';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  onSign: (dataUrl: string) => void;
  onCancel: () => void;
  signerName: string;
  onSignerNameChange: (name: string) => void;
}

export function SignaturePad({
  onSign,
  onCancel,
  signerName,
  onSignerNameChange,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getCoords = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ('touches' in e) {
        const touch = e.touches[0];
        if (!touch) return { x: 0, y: 0 };
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#10b981';
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endDraw() {
    setIsDrawing(false);
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function handleSign() {
    const canvas = canvasRef.current;
    if (!canvas || !signerName.trim()) return;
    onSign(canvas.toDataURL('image/png'));
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Digital Signature</h3>
      <input
        type="text"
        placeholder="Full legal name"
        value={signerName}
        onChange={(e) => onSignerNameChange(e.target.value)}
        className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
      />
      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        className="w-full cursor-crosshair rounded-lg border border-white/20 bg-white"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <div className="mt-4 flex gap-2">
        <button
          onClick={clear}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
        >
          <Eraser className="h-4 w-4" />
          Clear
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          onClick={handleSign}
          disabled={!signerName.trim()}
          className="ml-auto flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          Sign Contract
        </button>
      </div>
    </div>
  );
}
