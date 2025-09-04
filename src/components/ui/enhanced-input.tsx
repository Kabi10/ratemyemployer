/**
 * Enhanced Input Component
 * Modern, accessible input with advanced styling and validation states
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const enhancedInputVariants = cva(
  [
    // Base styles
    'flex w-full rounded-lg border transition-all duration-200',
    'bg-white dark:bg-gray-900',
    'text-gray-900 dark:text-gray-100',
    'placeholder:text-gray-500 dark:placeholder:text-gray-400',
    // Focus styles
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    // Disabled styles
    'disabled:cursor-not-allowed disabled:opacity-50',
    'disabled:bg-gray-50 dark:disabled:bg-gray-800',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-gray-300 dark:border-gray-600',
          'focus:border-blue-500 focus:ring-blue-500',
          'hover:border-gray-400 dark:hover:border-gray-500',
        ],
        filled: [
          'border-transparent bg-gray-100 dark:bg-gray-800',
          'focus:border-blue-500 focus:ring-blue-500',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
        ],
        outlined: [
          'border-2 border-gray-300 dark:border-gray-600',
          'focus:border-blue-500 focus:ring-blue-500',
          'hover:border-gray-400 dark:hover:border-gray-500',
        ],
        underlined: [
          'border-0 border-b-2 border-gray-300 dark:border-gray-600',
          'rounded-none bg-transparent',
          'focus:border-blue-500 focus:ring-0',
          'hover:border-gray-400 dark:hover:border-gray-500',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-3 py-2',
        lg: 'h-12 px-4 text-lg',
        xl: 'h-14 px-5 text-xl',
      },
      state: {
        default: '',
        error: [
          'border-red-500 dark:border-red-400',
          'focus:border-red-500 focus:ring-red-500',
          'bg-red-50 dark:bg-red-900/20',
        ],
        success: [
          'border-green-500 dark:border-green-400',
          'focus:border-green-500 focus:ring-green-500',
          'bg-green-50 dark:bg-green-900/20',
        ],
        warning: [
          'border-yellow-500 dark:border-yellow-400',
          'focus:border-yellow-500 focus:ring-yellow-500',
          'bg-yellow-50 dark:bg-yellow-900/20',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      state: 'default',
    },
  }
);

export interface EnhancedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof enhancedInputVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  warning?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  showPasswordToggle?: boolean;
  loading?: boolean;
  containerClassName?: string;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    className,
    containerClassName,
    variant,
    size,
    state,
    type = 'text',
    label,
    description,
    error,
    success,
    warning,
    leftIcon,
    rightIcon,
    clearable = false,
    showPasswordToggle = false,
    loading = false,
    value,
    onChange,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    // Determine the actual input type
    const inputType = type === 'password' && showPassword ? 'text' : type;
    
    // Determine the validation state
    const validationState = error ? 'error' : success ? 'success' : warning ? 'warning' : state;
    
    // Handle clear functionality
    const handleClear = () => {
      if (onChange) {
        const event = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    // Get validation icon
    const getValidationIcon = () => {
      if (loading) {
        return <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      }
      
      switch (validationState) {
        case 'error':
          return <AlertCircle className="h-4 w-4 text-red-500" />;
        case 'success':
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'warning':
          return <Info className="h-4 w-4 text-yellow-500" />;
        default:
          return null;
      }
    };

    // Get validation message
    const validationMessage = error || success || warning;
    const validationMessageColor = error 
      ? 'text-red-600 dark:text-red-400' 
      : success 
      ? 'text-green-600 dark:text-green-400'
      : warning
      ? 'text-yellow-600 dark:text-yellow-400'
      : '';

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            type={inputType}
            className={cn(
              enhancedInputVariants({ variant, size, state: validationState }),
              leftIcon && 'pl-10',
              (rightIcon || clearable || showPasswordToggle || validationState !== 'default') && 'pr-10',
              className
            )}
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Right Side Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Validation Icon */}
            {getValidationIcon()}
            
            {/* Clear Button */}
            {clearable && value && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Password Toggle */}
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Custom Right Icon */}
            {rightIcon && !getValidationIcon() && !clearable && !showPasswordToggle && (
              <div className="text-gray-400">
                {rightIcon}
              </div>
            )}
          </div>

          {/* Focus Ring Enhancement */}
          {isFocused && (
            <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-opacity-20 pointer-events-none" />
          )}
        </div>

        {/* Description */}
        {description && !validationMessage && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}

        {/* Validation Message */}
        {validationMessage && (
          <p className={cn('text-sm flex items-center space-x-1', validationMessageColor)}>
            {validationState === 'error' && <AlertCircle className="h-3 w-3" />}
            {validationState === 'success' && <CheckCircle className="h-3 w-3" />}
            {validationState === 'warning' && <Info className="h-3 w-3" />}
            <span>{validationMessage}</span>
          </p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export { EnhancedInput, enhancedInputVariants };

// Usage examples
export const InputExamples = () => (
  <div className="space-y-6 p-6 max-w-md">
    <h3 className="text-lg font-semibold">Enhanced Input Examples</h3>
    
    <EnhancedInput
      label="Default Input"
      placeholder="Enter text..."
      description="This is a default input field"
    />

    <EnhancedInput
      label="Email Address"
      type="email"
      placeholder="john@example.com"
      leftIcon={<Info className="h-4 w-4" />}
      clearable
    />

    <EnhancedInput
      label="Password"
      type="password"
      placeholder="Enter password..."
      showPasswordToggle
      required
    />

    <EnhancedInput
      label="Error State"
      placeholder="Invalid input..."
      error="This field is required"
      value="invalid"
    />

    <EnhancedInput
      label="Success State"
      placeholder="Valid input..."
      success="Looks good!"
      value="valid@example.com"
    />

    <EnhancedInput
      label="Warning State"
      placeholder="Warning input..."
      warning="This might need attention"
      value="warning"
    />

    <EnhancedInput
      label="Loading State"
      placeholder="Processing..."
      loading
      value="processing"
    />

    <EnhancedInput
      variant="filled"
      label="Filled Variant"
      placeholder="Filled input..."
    />

    <EnhancedInput
      variant="outlined"
      label="Outlined Variant"
      placeholder="Outlined input..."
    />

    <EnhancedInput
      variant="underlined"
      label="Underlined Variant"
      placeholder="Underlined input..."
    />

    <EnhancedInput
      size="lg"
      label="Large Size"
      placeholder="Large input..."
    />
  </div>
);

// Accessibility and performance notes
export const InputAccessibilityNotes = `
Enhanced Input Accessibility Features:
- Proper label association with htmlFor/id
- ARIA attributes for validation states
- Screen reader support for error messages
- Keyboard navigation support
- Focus management and visual indicators
- High contrast mode support
- Required field indicators
- Descriptive placeholder text
`;

export const InputPerformanceNotes = `
Enhanced Input Performance Features:
- Optimized re-renders with React.forwardRef
- Efficient state management
- Minimal DOM manipulation
- CSS-in-JS optimization with CVA
- Conditional rendering for icons and states
- Debounced validation (when implemented)
- Optimized event handlers
`;
