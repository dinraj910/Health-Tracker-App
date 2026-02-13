import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({
  className,
  type = 'text',
  label,
  placeholder,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled,
  required,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-slate-200">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        
        {/* Input Field */}
        <motion.input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'w-full h-11 px-4 py-2 rounded-2xl bg-slate-800 border border-slate-600 text-white placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon && 'pl-10',
            (rightIcon || isPassword) && 'pr-10',
            error && 'border-red-400 focus:ring-red-500',
            isFocused && !error && 'border-teal-500',
            className
          )}
          {...props}
        />
        
        {/* Right Icon or Password Toggle */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-300 transition-colors duration-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : rightIcon && (
            <div className="text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Focus Ring Animation */}
        {isFocused && !error && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 rounded-2xl border-2 border-teal-500 pointer-events-none"
          />
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-400"
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}
      
      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-sm text-slate-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;