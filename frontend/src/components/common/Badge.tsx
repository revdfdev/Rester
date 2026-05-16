import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'indigo' | 'slate';
  size?: 'xs' | 'sm';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
}) => {
  const variants = {
    brand: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    success: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
    warning: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
    error: 'bg-accent-rose/10 text-accent-rose border-accent-rose/20',
    indigo: 'bg-accent-indigo/10 text-accent-indigo border-accent-indigo/20',
    slate: 'bg-dark-800 text-slate-400 border-dark-700',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[9px]',
    sm: 'px-2 py-1 text-[10px]',
  };

  return (
    <span className={`inline-flex items-center font-black uppercase tracking-widest border rounded-md ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
