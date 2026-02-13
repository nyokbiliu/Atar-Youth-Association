import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiInfo, FiMail, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState, useMemo } from 'react';

// Helper: Resolve full image URL for backend-served images
const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // Prepend backend base URL for relative paths (dev environment)
  return `http://localhost:5000${url.startsWith('/') ? url : `/${url}`}`;
};

const Layout = ({ isAuthenticated, user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract FIRST NAME only (safe fallbacks)
  const firstName = useMemo(() => {
    if (!user) return 'User';
    if (user.firstName) return user.firstName;
    if (user.profile?.fullName) return user.profile.fullName.split(' ')[0];
    if (user.email) return user.email.split('@')[0];
    return 'User';
  }, [user]);
  
  // Get profile photo URL with backend resolution
  const profilePhotoUrl = useMemo(() => {
    if (!user) return null;
    
    // Prioritize profile.photoUrl from getProfile endpoint
    const photo = user.profile?.profilePhotoUrl || user.profilePhotoUrl;
    if (photo && photo !== '/default-avatar.png') {
      return resolveImageUrl(photo);
    }
    
    // Fallback to generated avatar ONLY if no photo exists
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=0ea5e9&color=fff&size=128`;
  }, [user, firstName]);

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/about', label: 'About', icon: FiInfo },
    { path: '/contact', label: 'Contact', icon: FiMail },
  ];

  // Auth actions: ONLY show [Avatar + Name] and Logout button
  const getAuthActions = () => {
    if (!isAuthenticated) return [
      { 
        path: '/login', 
        label: 'Login', 
        icon: FiUser, 
        variant: 'primary',
        action: () => navigate('/login')
      },
      { 
        path: '/register', 
        label: 'Register', 
        icon: FiUser, 
        variant: 'secondary',
        action: () => navigate('/register')
      }
    ];
    
    return [
      // SINGLE BUTTON: Avatar + First Name (links to profile)
      { 
        path: '/profile', 
        label: (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img 
                src={profilePhotoUrl} 
                alt={firstName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=0ea5e9&color=fff`;
                }} 
              />
            </div>
            <span className="font-medium">{firstName}</span>
          </div>
        ),
        action: () => navigate('/profile'),
        isProfileButton: true
      },
      // Logout button (clean text)
      { 
        path: '/logout', 
        label: 'Logout', 
        icon: FiLogOut, 
        action: () => {
          onLogout();
          navigate('/');
        },
        variant: 'danger'
      }
    ];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl tracking-tight"> <img src="public\uploads\thumbnails\logo.png" alt="AY Logo" className="w-6 h-6" /></span>
              </div>
              <div>
                <div className="font-bold text-xl text-gray-900">Atar Youth</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    location.pathname === item.path
                      ? 'text-primary-700 bg-primary-50 shadow-sm'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Desktop Auth Actions: ONLY 2 buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {getAuthActions().map((item, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    item.action?.();
                  }}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    item.variant === 'primary'
                      ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md'
                      : item.variant === 'secondary'
                      ? 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-50'
                      : item.variant === 'danger'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : item.isProfileButton
                      ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-primary-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4">
            <div className="px-4 space-y-1">
              {[...navItems, ...getAuthActions()].map((item, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    item.action?.();
                    if (item.path && !item.action) navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3.5 rounded-xl font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    location.pathname === item.path ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    {item.isProfileButton ? (
                      <div className="w-5 h-5 rounded-full overflow-hidden">
                        <img 
                          src={profilePhotoUrl} 
                          alt={firstName} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=0ea5e9&color=fff&size=20`;
                          }} 
                        />
                      </div>
                    ) : (
                      <item.icon className={`w-5 h-5 ${
                        location.pathname === item.path ? 'text-primary-600' : 'text-gray-600'
                      }`} />
                    )}
                  </div>
                  <span>{typeof item.label === 'string' ? item.label : 'Profile'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer (unchanged - kept for completeness) */}
      <footer className="bg-gray-900 text-gray-300 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AY</span>
                </div>
                <span className="text-white font-bold text-xl">Atar Youth</span>
              </div>
              <p className="text-sm leading-relaxed">
                Empowering South Sudanese youth through education, community development, and peace-building initiatives since 2010.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      className="hover:text-white transition-colors flex items-center space-x-2"
                    >
                      <item.icon className="w-4 h-4 text-primary-400" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="mt-1">📧</span>
                  <span className="ml-2">info@ataryouth.org</span>
                </li>
                <li className="flex items-start">
                  <span className="mt-1">📱</span>
                  <span className="ml-2">+211 912 345 678</span>
                </li>
                <li className="flex items-start">
                  <span className="mt-1">📍</span>
                  <span className="ml-2">Juba, Central Equatoria, South Sudan</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-800 text-center text-sm">
            <p>
              &copy; {new Date().getFullYear()} Atar Youth Association. All rights reserved. | 
              <Link to="/privacy" className="text-primary-400 hover:text-white ml-1">Privacy Policy</Link>
            </p>
            <p className="mt-1 text-gray-500">
              Building futures for South Sudanese youth 🌍
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;