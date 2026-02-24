/**
 * Prefetch critical API routes for faster navigation
 */
export function prefetchCriticalData(): void {
  if (typeof window === 'undefined') return;

  const criticalRoutes: string[] = [
    '/api/devices/brands',
    '/api/tips?type=daily',
  ];

  // Use requestIdleCallback for non-blocking prefetch
  const prefetch = (): void => {
    criticalRoutes.forEach((route) => {
      fetch(route, { priority: 'low' as RequestPriority }).catch(() => {
        // Prefetch failure is non-critical
      });
    });
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(prefetch);
  } else {
    setTimeout(prefetch, 2000);
  }
}
