import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 outline-none disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[#EEEFF3] text-[#2A2D3A] shadow-[6px_6px_12px_#D1D4D9,-6px_-6px_12px_#FFFFFF] hover:shadow-[10px_10px_20px_#D1D4D9,-10px_-10px_20px_#FFFFFF] active:shadow-[inset_3px_3px_6px_#D1D4D9,inset_-3px_-3px_6px_#FFFFFF]',
        accent:
          'bg-[#4F46E5] text-white shadow-[6px_6px_12px_#D1D4D9,-6px_-6px_12px_#FFFFFF] hover:bg-[#4338CA] hover:shadow-[10px_10px_20px_#D1D4D9,-10px_-10px_20px_#FFFFFF]',
        ghost:
          'bg-transparent text-[#2A2D3A] hover:bg-[#E3E6EC]/50',
      },
      size: {
        sm: 'px-4 py-2 text-sm rounded-[16px]',
        md: 'px-6 py-3 text-base rounded-[20px]',
        lg: 'px-8 py-4 text-lg rounded-[24px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface NeuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const NeuButton = React.forwardRef<HTMLButtonElement, NeuButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

NeuButton.displayName = 'NeuButton';
