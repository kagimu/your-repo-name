
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EdumallButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const EdumallButton: React.FC<EdumallButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  isLoading,
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 interactive animate-button-press';
  
  const variants = {
    primary: 'bg-gradient-to-r from-teal-500 to-cyan-400 text-white hover:from-teal-600 hover:to-cyan-500 hover:shadow-lg focus:ring-teal-500 disabled:opacity-50',
    secondary: 'border-2 border-amber-400 text-amber-600 hover:bg-amber-400 hover:text-white focus:ring-amber-400 disabled:opacity-50',
    ghost: 'text-gray-600 hover:text-teal-600 hover:bg-gray-100 focus:ring-gray-300 disabled:opacity-50'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-6 py-2.5 text-base rounded-xl',
    lg: 'px-8 py-3.5 text-lg rounded-2xl'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
      {variant === 'primary' && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-300 opacity-0 hover:opacity-20 transition-opacity duration-300" />
      )}
    </motion.button>
  );
};
