import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-[var(--brand-accent,#D4AF63)] text-[var(--brand-bg,#0F0E0A)] hover:brightness-110 focus:ring-[var(--brand-accent,#D4AF63)]',
      secondary: 'bg-[var(--brand-secondary,#6B1E2E)] text-white hover:brightness-110 focus:ring-[var(--brand-secondary,#6B1E2E)]',
      outline: 'border-2 border-[var(--brand-accent,#D4AF63)] text-[var(--brand-accent,#D4AF63)] hover:bg-[var(--brand-accent,#D4AF63)] hover:text-[var(--brand-bg,#0F0E0A)]',
      ghost: 'text-[var(--brand-muted,#A89F91)] hover:text-[var(--brand-text,#F2EEE7)] hover:bg-white/5',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-3.5 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
export type { ButtonProps };
