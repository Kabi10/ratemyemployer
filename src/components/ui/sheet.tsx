/**
 * Sheet Component - Simplified for MVP
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SheetProps {
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  asChild?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
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
      role="dialog"
      aria-modal="true"
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

const SheetClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button ref={ref} className={cn('absolute right-4 top-4', className)} {...props}>
      {children}
    </button>
  )
);
SheetClose.displayName = 'SheetClose';

const SheetFooter = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props}>
      {children}
    </div>
  )
);
SheetFooter.displayName = 'SheetFooter';

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
SheetDescription.displayName = 'SheetDescription';

const SheetTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button ref={ref} className={className} {...props}>
      {children}
    </button>
  )
);
SheetTrigger.displayName = 'SheetTrigger';

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger };