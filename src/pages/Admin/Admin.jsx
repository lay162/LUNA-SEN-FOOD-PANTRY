import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import StockManagement from './StockManagement';
import ReferralManagement from './ReferralManagement';
import VolunteerManagement from './VolunteerManagement';

const Admin = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check Firebase Auth for admin role
    const checkAdminAuth = async () => {
      // TODO: Implement Firebase Auth check
      // For now, simulate admin check
      const adminUser = localStorage.getItem('luna-admin');
      setIsAuthenticated(!!adminUser);
      setLoading(false);
    };

    checkAdminAuth();
  }, []);

  const handleLogin = () => {
    // TODO: Implement proper Firebase Auth
    localStorage.setItem('luna-admin', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('luna-admin');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="luna-page">
        <div className="luna-container">
          <div className="flex items-center justify-center min-h-64">
            <div className="luna-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="luna-page">
        <div className="luna-container max-w-md">
          <div className="luna-card luna-card--primary">
            <div className="text-center p-8">
              <h1 className="text-3xl font-bold mb-6">
                <span className="luna-text-gradient">LUNA</span> Admin
              </h1>
              <p className="text-gray-600 mb-8">
                Access to the admin panel is restricted to authorized personnel only.
              </p>
              <button
                onClick={handleLogin}
                className="luna-button luna-button--gradient luna-button--lg w-full"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', current: location.pathname === '/admin' },
    { name: 'Stock Management', href: '/admin/stock', current: location.pathname === '/admin/stock' },
    { name: 'Referrals', href: '/admin/referrals', current: location.pathname === '/admin/referrals' },
    { name: 'Volunteers', href: '/admin/volunteers', current: location.pathname === '/admin/volunteers' },
  ];

  return (
    <div className="luna-page">
      <div className="luna-container">
        {/* Admin Header */}
        <div className="flex items-center justify-between mb-8 p-6 bg-white rounded-lg shadow-sm border">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="luna-text-gradient">LUNA</span> Admin Panel
            </h1>
            <p className="text-gray-600">SEN Food Pantry Management System</p>
          </div>
          <button
            onClick={handleLogout}
            className="luna-button luna-button--outline"
          >
            Logout
          </button>
        </div>

        {/* Admin Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-2 bg-white rounded-lg p-2 shadow-sm border">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  item.current
                    ? 'bg-luna-pink text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-luna-pink'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Admin Content */}
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="referrals" element={<ReferralManagement />} />
          <Route path="volunteers" element={<VolunteerManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;