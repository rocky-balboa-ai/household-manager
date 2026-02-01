import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white',
      secondary: 'bg-warm-200 hover:bg-warm-300 text-warm-900',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
      ghost: 'text-gray-600 hover:bg-gray-100',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="mr-2 animate-spin">⏳</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
