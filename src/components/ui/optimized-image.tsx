import Image, { type ImageProps } from 'next/image';

import { cn } from '@/lib/cn';

interface OptimizedImageProps extends Omit<ImageProps, 'loading'> {
  eager?: boolean;
}

export function OptimizedImage({ eager = false, className, ...props }: OptimizedImageProps) {
  return (
    <Image
      {...props}
      loading={eager ? 'eager' : 'lazy'}
      sizes={props.sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
      className={cn('object-cover', className)}
      quality={80}
    />
  );
}
