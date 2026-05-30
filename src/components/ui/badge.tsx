import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'bg-primary text-white': variant === 'default',
          'bg-surface-variant text-text-secondary': variant === 'secondary',
          'bg-error text-white': variant === 'destructive',
          'border border-border text-text-primary': variant === 'outline',
          'bg-success/10 text-success': variant === 'success',
          'bg-warning/10 text-warning': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };