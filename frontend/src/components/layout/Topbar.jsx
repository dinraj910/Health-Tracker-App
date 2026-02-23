import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Command,
  Pill,
  FileText,
  BarChart3,
  Activity,
  Calendar,
  Shield,
  Lock,
  Heart,
  X,
  ArrowRight,
  Clock,
  Hash,
  Sparkles,
  Home
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

// Search-navigable pages
const SEARCHABLE_PAGES = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, category: 'Pages' },
  { name: 'My Medicines', href: '/medicines', icon: Pill, category: 'Pages' },
  { name: 'Add Medicine', href: '/medicines/add', icon: Pill, category: 'Pages' },
  { name: 'Today\'s Doses', href: '/today', icon: Activity, category: 'Pages' },
  { name: 'Medical Records', href: '/records', icon: FileText, category: 'Pages' },
  { name: 'Health History', href: '/history', icon: Calendar, category: 'Pages' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, category: 'Pages' },
  { name: 'Profile Settings', href: '/profile', icon: User, category: 'Settings' },
  { name: 'Change Password', href: '/profile', icon: Lock, category: 'Settings' },
  { name: 'Security Settings', href: '/profile', icon: Shield, category: 'Settings' },
];

const Topbar = ({
  onMenuClick,
  user,
  onLogout,
  className
}) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notifications] = useState(3);
  const profileRef = useRef(null);
  const settingsRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Filter search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return SEARCHABLE_PAGES.slice(0, 6);
    const q = searchQuery.toLowerCase();
    return SEARCHABLE_PAGES.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Keyboard shortcut: Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSelectedIndex(0);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle arrow keys & enter in search
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleKeyNav = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
        e.preventDefault();
        navigate(searchResults[selectedIndex].href);
        setIsSearchOpen(false);
        setSearchQuery('');
        setSelectedIndex(0);
      }
    };
    document.addEventListener('keydown', handleKeyNav);
    return () => document.removeEventListener('keydown', handleKeyNav);
  }, [isSearchOpen, searchResults, selectedIndex, navigate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchNavigate = (href) => {
    navigate(href);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  };

  return (
    <>
      <header className={cn(
        'sticky top-0 z-30 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-700/80',
        className
      )}>
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <Menu size={20} />
            </Button>

            {/* Greeting & Date */}
            <div className="hidden lg:block">
              <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-teal-400" />
                {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Center Section - Search Trigger */}
          <div className="flex-1 max-w-lg mx-4 md:mx-8">
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="w-full flex items-center gap-3 h-10 px-4 text-slate-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-600/50 hover:border-slate-500/70 rounded-xl transition-all duration-200 group"
            >
              <Search size={16} className="text-slate-500 group-hover:text-teal-400 transition-colors" />
              <span className="hidden sm:inline text-sm">Search medicines, records, pages...</span>
              <span className="sm:hidden text-sm">Search...</span>
              <div className="ml-auto hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-700/80 border border-slate-600/50 rounded text-slate-400">
                  Ctrl
                </kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-700/80 border border-slate-600/50 rounded text-slate-400">
                  K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-400 hover:text-white"
            >
              <Bell size={20} />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center bg-red-500 text-white rounded-full ring-2 ring-slate-900 animate-pulse">
                  {notifications}
                </span>
              )}
            </Button>

            {/* Settings Dropdown */}
            <div className="relative hidden md:block" ref={settingsRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsProfileOpen(false);
                }}
                className={cn(
                  'text-slate-400 hover:text-white transition-all duration-200',
                  isSettingsOpen && 'text-teal-400 bg-slate-800'
                )}
              >
                <Settings size={20} className={cn(
                  'transition-transform duration-500',
                  isSettingsOpen && 'rotate-90'
                )} />
              </Button>

              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-600/70 rounded-2xl shadow-2xl shadow-black/40 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-slate-700/70">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Settings</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsSettingsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-teal-500/10 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center group-hover:bg-teal-500/25 transition-colors">
                          <User size={14} className="text-teal-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Profile</p>
                          <p className="text-[10px] text-slate-500">Edit your details</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsSettingsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-violet-500/10 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center group-hover:bg-violet-500/25 transition-colors">
                          <Shield size={14} className="text-violet-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Security</p>
                          <p className="text-[10px] text-slate-500">Password & privacy</p>
                        </div>
                      </button>

                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-indigo-500/10 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors">
                          <Moon size={14} className="text-indigo-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Appearance</p>
                          <p className="text-[10px] text-slate-500">Dark mode (active)</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsSettingsOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2.5 px-2 md:px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-slate-800/80',
                  isProfileOpen && 'bg-slate-800/80'
                )}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-teal-500 flex items-center justify-center text-slate-900 font-bold text-sm shadow-lg shadow-teal-500/20">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-slate-900" />
                </div>

                {/* Name (hidden on mobile) */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-white truncate max-w-24 leading-tight">
                    {user?.name?.split(' ')[0] || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">Online</p>
                </div>

                <ChevronDown
                  size={14}
                  className={cn(
                    'hidden md:block text-slate-500 transition-transform duration-200',
                    isProfileOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-xl border border-slate-600/70 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/5 border-b border-slate-700/70">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-teal-500 flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg shadow-teal-500/25">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            user?.name?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {user?.email || 'user@example.com'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            <span className="text-[10px] text-green-400 font-medium">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-teal-500/10 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                          <User size={14} className="text-slate-400 group-hover:text-teal-400 transition-colors" />
                        </div>
                        <span>View Profile</span>
                        <ArrowRight size={14} className="ml-auto text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                      </button>

                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-violet-500/10 transition-all duration-200 group md:hidden"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                          <Settings size={14} className="text-slate-400 group-hover:text-violet-400 transition-colors" />
                        </div>
                        <span>Settings</span>
                        <ArrowRight size={14} className="ml-auto text-slate-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                      </button>

                      <button
                        onClick={() => {
                          navigate('/analytics');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-sky-500/10 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                          <BarChart3 size={14} className="text-slate-400 group-hover:text-sky-400 transition-colors" />
                        </div>
                        <span>My Analytics</span>
                        <ArrowRight size={14} className="ml-auto text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-700/70 p-2">
                      <button
                        onClick={() => {
                          onLogout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                          <LogOut size={14} />
                        </div>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* === Command Palette / Search Modal === */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh]"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
              setSelectedIndex(0);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/80">
                <Search size={18} className="text-teal-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Search pages, medicines, settings..."
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-500 outline-none"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedIndex(0);
                    }}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-600/50 rounded text-slate-500">
                  ESC
                </kbd>
              </div>

              {/* Search Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {searchResults.length > 0 ? (
                  <>
                    {/* Group by category */}
                    {['Pages', 'Settings'].map(category => {
                      const items = searchResults.filter(r => r.category === category);
                      if (items.length === 0) return null;
                      return (
                        <div key={category} className="mb-2">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-1.5">
                            {category}
                          </p>
                          {items.map((result) => {
                            const globalIndex = searchResults.indexOf(result);
                            const isSelected = globalIndex === selectedIndex;
                            const Icon = result.icon;
                            return (
                              <button
                                key={result.name + result.href}
                                onClick={() => handleSearchNavigate(result.href)}
                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                                  isSelected
                                    ? 'bg-teal-500/15 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                )}
                              >
                                <div className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                  isSelected ? 'bg-teal-500/20' : 'bg-slate-800'
                                )}>
                                  <Icon size={14} className={isSelected ? 'text-teal-400' : 'text-slate-500'} />
                                </div>
                                <span className="flex-1 text-left font-medium">{result.name}</span>
                                {isSelected && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <span>Enter</span>
                                    <ArrowRight size={10} className="text-teal-400" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <Search size={32} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-slate-600 mt-1">Try searching for pages, medicines, or settings</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-700/80 bg-slate-900/50">
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono">↵</kbd>
                    Open
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Command size={10} />
                  <span>MediTrack Search</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Topbar;