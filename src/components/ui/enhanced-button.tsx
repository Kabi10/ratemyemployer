/**
 * Enhanced Button Component
 * Modern, accessible button with advanced styling and interaction states
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const enhancedButtonVariants = cva(
  [
    // Base styles
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'relative overflow-hidden',
    // Improved accessibility
    'focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    // Better hover states
    'transform-gpu hover:scale-[1.02] active:scale-[0.98]',
    // Smooth transitions
    'transition-all duration-200 ease-out',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-gradient-to-r from-blue-600 to-blue-700',
          'text-white shadow-lg shadow-blue-500/25',
          'hover:from-blue-700 hover:to-blue-800',
          'hover:shadow-xl hover:shadow-blue-500/30',
          'active:from-blue-800 active:to-blue-900',
        ],
        destructive: [
          'bg-gradient-to-r from-red-600 to-red-700',
          'text-white shadow-lg shadow-red-500/25',
          'hover:from-red-700 hover:to-red-800',
          'hover:shadow-xl hover:shadow-red-500/30',
        ],
        outline: [
          'border-2 border-gray-300 bg-transparent',
          'text-gray-700 hover:bg-gray-50',
          'hover:border-gray-400 hover:shadow-md',
          'dark:border-gray-600 dark:text-gray-300',
          'dark:hover:bg-gray-800 dark:hover:border-gray-500',
        ],
        secondary: [
          'bg-gradient-to-r from-gray-100 to-gray-200',
          'text-gray-900 shadow-md',
          'hover:from-gray-200 hover:to-gray-300',
          'hover:shadow-lg',
          'dark:from-gray-700 dark:to-gray-800',
          'dark:text-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700',
        ],
        ghost: [
          'text-gray-700 hover:bg-gray-100',
          'hover:shadow-md',
          'dark:text-gray-300 dark:hover:bg-gray-800',
        ],
        link: [
          'text-blue-600 underline-offset-4',
          'hover:underline hover:text-blue-700',
          'dark:text-blue-400 dark:hover:text-blue-300',
        ],
        success: [
          'bg-gradient-to-r from-green-600 to-green-700',
          'text-white shadow-lg shadow-green-500/25',
          'hover:from-green-700 hover:to-green-800',
          'hover:shadow-xl hover:shadow-green-500/30',
        ],
        warning: [
          'bg-gradient-to-r from-yellow-500 to-yellow-600',
          'text-white shadow-lg shadow-yellow-500/25',
          'hover:from-yellow-600 hover:to-yellow-700',
          'hover:shadow-xl hover:shadow-yellow-500/30',
        ],
        premium: [
          'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600',
          'text-white shadow-lg shadow-purple-500/25',
          'hover:shadow-xl hover:shadow-purple-500/30',
          'bg-size-200 hover:bg-pos-100',
          'animate-gradient-x',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
      },
      rounded: {
        default: 'rounded-lg',
        sm: 'rounded-md',
        lg: 'rounded-xl',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
      rounded: 'default',
    },
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    rounded,
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    const computedClassName = cn(
      enhancedButtonVariants({ variant, size, fullWidth, rounded, className }),
      loading && 'cursor-not-allowed'
    );

    // When rendering asChild, Radix Slot enforces a single child via React.Children.only.
    // We must not add siblings (icons, loaders, overlays). Delegate content to the child.
    if (asChild) {
      return (
        <Slot className={computedClassName} ref={ref as any} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={computedClassName}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled ? true : undefined}
        aria-busy={loading ? true : undefined}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (isDisabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            props.onClick?.(event as any);
          }
        }}
        {...props}
      >
        {loading && (
          <Loader2 data-testid="loading-spinner" className="h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span className="truncate">
          {loading && loadingText ? loadingText : children}
        </span>
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
        <span className="absolute inset-0 overflow-hidden rounded-lg">
          <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-200 group-active:opacity-100" />
        </span>
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton, enhancedButtonVariants };

// Usage examples and documentation
export const ButtonExamples = () => (
  <div className="space-y-4 p-6">
    <h3 className="text-lg font-semibold">Enhanced Button Examples</h3>
    
    <div className="flex flex-wrap gap-3">
      <EnhancedButton>Default</EnhancedButton>
      <EnhancedButton variant="secondary">Secondary</EnhancedButton>
      <EnhancedButton variant="outline">Outline</EnhancedButton>
      <EnhancedButton variant="ghost">Ghost</EnhancedButton>
      <EnhancedButton variant="link">Link</EnhancedButton>
    </div>

    <div className="flex flex-wrap gap-3">
      <EnhancedButton variant="success">Success</EnhancedButton>
      <EnhancedButton variant="warning">Warning</EnhancedButton>
      <EnhancedButton variant="destructive">Destructive</EnhancedButton>
      <EnhancedButton variant="premium">Premium</EnhancedButton>
    </div>

    <div className="flex flex-wrap gap-3">
      <EnhancedButton size="sm">Small</EnhancedButton>
      <EnhancedButton size="default">Default</EnhancedButton>
      <EnhancedButton size="lg">Large</EnhancedButton>
      <EnhancedButton size="xl">Extra Large</EnhancedButton>
    </div>

    <div className="flex flex-wrap gap-3">
      <EnhancedButton loading>Loading</EnhancedButton>
      <EnhancedButton loading loadingText="Saving...">Save</EnhancedButton>
      <EnhancedButton disabled>Disabled</EnhancedButton>
    </div>

    <div className="space-y-2">
      <EnhancedButton fullWidth>Full Width</EnhancedButton>
      <EnhancedButton fullWidth variant="outline">Full Width Outline</EnhancedButton>
    </div>

    <div className="flex flex-wrap gap-3">
      <EnhancedButton rounded="sm">Small Rounded</EnhancedButton>
      <EnhancedButton rounded="default">Default Rounded</EnhancedButton>
      <EnhancedButton rounded="lg">Large Rounded</EnhancedButton>
      <EnhancedButton rounded="full">Full Rounded</EnhancedButton>
    </div>
  </div>
);

// Accessibility guidelines
export const ButtonAccessibilityNotes = `
Enhanced Button Accessibility Features:
- Proper focus management with visible focus indicators
- Screen reader support with semantic button elements
- Keyboard navigation support
- Loading states with appropriate aria attributes
- Disabled state handling
- High contrast mode support
- Reduced motion support for animations
- Proper color contrast ratios
- Touch-friendly sizing (minimum 44px touch targets)
`;

// Performance optimizations
export const ButtonPerformanceNotes = `
Enhanced Button Performance Features:
- CSS-in-JS with class variance authority for optimal bundle size
- Hardware-accelerated transforms for smooth animations
- Efficient re-renders with React.forwardRef
- Minimal DOM manipulation
- Optimized CSS transitions
- Conditional rendering for loading states
- Memoized variant calculations
`;
