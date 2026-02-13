import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI } from './services/api';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  const [authState, setAuthState] = useState({
    loading: true,
    isAuthenticated: false,
    user: null
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token and refresh profile data
          const profileData = await authAPI.getProfile();
          if (profileData?.success && profileData.user) {
            setAuthState({
              loading: false,
              isAuthenticated: true,
              user: profileData.user
            });
            return;
          }
        } catch (err) {
          console.warn('Token validation failed, clearing auth');
        }
      }
      
      // Clean up invalid auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthState({ loading: false, isAuthenticated: false, user: null });
    };

    initAuth();
  }, []);

  // Handle login and update auth state
  const handleLogin = (userData) => {
    setAuthState({
      loading: false,
      isAuthenticated: true,
      user: userData
    });
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Handle logout and clear auth state
  const handleLogout = () => {
    authAPI.logout();
    setAuthState({
      loading: false,
      isAuthenticated: false,
      user: null
    });
  };

  // Handle successful registration
  const handleRegisterSuccess = () => {
    // Redirect to login with success message
    window.location.href = '/login?registered=true';
  };

  // Show loading spinner while initializing
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Initializing Atar Youth Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes with Main Layout */}
        <Route 
          path="/" 
          element={
            <Layout 
              isAuthenticated={authState.isAuthenticated} 
              user={authState.user} 
              onLogout={handleLogout} 
            />
          }
        >
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          
          {/* Auth Routes */}
          <Route 
            path="login" 
            element={
              !authState.isAuthenticated ? (
                <Login onLogin={handleLogin} /> 
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="register" 
            element={
              !authState.isAuthenticated ? (
                <Register onSuccess={handleRegisterSuccess} /> 
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* Profile Route - Requires Authentication */}
          <Route 
            path="profile" 
            element={
              authState.isAuthenticated ? (
                <Profile /> 
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Route>

        {/* Admin Routes - Protected by Role */}
        <Route 
          path="/admin/*" 
          element={
            authState.isAuthenticated && authState.user?.role === 'admin' ? (
              <AdminLayout user={authState.user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* Future admin pages - placeholders */}
          <Route path="users" element={<div className="p-6 text-center">User Management Page - Coming Soon</div>} />
          <Route path="news" element={<div className="p-6 text-center">News Management Page - Coming Soon</div>} />
          <Route path="issues" element={<div className="p-6 text-center">Issue Tracking Page - Coming Soon</div>} />
          <Route path="activities" element={<div className="p-6 text-center">Activities Management Page - Coming Soon</div>} />
          <Route path="settings" element={<div className="p-6 text-center">System Settings Page - Coming Soon</div>} />
        </Route>

        {/* Catch all - redirect to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;