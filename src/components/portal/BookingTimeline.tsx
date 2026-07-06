'use client';

import { useTranslation } from 'react-i18next';
import type { BookingStatus } from '@/types/database';
import { Check, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS: { key: BookingStatus; labelKey: string }[] = [
  { key: 'pending', labelKey: 'portal.timeline.pending' },
  { key: 'deposit_paid', labelKey: 'portal.timeline.deposit' },
  { key: 'confirmed', labelKey: 'portal.timeline.confirmed' },
  { key: 'completed', labelKey: 'portal.timeline.completed' },
];

const ORDER: BookingStatus[] = ['pending', 'deposit_paid', 'confirmed', 'completed'];

export function BookingTimeline({ status }: { status: BookingStatus }) {
  const { t } = useTranslation();

  if (status === 'cancelled') {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm text-red-400">
        {t('portal.timeline.cancelled')}
      </div>
    );
  }

  const currentIdx = ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const stepIdx = ORDER.indexOf(step.key);
        const isComplete = stepIdx < currentIdx;
        const isCurrent = stepIdx === currentIdx;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                  isComplete && 'border-emerald-500 bg-emerald-500 text-white',
                  isCurrent && 'border-emerald-400 bg-emerald-500/20 text-emerald-400',
                  !isComplete && !isCurrent && 'border-zinc-700 bg-zinc-800/50 text-zinc-600'
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
              <span
                className={cn(
                  'mt-1.5 hidden text-center text-[10px] font-medium sm:block',
                  isCurrent ? 'text-emerald-400' : isComplete ? 'text-zinc-400' : 'text-zinc-600'
                )}
              >
                {t(step.labelKey)}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'mx-1 h-0.5 flex-1',
                  stepIdx < currentIdx ? 'bg-emerald-500' : 'bg-zinc-800'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
