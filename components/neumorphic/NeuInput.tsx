import React from 'react';
import { cn } from '@/lib/utils';

export interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label du champ
   */
  label?: string;

  /**
   * Texte d'erreur
   */
  error?: string;
}

export const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-[#2A2D3A]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-[#EEEFF3] text-[#2A2D3A] rounded-[16px]',
            'shadow-[inset_4px_4px_8px_#D1D4D9,inset_-4px_-4px_8px_#FFFFFF]',
            'border-none outline-none',
            'placeholder:text-[#9CA3AF]',
            'transition-shadow duration-200',
            'focus:shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF]',
            error && 'text-red-600',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

NeuInput.displayName = 'NeuInput';
