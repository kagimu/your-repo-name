
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EdumallInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onIconClick?: () => void;
  rightElement?: React.ReactNode;
}

export const EdumallInput: React.FC<EdumallInputProps> = ({
  label,
  error,
  icon,
  onIconClick,
  rightElement,
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
        <input
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
          {...props}
        />
        {(icon || rightElement) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {icon && (
              <button
                type="button"
                className="text-gray-400 hover:text-teal-500 transition-colors interactive"
                onClick={onIconClick}
              >
                {icon}
              </button>
            )}
            {rightElement && (
              <div className="text-gray-400">{rightElement}</div>
            )}
          </div>
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
