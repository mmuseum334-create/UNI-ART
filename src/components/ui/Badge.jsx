/**
 * Badge - Versatile badge component with multiple style variants
 * Used for tags, labels, and status indicators throughout the application
 */
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80',
        secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-dark-tertiary dark:text-slate-50 dark:hover:bg-dark-tertiary/80',
        destructive: 'border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-600 dark:hover:bg-red-600/80',
        outline: 'text-slate-950 dark:text-slate-50',
        success: 'border-transparent bg-nature-500 text-white hover:bg-nature-600 dark:bg-nature-600 dark:hover:bg-nature-700',
        info: 'border-transparent bg-museum-500 text-white hover:bg-museum-600 dark:bg-museum-600 dark:hover:bg-museum-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const Badge = ({ className, variant, ...props }) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
};