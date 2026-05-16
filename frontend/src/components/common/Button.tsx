import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-brand-primary text-dark-950 hover:bg-brand-300 shadow-lg shadow-brand-primary/20',
    secondary: 'bg-dark-800 text-slate-200 hover:bg-dark-700 border border-dark-700',
    outline: 'bg-transparent border-2 border-dark-700 text-slate-400 hover:border-brand-primary hover:text-brand-primary',
    ghost: 'bg-transparent text-slate-500 hover:bg-dark-800 hover:text-slate-200',
    danger: 'bg-accent-rose/10 text-accent-rose hover:bg-accent-rose hover:text-white border border-accent-rose/20',
  };

  const sizes = {
    xs: 'px-2 py-1 text-[10px] gap-1.5',
    sm: 'px-3 py-1.5 text-xs gap-2',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-3',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};
