/**
 * Sheet Component - Simplified for MVP
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SheetProps {
  children: React.ReactNode;
  className?: string;
}

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
);
Sheet.displayName = 'Sheet';

const SheetContent = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'fixed right-0 top-0 z-50 h-full w-3/4 border-l bg-background p-6 shadow-lg transition ease-in-out sm:max-w-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
SheetContent.displayName = 'SheetContent';

const SheetHeader = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
      {...props}
    >
      {children}
    </div>
  )
);
SheetHeader.displayName = 'SheetHeader';

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  )
);
SheetTitle.displayName = 'SheetTitle';

export { Sheet, SheetContent, SheetHeader, SheetTitle };