/**
 * VoyageVerse Input Component
 * Implements the design system input variants
 */

import React from 'react';
import { cn } from '../../utils/cn';

const inputVariants = {
  default: 'border-border focus:border-primary focus:ring-primary/50',
  withLabel: 'border-border focus:border-primary focus:ring-primary/50'
};

export const Input = React.forwardRef(({
  className,
  variant = 'default',
  label,
  error,
  helperText,
  required = false,
  ...props
}, ref) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        className={cn(
          // Base styles
          'w-full px-3 py-2 rounded-md border bg-surface text-text-primary',
          'placeholder:text-text-secondary',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-200',
          // Variant styles
          inputVariants[variant],
          // Error state
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-text-secondary">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  required = false,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-text-primary mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          // Base styles
          'w-full px-3 py-2 rounded-md border bg-surface text-text-primary',
          'placeholder:text-text-secondary resize-vertical',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-200',
          // Default variant
          'border-border focus:border-primary focus:ring-primary/50',
          // Error state
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-text-secondary">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
