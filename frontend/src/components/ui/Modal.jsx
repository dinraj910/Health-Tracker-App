import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className
}) => {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-sm',
    default: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className={cn(
              'relative w-full max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl mx-4',
              sizeClasses[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700">
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2 className="text-lg md:text-xl font-semibold text-white truncate">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm md:text-base text-slate-400 line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>
                
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    className="ml-4 flex-shrink-0 text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ModalHeader = ({ children, className, ...props }) => (
  <div className={cn('p-4 md:p-6 border-b border-slate-700', className)} {...props}>
    {children}
  </div>
);

const ModalContent = ({ children, className, ...props }) => (
  <div className={cn('p-4 md:p-6', className)} {...props}>
    {children}
  </div>
);

const ModalFooter = ({ children, className, ...props }) => (
  <div className={cn('flex items-center justify-end gap-3 p-4 md:p-6 border-t border-slate-700', className)} {...props}>
    {children}
  </div>
);

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;