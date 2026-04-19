/**
 * Separator - Horizontal separator component
 * Used to visually separate content sections
 */
import { cn } from '@/lib/utils';

const Separator = ({ className, ...props }) => {
  return (
    <div
      className={cn('h-px w-full bg-border', className)}
      {...props}
    />
  );
};

export { Separator };