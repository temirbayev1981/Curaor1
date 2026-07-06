'use client';

import { useEffect, useState } from 'react';

/** True after client hydration — use to avoid SSR invisible motion states. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
