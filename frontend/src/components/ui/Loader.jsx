import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const loaderVariants = cva(
  'inline-block',
  {
    variants: {
      variant: {
        spinner: 'border-2 border-current border-t-transparent rounded-full',
        dots: 'flex space-x-1',
        pulse: 'rounded-full',
        bars: 'flex space-x-1 items-end',
        ring: 'border-2 border-slate-600 rounded-full',
        gradient: 'border-2 border-transparent rounded-full bg-gradient-to-r from-teal-400 to-cyan-400'
      },
      size: {
        sm: 'w-4 h-4',
        default: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
      },
      color: {
        default: 'text-slate-400',
        primary: 'text-teal-500',
        white: 'text-white',
        current: 'text-current'
      }
    },
    defaultVariants: {
      variant: 'spinner',
      size: 'default',
      color: 'default'
    }
  }
);

const Loader = ({
  variant = 'spinner',
  size = 'default',
  color = 'default',
  className,
  text,
  fullScreen = false,
  ...props
}) => {
  const sizeMap = {
    sm: { width: 16, height: 16, dotSize: 3, barHeight: [8, 12, 16, 12, 8] },
    default: { width: 24, height: 24, dotSize: 4, barHeight: [12, 18, 24, 18, 12] },
    lg: { width: 32, height: 32, dotSize: 5, barHeight: [16, 24, 32, 24, 16] },
    xl: { width: 48, height: 48, dotSize: 6, barHeight: [24, 36, 48, 36, 24] }
  };

  const { width, height, dotSize, barHeight } = sizeMap[size];

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <motion.div
            className={cn(loaderVariants({ variant, size, color }), className)}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width, height }}
            {...props}
          />
        );

      case 'dots':
        return (
          <div className={cn('flex space-x-1', className)} {...props}>
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className={cn('rounded-full bg-current', `w-${dotSize} h-${dotSize}`)}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                style={{ 
                  width: dotSize * 4, 
                  height: dotSize * 4,
                  backgroundColor: color === 'primary' ? '#14b8a6' : color === 'white' ? '#ffffff' : '#94a3b8'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={cn(loaderVariants({ variant, size, color }), 'bg-current', className)}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ width, height }}
            {...props}
          />
        );

      case 'bars':
        return (
          <div className={cn('flex space-x-1 items-end', className)} {...props}>
            {barHeight.map((height, index) => (
              <motion.div
                key={index}
                className="w-1 bg-current rounded-full"
                animate={{
                  height: [height * 0.5, height, height * 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.1
                }}
                style={{
                  backgroundColor: color === 'primary' ? '#14b8a6' : color === 'white' ? '#ffffff' : '#94a3b8'
                }}
              />
            ))}
          </div>
        );

      case 'ring':
        return (
          <div className={cn('relative', className)} style={{ width, height }} {...props}>
            <motion.div
              className="absolute inset-0 border-2 rounded-full"
              style={{
                borderColor: color === 'primary' ? '#14b8a6' : color === 'white' ? '#ffffff' : '#94a3b8',
                borderTopColor: 'transparent'
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        );

      case 'gradient':
        return (
          <motion.div
            className={cn('border-2 border-transparent rounded-full bg-gradient-to-r from-teal-400 to-cyan-400', className)}
            style={{ width, height }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            {...props}
          >
            <div 
              className="w-full h-full rounded-full bg-slate-900"
              style={{ 
                width: width - 4, 
                height: height - 4,
                margin: 2
              }}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderLoader()}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'text-sm font-medium',
            color === 'primary' ? 'text-teal-500' : 
            color === 'white' ? 'text-white' : 'text-slate-400'
          )}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;