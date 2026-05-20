import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MontanaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const MontanaButton = React.forwardRef<
  HTMLButtonElement,
  MontanaButtonProps
>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary:
        'bg-amber-400 text-gray-900 hover:bg-amber-500 active:bg-amber-600',
      secondary:
        'border-2 border-amber-400 text-amber-400 hover:bg-amber-50 active:bg-amber-100',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600',
      error: 'bg-red-500 text-white hover:bg-red-600',
      icon: 'w-12 h-12 rounded-full bg-amber-400 text-gray-900 hover:bg-amber-500',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          ref={ref}
          className={cn(
            'font-semibold transition-colors duration-200 rounded-full',
            variant !== 'icon' && sizeClasses[size],
            variantClasses[variant],
            disabled && 'opacity-50 cursor-not-allowed',
            isLoading && 'pointer-events-none',
            className
          )}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading ? '...' : children}
        </Button>
      </motion.div>
    );
  }
);

MontanaButton.displayName = 'MontanaButton';
