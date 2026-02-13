import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Pill, 
  FileText, 
  BarChart3, 
  User, 
  History,
  Plus,
  Menu,
  X,
  ChevronLeft,
  Activity
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Medicines', href: '/medicines', icon: Pill },
  { name: 'Today', href: '/today', icon: Activity },
  { name: 'Records', href: '/records', icon: FileText },
  { name: 'History', href: '/history', icon: History },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User }
];

const Sidebar = ({ isOpen, onClose, className }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 768) {
      onClose();
    }
  }, [location.pathname, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
          width: isCollapsed ? 80 : 280
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className={cn(
          'fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-700 z-50',
          'md:relative md:translate-x-0',
          'transition-all duration-300',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700">
            <motion.div
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-slate-900" />
              </div>
              {!isCollapsed && (
                <h1 className="text-lg font-bold text-white">
                  MediTrack
                </h1>
              )}
            </motion.div>
            
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X size={20} />
            </Button>

            {/* Desktop collapse button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex text-slate-400 hover:text-white"
            >
              <ChevronLeft
                size={20}
                className={cn(
                  'transition-transform duration-300',
                  isCollapsed && 'rotate-180'
                )}
              />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 relative group',
                    isActive
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <Icon 
                    size={20} 
                    className={cn(
                      'transition-colors duration-200',
                      isActive && 'drop-shadow-sm'
                    )}
                  />
                  
                  <motion.span
                    animate={{ opacity: isCollapsed ? 0 : 1 }}
                    className="truncate"
                  >
                    {item.name}
                  </motion.span>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-16 bg-slate-800 text-white text-sm px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-slate-600 shadow-lg z-10">
                      {item.name}
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-teal-500 rounded-2xl -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Add Button */}
          <div className="p-4 border-t border-slate-700">
            <Button
              variant="gradient"
              width="full"
              leftIcon={<Plus size={18} />}
              className={cn(
                'justify-center',
                isCollapsed && 'px-0'
              )}
            >
              {!isCollapsed && 'Add Medicine'}
            </Button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <motion.div
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              className="text-center"
            >
              <p className="text-xs text-slate-500">
                v1.0.0 • MediTrack
              </p>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;