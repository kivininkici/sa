import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CyberButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function CyberButton({ 
  children, 
  className, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false 
}: CyberButtonProps) {
  const baseClasses = `
    relative overflow-hidden font-semibold transition-all duration-300 
    transform hover:scale-105 active:scale-95 border-2 
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    before:absolute before:inset-0 before:bg-gradient-to-r 
    before:opacity-0 before:transition-opacity before:duration-300
    hover:before:opacity-100 hover:shadow-2xl
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500
      hover:from-blue-500 hover:to-purple-500 hover:border-blue-400
      before:from-blue-400 before:to-purple-400 focus:ring-blue-500
      shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
    `,
    secondary: `
      bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-500
      hover:from-gray-500 hover:to-gray-600 hover:border-gray-400
      before:from-gray-400 before:to-gray-500 focus:ring-gray-500
      shadow-lg shadow-gray-500/25 hover:shadow-gray-500/40
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-pink-600 text-white border-red-500
      hover:from-red-500 hover:to-pink-500 hover:border-red-400
      before:from-red-400 before:to-pink-400 focus:ring-red-500
      shadow-lg shadow-red-500/25 hover:shadow-red-500/40
    `,
    success: `
      bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-500
      hover:from-green-500 hover:to-emerald-500 hover:border-green-400
      before:from-green-400 before:to-emerald-400 focus:ring-green-500
      shadow-lg shadow-green-500/25 hover:shadow-green-500/40
    `
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed transform-none' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        className
      )}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}