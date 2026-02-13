import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium text-xs transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-slate-700 text-slate-200 border border-slate-600',
        success: 'bg-green-500/20 text-green-400 border border-green-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
        info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        primary: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
        violet: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
        solid: 'bg-teal-500 text-white border border-teal-500',
        gradient: 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-900 border-none',
        outline: 'bg-transparent text-slate-300 border border-slate-500',
        ghost: 'bg-slate-800/50 text-slate-300 border-none'
      },
      size: {
        sm: 'px-2 py-1 text-xs min-h-5',
        default: 'px-2.5 py-1.5 text-xs min-h-6',
        lg: 'px-3 py-2 text-sm min-h-7',
        xl: 'px-4 py-2 text-sm min-h-8'
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        ping: 'animate-ping'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none'
    }
  }
);

const Badge = ({
  children,
  className,
  variant,
  size,
  animation,
  icon,
  dot,
  removable,
  onRemove,
  ...props
}) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(badgeVariants({ variant, size, animation }), className)}
      {...props}
    >
      {/* Status Dot */}
      {dot && (
        <span 
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            variant === 'success' && 'bg-green-400',
            variant === 'warning' && 'bg-amber-400',
            variant === 'danger' && 'bg-red-400',
            variant === 'info' && 'bg-blue-400',
            variant === 'primary' && 'bg-teal-400',
            variant === 'violet' && 'bg-violet-400',
            !variant?.includes('success', 'warning', 'danger', 'info', 'primary', 'violet') && 'bg-slate-400'
          )}
        />
      )}

      {/* Icon */}
      {icon && !dot && (
        <span className="mr-1">
          {icon}
        </span>
      )}

      {/* Content */}
      <span className="whitespace-nowrap">
        {children}
      </span>

      {/* Remove Button */}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 hover:bg-white/10 rounded-full p-0.5 transition-colors duration-200"
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.span>
  );
};

// Predefined status badges for common use cases
Badge.Success = (props) => <Badge variant="success" {...props} />;
Badge.Warning = (props) => <Badge variant="warning" {...props} />;
Badge.Danger = (props) => <Badge variant="danger" {...props} />;
Badge.Info = (props) => <Badge variant="info" {...props} />;
Badge.Primary = (props) => <Badge variant="primary" {...props} />;
Badge.Violet = (props) => <Badge variant="violet" {...props} />;

export default Badge;