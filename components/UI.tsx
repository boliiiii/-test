import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-primary hover:bg-amber-700 text-white shadow-md shadow-amber-900/10",
    secondary: "bg-gray-800 hover:bg-gray-700 text-white",
    outline: "border-2 border-stone-300 hover:border-primary hover:text-primary text-stone-600",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Spinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const dims = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${dims}`} />
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-stone-200 text-stone-700' }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
    {children}
  </span>
);
