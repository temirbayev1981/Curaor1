'use client';

import { AlertTriangle } from 'lucide-react';

export function IntegrationNotice({
  title,
  description,
  envVar,
}: {
  title: string;
  description: string;
  envVar: string;
}) {
  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
        <div className="space-y-2 text-sm">
          <p className="font-medium text-amber-200">{title}</p>
          <p className="text-amber-100/80">{description}</p>
          <p className="font-mono text-xs text-amber-200/90">
            Vercel → Settings → Environment Variables → <code>{envVar}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
