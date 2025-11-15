import React from 'react';
import { cn } from '@/lib/utils';

export interface NeuSectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Titre principal de la section
   */
  title?: string;

  /**
   * Eyebrow (petit texte au-dessus du titre)
   */
  eyebrow?: string;

  /**
   * Description de la section
   */
  description?: string;

  /**
   * Centrer le contenu
   */
  centered?: boolean;

  /**
   * Largeur max du conteneur
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidths = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
};

export const NeuSection = React.forwardRef<HTMLElement, NeuSectionProps>(
  ({
    title,
    eyebrow,
    description,
    centered = true,
    maxWidth = 'xl',
    className,
    children,
    ...props
  }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          'py-16 md:py-24 lg:py-32',
          className
        )}
        {...props}
      >
        <div className={cn(
          'mx-auto px-6 md:px-8',
          maxWidths[maxWidth]
        )}>
          {/* Header de la section */}
          {(eyebrow || title || description) && (
            <div className={cn(
              'mb-12 md:mb-16',
              centered && 'text-center'
            )}>
              {eyebrow && (
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-[#4F46E5]">
                  {eyebrow}
                </p>
              )}

              {title && (
                <h2 className="mb-4 text-3xl font-bold text-[#2A2D3A] md:text-4xl lg:text-5xl">
                  {title}
                </h2>
              )}

              {description && (
                <p className={cn(
                  'text-base leading-relaxed text-[#6B7280] md:text-lg',
                  centered && 'mx-auto max-w-3xl'
                )}>
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Contenu de la section */}
          {children}
        </div>
      </section>
    );
  }
);

NeuSection.displayName = 'NeuSection';
