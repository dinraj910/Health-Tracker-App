import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'rounded-3xl p-4 md:p-6 transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-slate-800 border border-slate-700',
        gradient: 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700',
        teal: 'bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20',
        violet: 'bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20',
        glass: 'bg-slate-800/50 backdrop-blur-sm border border-slate-600/50',
        solid: 'bg-slate-900 border-none',
        outline: 'bg-transparent border-2 border-slate-600'
      },
      size: {
        sm: 'p-3 md:p-4',
        default: 'p-4 md:p-6',
        lg: 'p-6 md:p-8',
        xl: 'p-8 md:p-10'
      },
      hover: {
        none: '',
        slight: 'hover:bg-slate-700/50',
        lift: 'hover:translate-y-[-2px] hover:shadow-xl hover:shadow-slate-900/25',
        glow: 'hover:shadow-lg hover:shadow-teal-500/10',
        scale: 'hover:scale-[1.02]'
      },
      clickable: {
        true: 'cursor-pointer active:scale-[0.98] transition-transform',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      hover: 'none',
      clickable: false
    }
  }
);

const Card = ({
  children,
  className,
  variant,
  size,
  hover,
  clickable,
  onClick,
  ...props
}) => {
  const Component = clickable ? motion.div : 'div';
  
  const cardProps = clickable ? {
    whileHover: hover === 'scale' ? { scale: 1.02 } : hover === 'lift' ? { y: -2 } : {},
    whileTap: { scale: 0.98 },
    onClick
  } : { onClick };

  return (
    <Component
      className={cn(cardVariants({ variant, size, hover, clickable }), className)}
      {...cardProps}
      {...props}
    >
      {children}
    </Component>
  );
};

const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('flex flex-col space-y-2 pb-4 md:pb-6', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-lg md:text-xl font-semibold text-white', className)} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm md:text-base text-slate-400', className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('flex items-center pt-4 md:pt-6', className)} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;