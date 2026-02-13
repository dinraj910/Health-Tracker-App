import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Bell, 
  Search, 
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

const Topbar = ({ 
  onMenuClick, 
  user, 
  onLogout,
  className 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={cn(
      'sticky top-0 z-30 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-700',
      className
    )}>
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <Menu size={20} />
          </Button>

          {/* Date & Time */}
          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-white">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-lg mx-4 md:mx-8" ref={searchRef}>
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={cn(
                'w-full justify-start gap-3 h-10 px-4 text-slate-400 bg-slate-800/50 hover:bg-slate-800 border border-slate-600/50',
                isSearchOpen && 'hidden'
              )}
            >
              <Search size={18} />
              <span className="hidden sm:inline">Search medicines, records...</span>
              <span className="sm:hidden">Search...</span>
            </Button>

            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 z-10"
                >
                  <Input
                    placeholder="Search medicines, records..."
                    leftIcon={<Search size={18} />}
                    className="w-full"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-400 hover:text-white"
          >
            <Bell size={20} />
            {notifications > 0 && (
              <Badge
                variant="danger"
                size="sm"
                className="absolute -top-1 -right-1 min-w-5 h-5 text-xs flex items-center justify-center"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-slate-400 hover:text-white"
          >
            <Settings size={20} />
          </Button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-2 md:px-3 text-slate-400 hover:text-white"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-slate-900 font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {/* Name (hidden on mobile) */}
              <span className="hidden md:block text-sm font-medium truncate max-w-24">
                {user?.name || 'User'}
              </span>
              
              <ChevronDown 
                size={16}
                className={cn(
                  'hidden md:block transition-transform duration-200',
                  isProfileOpen && 'rotate-180'
                )}
              />
            </Button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-600 rounded-2xl shadow-xl py-2 z-50"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-sm font-medium text-white">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors duration-200">
                      <User size={16} />
                      Profile Settings
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors duration-200 md:hidden">
                      <Settings size={16} />
                      Settings
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors duration-200">
                      <Moon size={16} />
                      Dark Theme
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-700 py-2">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors duration-200"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;