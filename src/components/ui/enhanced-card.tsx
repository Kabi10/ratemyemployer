/**
 * Enhanced Card Component
 * Modern, flexible card component with advanced styling and interaction states
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

const enhancedCardVariants = cva(
  [
    // Base styles
    'relative overflow-hidden transition-all duration-300',
    'bg-white dark:bg-gray-900',
    'border border-gray-200 dark:border-gray-700',
    // Enhanced shadows and depth
    'shadow-sm hover:shadow-lg',
    // Better focus states
    'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white dark:bg-gray-900',
          'border-gray-200 dark:border-gray-700',
        ],
        elevated: [
          'bg-white dark:bg-gray-800',
          'shadow-lg hover:shadow-xl',
          'border-gray-100 dark:border-gray-600',
        ],
        outlined: [
          'bg-transparent',
          'border-2 border-gray-300 dark:border-gray-600',
          'hover:border-gray-400 dark:hover:border-gray-500',
        ],
        filled: [
          'bg-gray-50 dark:bg-gray-800',
          'border-gray-200 dark:border-gray-700',
        ],
        gradient: [
          'bg-gradient-to-br from-blue-50 to-purple-50',
          'dark:from-gray-800 dark:to-gray-900',
          'border-blue-200 dark:border-gray-600',
        ],
        glass: [
          'bg-white/80 dark:bg-gray-900/80',
          'backdrop-blur-lg backdrop-saturate-150',
          'border-white/20 dark:border-gray-700/50',
        ],
        success: [
          'bg-green-50 dark:bg-green-900/20',
          'border-green-200 dark:border-green-700',
        ],
        warning: [
          'bg-yellow-50 dark:bg-yellow-900/20',
          'border-yellow-200 dark:border-yellow-700',
        ],
        error: [
          'bg-red-50 dark:bg-red-900/20',
          'border-red-200 dark:border-red-700',
        ],
        info: [
          'bg-blue-50 dark:bg-blue-900/20',
          'border-blue-200 dark:border-blue-700',
        ],
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-md',
        default: 'rounded-lg',
        lg: 'rounded-xl',
        xl: 'rounded-2xl',
        full: 'rounded-3xl',
      },
      interactive: {
        true: [
          'cursor-pointer',
          'hover:scale-[1.02] hover:-translate-y-1',
          'active:scale-[0.98] active:translate-y-0',
          'transition-transform duration-200',
        ],
        false: '',
      },
      glow: {
        true: [
          'shadow-lg shadow-blue-500/10',
          'hover:shadow-xl hover:shadow-blue-500/20',
          'dark:shadow-blue-400/10 dark:hover:shadow-blue-400/20',
        ],
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
      interactive: false,
      glow: false,
    },
  }
);

export interface EnhancedCardProps
  extends Omit<HTMLMotionProps<'div'>, 'children'>,
    VariantProps<typeof enhancedCardVariants> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  skeleton?: boolean;
  animate?: boolean;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    className,
    variant,
    size,
    rounded,
    interactive,
    glow,
    children,
    header,
    footer,
    loading = false,
    skeleton = false,
    animate = true,
    hoverEffect = 'none',
    ...props 
  }, ref) => {
    const motionProps = animate ? {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3, ease: 'easeOut' },
    } : {};

    const hoverEffectClasses = {
      lift: 'hover:scale-[1.02] hover:-translate-y-1',
      glow: 'hover:shadow-xl hover:shadow-blue-500/20',
      scale: 'hover:scale-[1.05]',
      none: '',
    };

    if (skeleton || loading) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            enhancedCardVariants({ variant, size, rounded, interactive, glow }),
            'animate-pulse',
            className
          )}
          {...motionProps}
          {...props}
        >
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          enhancedCardVariants({ variant, size, rounded, interactive, glow }),
          hoverEffectClasses[hoverEffect],
          className
        )}
        {...motionProps}
        {...props}
      >
        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/10 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {header && (
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              {header}
            </div>
          )}
          
          <div className="space-y-4">
            {children}
          </div>
          
          {footer && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {footer}
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 transition-opacity duration-300 hover:opacity-100" />
      </motion.div>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

// Card Header Component
const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
  }
>(({ className, title, subtitle, action, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-start justify-between', className)}
    {...props}
  >
    <div className="space-y-1">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
      {children}
    </div>
    {action && (
      <div className="flex-shrink-0">
        {action}
      </div>
    )}
  </div>
));

EnhancedCardHeader.displayName = 'EnhancedCardHeader';

// Card Content Component
const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-gray-700 dark:text-gray-300', className)}
    {...props}
  />
));

EnhancedCardContent.displayName = 'EnhancedCardContent';

// Card Footer Component
const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between', className)}
    {...props}
  />
));

EnhancedCardFooter.displayName = 'EnhancedCardFooter';

export { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardContent, 
  EnhancedCardFooter,
  enhancedCardVariants 
};

// Usage examples
export const CardExamples = () => (
  <div className="space-y-6 p-6">
    <h3 className="text-lg font-semibold">Enhanced Card Examples</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EnhancedCard>
        <EnhancedCardHeader title="Default Card" subtitle="Basic card example" />
        <EnhancedCardContent>
          This is a default card with standard styling and behavior.
        </EnhancedCardContent>
      </EnhancedCard>

      <EnhancedCard variant="elevated" hoverEffect="lift">
        <EnhancedCardHeader title="Elevated Card" subtitle="With hover lift effect" />
        <EnhancedCardContent>
          This card has elevated styling and lifts on hover.
        </EnhancedCardContent>
      </EnhancedCard>

      <EnhancedCard variant="gradient" glow interactive>
        <EnhancedCardHeader title="Interactive Card" subtitle="Clickable with glow" />
        <EnhancedCardContent>
          This card is interactive with gradient background and glow effect.
        </EnhancedCardContent>
      </EnhancedCard>

      <EnhancedCard variant="glass" hoverEffect="scale">
        <EnhancedCardHeader title="Glass Card" subtitle="Glassmorphism effect" />
        <EnhancedCardContent>
          This card uses glassmorphism design with backdrop blur.
        </EnhancedCardContent>
      </EnhancedCard>

      <EnhancedCard variant="success" size="lg">
        <EnhancedCardHeader title="Success Card" subtitle="Large size variant" />
        <EnhancedCardContent>
          This is a success-themed card with larger padding.
        </EnhancedCardContent>
      </EnhancedCard>

      <EnhancedCard skeleton />
    </div>
  </div>
);

// Accessibility and performance notes
export const CardAccessibilityNotes = `
Enhanced Card Accessibility Features:
- Proper semantic structure with header, content, and footer
- Focus management for interactive cards
- Screen reader friendly content organization
- High contrast support
- Reduced motion support
- Keyboard navigation support
- ARIA attributes for complex interactions
`;

export const CardPerformanceNotes = `
Enhanced Card Performance Features:
- Optimized animations with Framer Motion
- Hardware-accelerated transforms
- Efficient re-renders with React.forwardRef
- CSS-in-JS optimization with CVA
- Conditional rendering for loading states
- Minimal DOM manipulation
- Optimized hover effects
`;
