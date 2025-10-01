/**
 * Button - Primary button component with multiple variants and sizes
 * Supports different visual styles and customizable appearance
 */
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-nature-600 to-museum-600 text-white hover:from-nature-700 hover:to-museum-700 dark:from-nature-500 dark:to-museum-500 dark:hover:from-nature-600 dark:hover:to-museum-600 shadow-md hover:shadow-lg',
        destructive: 'bg-red-500 text-red-50 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
        outline: 'border border-nature-200 bg-transparent hover:bg-nature-50 hover:text-nature-700 dark:border-nature-700 dark:hover:bg-dark-tertiary dark:hover:text-nature-300 dark:text-nature-300',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-dark-tertiary dark:text-slate-100 dark:hover:bg-slate-700',
        ghost: 'hover:bg-nature-50 hover:text-nature-700 dark:hover:bg-dark-tertiary dark:hover:text-nature-300 dark:text-slate-300',
        link: 'text-nature-600 underline-offset-4 hover:underline dark:text-nature-400',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const Button = ({ className, variant, size, ...props }) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};