/**
 * Card - Set of card components for creating content containers
 * Includes Card, CardHeader, CardTitle, CardDescription, CardContent, and CardFooter
 */
import { cn } from '@/lib/utils';

export const Card = ({ className, ...props }) => (
  <div
    className={cn(
      'rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-dark-tertiary dark:bg-dark-primary dark:text-slate-50',
      className
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3
    className={cn('text-2xl font-semibold leading-none tracking-tight font-display dark:text-slate-50', className)}
    {...props}
  />
);

export const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);