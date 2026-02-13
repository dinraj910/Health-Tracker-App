import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MobileNav from '../components/layout/MobileNav';
import Loader from '../components/ui/Loader';

const DashboardLayout = ({ children, title, fullWidth = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Show loading spinner during auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader 
          variant="gradient" 
          size="xl" 
          text="Loading dashboard..." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar 
          isOpen={true}
          onClose={() => {}}
        />
      </div>
      
      {/* Mobile Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="md:hidden"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {/* Page Header */}
          {title && (
            <div className="bg-slate-900/50 border-b border-slate-700 px-4 md:px-6 py-4 md:py-6">
              <div className={fullWidth ? 'w-full' : 'max-w-7xl mx-auto'}>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {title}
                </h1>
              </div>
            </div>
          )}
          
          {/* Content Container */}
          <div className={fullWidth ? 'w-full' : 'max-w-7xl mx-auto'}>
            <div className="px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

// HOC for pages that need authentication
export const withDashboardLayout = (
  WrappedComponent, 
  { title, fullWidth } = {}
) => {
  return function DashboardPage(props) {
    return (
      <DashboardLayout title={title} fullWidth={fullWidth}>
        <WrappedComponent {...props} />
      </DashboardLayout>
    );
  };
};

export default DashboardLayout;