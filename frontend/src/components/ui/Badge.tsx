import React, { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'emerald' | 'violet' | 'amber' | 'neutral';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  icon,
  className = '',
  ...props
}) => {
  const variants = {
    blue: "bg-[#3b82f6]/10 text-[#3b82f6] dark:text-blue-400 border-[#3b82f6]/20",
    emerald: "bg-[#10b981]/10 text-[#10b981] dark:text-emerald-400 border-[#10b981]/20",
    violet: "bg-[#8b5cf6]/10 text-[#8b5cf6] dark:text-violet-400 border-[#8b5cf6]/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    neutral: "bg-[#FAF9F6] dark:bg-zinc-950 text-[#2D2D2D] dark:text-zinc-300 border-[#E5E2D9] dark:border-zinc-800"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};

export default Badge;
