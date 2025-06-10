
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EdumallInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onIconClick?: () => void;
}

export const EdumallInput: React.FC<EdumallInputProps> = ({
  label,
  error,
  icon,
  onIconClick,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <motion.input
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none interactive',
            isFocused
              ? 'border-teal-500 shadow-lg shadow-teal-500/20'
              : 'border-gray-200 hover:border-gray-300',
            error && 'border-red-500 animate-shake',
            icon && 'pr-12',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...(props as any)}
        />
        {icon && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors interactive"
            onClick={onIconClick}
          >
            {icon}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
