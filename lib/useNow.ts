'use client';

import { useEffect, useState } from 'react';

/** Re-renders on an interval so time-based glows and badges can expire. */
export function useNow(intervalMs = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
