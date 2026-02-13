import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/20',
        secondary: 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700',
        ghost: 'hover:bg-slate-800 text-slate-300 hover:text-white',
        outline: 'border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white',
        gradient: 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-900 hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-500/20',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
        violet: 'bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/20'
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        default: 'h-11 px-6 py-2',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12'
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
        fit: 'w-fit'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      width: 'auto'
    }
  }
);

const Button = ({ 
  className, 
  variant, 
  size, 
  width,
  children, 
  disabled,
  loading,
  leftIcon,
  rightIcon,
  ...props 
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(buttonVariants({ variant, size, width, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      <span className={cn(
        "transition-all duration-200",
        loading && "opacity-70"
      )}>
        {children}
      </span>
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;