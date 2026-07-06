'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b09] px-4">
      <div className="text-center">
        <h1 className="mb-3 text-2xl font-bold text-white">Something went wrong</h1>
        <p className="mb-8 text-zinc-400">An unexpected error occurred. Please try again.</p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset}>Try Again</Button>
          <Link href="/en">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
