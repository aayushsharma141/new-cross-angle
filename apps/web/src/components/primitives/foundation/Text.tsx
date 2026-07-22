// Genome ID: P007 Text
import React from 'react';
import { cn } from '../../../lib/utils';

export type TextProps<T extends React.ElementType = 'span'> = {
  as?: T;
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'default' | 'muted' | 'accent' | 'inverse' | 'inherit';
  truncate?: boolean;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as'>;

type TextComponent = (<T extends React.ElementType = 'span'>(
  props: TextProps<T> & { ref?: React.ComponentPropsWithRef<T>['ref'] }
) => React.ReactNode) & { displayName?: string };

export const Text = React.forwardRef(
  <T extends React.ElementType = 'span'>(
    { className, as, variant = 'body' as const, weight, align, color = 'default', truncate, ...props }: TextProps<T>,
    ref: React.ComponentPropsWithRef<T>['ref']
  ) => {
    
    // Default element mapping based on variant
    const defaultElements: Record<string, React.ElementType> = {
      display: 'h1',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      body: 'p',
      caption: 'span',
      label: 'label',
    };

    const Component = as || defaultElements[variant];

    const variantClasses = {
      display: 'font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight',
      h1: 'font-serif text-3xl sm:text-4xl tracking-tight',
      h2: 'font-serif text-2xl sm:text-3xl tracking-tight',
      h3: 'font-sans text-xl sm:text-2xl font-semibold tracking-tight',
      h4: 'font-sans text-lg sm:text-xl font-semibold tracking-tight',
      body: 'font-sans text-base leading-relaxed',
      caption: 'font-sans text-sm leading-relaxed',
      label: 'font-sans text-xs font-medium uppercase tracking-widest',
    };

    const weightClasses = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    const colorClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      accent: 'text-primary',
      inverse: 'text-background',
      inherit: 'text-inherit',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          variantClasses[variant],
          weight && weightClasses[weight],
          align && alignClasses[align],
          colorClasses[color],
          truncate && 'truncate',
          className
        )}
        {...props}
      />
    );
  }
) as TextComponent;
Text.displayName = 'Text';
