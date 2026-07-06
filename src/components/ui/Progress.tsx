import { cn } from '@/lib/utils';

export function Progress({
  value,
  max = 100,
  className,
  showLabel,
}: {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-xs text-zinc-400">
          <span>Payment progress</span>
          <span>{percent}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
