import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface NeuIconCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icône à afficher (composant Lucide)
   */
  icon: LucideIcon;

  /**
   * Titre de la card
   */
  title: string;

  /**
   * Description de la card
   */
  description: string;

  /**
   * Taille de l'icône
   * - sm: 40px
   * - md: 48px (par défaut)
   * - lg: 56px
   */
  iconSize?: 'sm' | 'md' | 'lg';
}

const iconSizes = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

const iconContainerSizes = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

export const NeuIconCard = React.forwardRef<HTMLDivElement, NeuIconCardProps>(
  ({
    icon: Icon,
    title,
    description,
    iconSize = 'md',
    className,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-[#EEEFF3] p-6 rounded-[20px]',
          'shadow-[6px_6px_12px_#D1D4D9,-6px_-6px_12px_#FFFFFF]',
          'transition-shadow duration-200',
          'hover:shadow-[10px_10px_20px_#D1D4D9,-10px_-10px_20px_#FFFFFF]',
          className
        )}
        {...props}
      >
        {/* Conteneur d'icône neumorphique */}
        <div
          className={cn(
            'mb-4 flex items-center justify-center rounded-full bg-[#EEEFF3]',
            'shadow-[6px_6px_12px_#D1D4D9,-6px_-6px_12px_#FFFFFF]',
            iconContainerSizes[iconSize]
          )}
        >
          <Icon
            className={cn('text-[#4F46E5]', iconSizes[iconSize])}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        {/* Contenu */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[#2A2D3A]">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-[#6B7280]">
            {description}
          </p>
        </div>
      </div>
    );
  }
);

NeuIconCard.displayName = 'NeuIconCard';
