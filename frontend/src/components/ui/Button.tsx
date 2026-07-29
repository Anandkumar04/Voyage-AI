import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-[14px] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] select-none cursor-pointer";
  
  const variants = {
    primary: "bg-[#3b82f6] dark:bg-blue-600 hover:bg-[#1d4ed8] dark:hover:bg-blue-700 text-white shadow-sm hover:shadow-md",
    secondary: "bg-[#FAF9F6] dark:bg-zinc-800 hover:bg-[#E5E2D9] dark:hover:bg-zinc-700 text-[#2D2D2D] dark:text-zinc-100 border border-[#E5E2D9] dark:border-zinc-700",
    outline: "border border-[#3b82f6] text-[#3b82f6] dark:text-blue-400 hover:bg-[#3b82f6]/10 dark:hover:bg-blue-500/10",
    ghost: "text-[#7D7A74] dark:text-zinc-400 hover:text-[#2D2D2D] dark:hover:text-zinc-100 hover:bg-[#E5E2D9]/50 dark:hover:bg-zinc-800/50",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5"
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
