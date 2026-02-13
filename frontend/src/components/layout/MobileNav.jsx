import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Pill, 
  Plus, 
  BarChart3, 
  User,
  Activity
} from 'lucide-react';
import { cn } from '../../utils/cn';

const bottomNavigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Pills', href: '/medicines', icon: Pill },
  { name: 'Add', href: '/medicines/add', icon: Plus, isCenter: true },
  { name: 'Stats', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User }
];

const MobileNav = ({ className }) => {
  const location = useLocation();

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 md:hidden',
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {bottomNavigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          if (item.isCenter) {
            // Center FAB (Floating Action Button)
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/25 -mt-6"
                >
                  <Icon size={24} className="text-slate-900" />
                </motion.div>
                
                {/* Label */}
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-slate-400"
                >
                  {item.name}
                </motion.span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 min-w-12 transition-all duration-200 relative',
                isActive ? 'text-teal-400' : 'text-slate-400'
              )}
            >
              <motion.div
                animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
              >
                <Icon 
                  size={20} 
                  className={cn(
                    'transition-colors duration-200',
                    isActive && 'drop-shadow-sm'
                  )}
                />
                
                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-400 rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </motion.div>
              
              {/* Label */}
              <motion.span
                animate={isActive ? { fontWeight: 500 } : { fontWeight: 400 }}
                className="text-xs leading-none"
              >
                {item.name}
              </motion.span>
              
              {/* Active glow effect */}
              {isActive && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute inset-0 bg-teal-500/10 rounded-xl -z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
      
      {/* Safe area spacing for phones with home indicators */}
      <div className="h-safe-area-inset-bottom bg-slate-900/95" />
    </nav>
  );
};

export default MobileNav;