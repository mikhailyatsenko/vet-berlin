import { forwardRef, HTMLAttributes } from 'react';
import { Transition } from '@headlessui/react';
import { clsx } from 'clsx';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
  show?: boolean;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({
    className,
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
    lines = 1,
    show = true,
    style,
    ...props
  }, ref) => {
    const baseClasses = 'bg-gray-200 rounded';
    
    const variants = {
      text: 'h-4',
      rectangular: 'h-4',
      circular: 'rounded-full',
      card: 'h-48'
    };

    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-wave',
      none: ''
    };

    const skeletonStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style
    };

    if (variant === 'text' && lines > 1) {
      return (
        <Transition
          show={show}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div ref={ref} className={clsx('space-y-2', className)} {...props}>
            {Array.from({ length: lines }, (_, i) => (
              <div
                key={i}
                className={clsx(
                  baseClasses,
                  variants[variant],
                  animations[animation],
                  i === lines - 1 && 'w-3/4' // Last line is shorter
                )}
                style={i === 0 ? skeletonStyle : undefined}
              />
            ))}
          </div>
        </Transition>
      );
    }

    return (
      <Transition
        show={show}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          ref={ref}
          className={clsx(
            baseClasses,
            variants[variant],
            animations[animation],
            className
          )}
          style={skeletonStyle}
          {...props}
        />
      </Transition>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Pre-built skeleton components for common use cases
export const SkeletonCard = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Image skeleton */}
      <Skeleton variant="card" className="w-full h-48" />
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Title and Rating */}
        <div className="flex justify-between items-start">
          <Skeleton variant="text" width="70%" height={24} />
          <div className="flex items-center ml-2">
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} variant="circular" width={16} height={16} />
              ))}
            </div>
            <Skeleton variant="text" width={8} height={16} className="ml-1" />
          </div>
        </div>
        
        {/* Category */}
        <Skeleton variant="text" width="40%" height={20} />
        
        {/* Address */}
        <div className="flex items-start">
          <Skeleton variant="circular" width={16} height={16} className="mt-0.5 mr-2 flex-shrink-0" />
          <Skeleton variant="text" lines={2} />
        </div>
        
        {/* Neighborhood */}
        <Skeleton variant="text" width="30%" height={14} />
        
        {/* Opening Hours */}
        <div className="flex items-center">
          <Skeleton variant="circular" width={16} height={16} className="mr-2" />
          <Skeleton variant="text" width="50%" height={14} />
        </div>
        
        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Skeleton variant="circular" width={16} height={16} className="mr-2" />
            <Skeleton variant="text" width="60%" height={14} />
          </div>
          <div className="flex items-center">
            <Skeleton variant="circular" width={16} height={16} className="mr-2" />
            <Skeleton variant="text" width="40%" height={14} />
          </div>
        </div>
        
        {/* Button */}
        <Skeleton variant="rectangular" width="100%" height={40} className="mt-4" />
      </div>
    </div>
  )
);

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonFilters = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'bg-white rounded-lg shadow-sm p-4 mb-6',
        className
      )}
      {...props}
    >
      <div className="flex gap-4 flex-wrap items-center justify-center">
        <Skeleton variant="rectangular" width={200} height={40} />
        <Skeleton variant="rectangular" width={120} height={40} />
        <Skeleton variant="rectangular" width={100} height={40} />
        <Skeleton variant="rectangular" width={100} height={40} />
      </div>
    </div>
  )
);

SkeletonFilters.displayName = 'SkeletonFilters';

export const SkeletonList = forwardRef<HTMLDivElement, { count?: number } & HTMLAttributes<HTMLDivElement>>(
  ({ count = 3, className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('space-y-4', className)}
      {...props}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  )
);

SkeletonList.displayName = 'SkeletonList';

export default Skeleton;
