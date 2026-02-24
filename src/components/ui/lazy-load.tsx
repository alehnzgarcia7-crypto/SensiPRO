'use client';

import { Suspense, lazy, type ComponentType } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadProps {
  loader: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
  fallback?: React.ReactNode;
  props?: Record<string, unknown>;
}

export function LazyLoad({ loader, fallback, props = {} }: LazyLoadProps) {
  const Component = lazy(loader);

  return (
    <Suspense fallback={fallback ?? <Skeleton variant="card" className="h-40" />}>
      <Component {...props} />
    </Suspense>
  );
}
