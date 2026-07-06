'use client';

import { useRef, useState, useCallback } from 'react';
import { Eraser, Check, Pen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

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
  const { t } = useTranslation();
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
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Pen className="h-5 w-5 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          {t('portal.signature.title')}
        </h3>
      </div>
      <input
        type="text"
        placeholder={t('portal.signature.namePlaceholder')}
        value={signerName}
        onChange={(e) => onSignerNameChange(e.target.value)}
        className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
      />
      <div className="overflow-hidden rounded-xl border border-white/10">
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          className="w-full cursor-crosshair bg-white"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={clear}>
          <Eraser className="h-4 w-4" />
          {t('portal.signature.clear')}
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          {t('portal.signature.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSign}
          disabled={!signerName.trim()}
          className="ml-auto"
        >
          <Check className="h-4 w-4" />
          {t('portal.signature.submit')}
        </Button>
      </div>
    </div>
  );
}
