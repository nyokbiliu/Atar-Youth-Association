import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiFileText, FiAlertCircle, FiCalendar, FiSettings, 
  FiLogOut, FiMenu, FiX, FiBarChart2, FiDatabase, FiShield
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AdminLayout = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Admin-only navigation
  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiBarChart2 },
    { path: '/admin/users', label: 'User Management', icon: FiUsers },
    { path: '/admin/news', label: 'News Management', icon: FiFileText },
    { path: '/admin/issues', label: 'Issue Tracking', icon: FiAlertCircle },
    { path: '/admin/activities', label: 'Activities', icon: FiCalendar },
    { path: '/admin/settings', label: 'System Settings', icon: FiSettings },
  ];

  const handleLogout = async () => {
    await authAPI.logout();
    navigate('/login');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      {sidebarOpen && (
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-gray-900">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 bg-primary-700">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-xl">AY</span>
                </div>
                <span className="text-white font-bold text-lg">Admin Portal</span>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="px-3 mt-5">
                <div className="space-y-1">
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md ${
                        location.pathname === item.path
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        location.pathname === item.path ? 'text-white' : 'text-gray-400'
                      }`} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>
              
              {/* Admin Profile */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user?.firstName?.charAt(0) || 'A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.firstName || 'Admin'}
                    </p>
                    <p className="text-xs text-primary-200 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-700 hover:text-primary-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
              </div>
              
              {/* Page Title */}
              <h1 className="text-2xl font-bold text-gray-900 hidden md:block">
                {adminNavItems.find(item => item.path === location.pathname)?.label || 'Admin Dashboard'}
              </h1>
              
              {/* Logout Button */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 fixed inset-0 z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">AY</span>
                </div>
                <span className="text-white font-bold text-lg">Admin Portal</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                <FiX size={28} />
              </button>
            </div>
            
            <nav className="mt-5 px-2">
              <div className="space-y-1">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-3 py-3 text-base font-medium rounded-md ${
                      location.pathname === item.path
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      location.pathname === item.path ? 'text-white' : 'text-gray-400'
                    }`} />
                    {item.label}
                  </Link>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-800 px-3">
                <div className="flex items-center space-x-3 py-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user?.firstName?.charAt(0) || 'A'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.firstName || 'Admin'}</p>
                    <p className="text-xs text-primary-200">{user?.email}</p>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;