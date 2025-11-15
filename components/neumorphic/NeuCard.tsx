import React from 'react';
import { cn } from '@/lib/utils';

export interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variante de l'ombre
   * - soft: ombre légère (par défaut)
   * - medium: ombre moyenne
   * - strong: ombre prononcée
   * - inset: ombre interne (effet pressé)
   */
  shadowVariant?: 'soft' | 'medium' | 'strong' | 'inset';

  /**
   * Taille du border-radius
   * - sm: 16px
   * - md: 20px (par défaut)
   * - lg: 24px
   * - xl: 32px
   */
  radiusSize?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Activer l'effet hover
   */
  hoverEffect?: boolean;
}

const shadowVariants = {
  soft: 'shadow-[6px_6px_12px_#D1D4D9,-6px_-6px_12px_#FFFFFF]',
  medium: 'shadow-[8px_8px_16px_#D1D4D9,-8px_-8px_16px_#FFFFFF]',
  strong: 'shadow-[12px_12px_24px_#D1D4D9,-12px_-12px_24px_#FFFFFF]',
  inset: 'shadow-[inset_4px_4px_8px_#D1D4D9,inset_-4px_-4px_8px_#FFFFFF]',
};

const radiusSizes = {
  sm: 'rounded-[16px]',
  md: 'rounded-[20px]',
  lg: 'rounded-[24px]',
  xl: 'rounded-[32px]',
};

export const NeuCard = React.forwardRef<HTMLDivElement, NeuCardProps>(
  ({
    className,
    shadowVariant = 'soft',
    radiusSize = 'md',
    hoverEffect = false,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-[#EEEFF3]',
          shadowVariants[shadowVariant],
          radiusSizes[radiusSize],
          hoverEffect && 'transition-shadow duration-200 hover:shadow-[10px_10px_20px_#D1D4D9,-10px_-10px_20px_#FFFFFF]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeuCard.displayName = 'NeuCard';
