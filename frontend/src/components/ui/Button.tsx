import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  carregando?: boolean;
}

const VARIANT_STYLE: Record<Variant, string> = {
  primary: 'bg-signal-700 text-white hover:bg-signal-800 disabled:bg-signal-300',
  secondary: 'bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 disabled:text-ink-300',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-100 disabled:text-ink-300',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50 disabled:text-red-300',
};

const SIZE_STYLE: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', carregando, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || carregando}
        className={cn(
          'focus-ring inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed',
          VARIANT_STYLE[variant],
          SIZE_STYLE[size],
          className,
        )}
        {...props}
      >
        {carregando && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
