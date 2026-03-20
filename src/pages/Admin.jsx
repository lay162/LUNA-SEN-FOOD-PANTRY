import React, { useState } from 'react';
import Button from '../components/Button';

const Admin = () => {
  const [referrals, setReferrals] = useState({
    taken: 247,
    fulfilled: 231,
    pending: 16
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple auth - in production use proper authentication
    if (credentials.username === 'lauren' && credentials.password === 'luna2024') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const updateReferrals = (field, value) => {
    setReferrals(prev => ({
      ...prev,
      [field]: parseInt(value) || 0,
      pending: field === 'taken' || field === 'fulfilled' 
        ? Math.max(0, (field === 'taken' ? parseInt(value) : prev.taken) - (field === 'fulfilled' ? parseInt(value) : prev.fulfilled))
        : prev.pending
    }));
  };

  if (!isLoggedIn) {
    return (
      <div className="luna-page">
        <div className="luna-container">
          <div className="admin-login">
            <div className="admin-login__card">
              <h1 className="admin-login__title">LUNA SEN PANTRY</h1>
              <h2 className="admin-login__subtitle">Admin Access</h2>
              
              <form onSubmit={handleLogin} className="admin-login__form">
                <div className="admin-login__field">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="admin-login__field">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  Sign In
                </Button>
              </form>
            </div>
          </div>
        </div>

        <style jsx>{`
          .admin-login {
            min-height: calc(100vh - var(--luna-header-height));
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--luna-gradient-primary);
          }

          .admin-login__card {
            background: #ffffff;
            padding: var(--luna-space-12);
            border-radius: var(--luna-radius-lg);
            box-shadow: var(--luna-shadow-xl);
            max-width: 400px;
            width: 100%;
            text-align: center;
          }

          .admin-login__title {
            font-size: var(--luna-font-size-2xl);
            font-weight: var(--luna-font-weight-bold);
            background: var(--luna-gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: var(--luna-space-2);
          }

          .admin-login__subtitle {
            color: var(--luna-text-secondary);
            margin-bottom: var(--luna-space-8);
          }

          .admin-login__form {
            display: flex;
            flex-direction: column;
            gap: var(--luna-space-6);
          }

          .admin-login__field {
            text-align: left;
          }

          .admin-login__field label {
            display: block;
            font-weight: var(--luna-font-weight-medium);
            margin-bottom: var(--luna-space-2);
            color: var(--luna-text-primary);
          }

          .admin-login__field input {
            width: 100%;
            padding: var(--luna-space-3);
            border: 1px solid var(--luna-grey-300);
            border-radius: var(--luna-radius-md);
            font-size: var(--luna-font-size-base);
            transition: border-color var(--luna-transition-fast);
          }

          .admin-login__field input:focus {
            outline: none;
            border-color: var(--luna-primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="luna-page">
      <div className="luna-container">
        <div className="admin-dashboard">
          <div className="admin-header">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Welcome back, Lauren</p>
            <Button 
              variant="secondary" 
              onClick={() => setIsLoggedIn(false)}
              style={{ marginLeft: 'auto' }}
            >
              Sign Out
            </Button>
          </div>

          <div className="admin-stats">
            <h2 className="admin-section-title">Referral Management</h2>
            
            <div className="admin-stats__grid">
              <div className="admin-stat-card">
                <div className="admin-stat-card__header">
                  <h3>Total Referrals Taken</h3>
                </div>
                <div className="admin-stat-card__content">
                  <input
                    type="number"
                    value={referrals.taken}
                    onChange={(e) => updateReferrals('taken', e.target.value)}
                    className="admin-stat-input"
                  />
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-card__header">
                  <h3>Referrals Fulfilled</h3>
                </div>
                <div className="admin-stat-card__content">
                  <input
                    type="number"
                    value={referrals.fulfilled}
                    onChange={(e) => updateReferrals('fulfilled', e.target.value)}
                    className="admin-stat-input"
                  />
                </div>
              </div>

              <div className="admin-stat-card admin-stat-card--readonly">
                <div className="admin-stat-card__header">
                  <h3>Pending Deliveries</h3>
                </div>
                <div className="admin-stat-card__content">
                  <div className="admin-stat-display">{referrals.pending}</div>
                </div>
              </div>
            </div>

            <div className="admin-actions">
              <Button variant="primary" size="lg">
                Save Changes
              </Button>
              <Button variant="gradient" size="lg">
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          padding: var(--luna-space-12) 0;
          min-height: calc(100vh - var(--luna-header-height));
        }

        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--luna-space-12);
          padding-bottom: var(--luna-space-6);
          border-bottom: 1px solid var(--luna-grey-200);
        }

        .admin-title {
          font-size: var(--luna-font-size-3xl);
          font-weight: var(--luna-font-weight-bold);
          background: var(--luna-gradient-primary);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .admin-subtitle {
          color: var(--luna-text-secondary);
          margin: var(--luna-space-2) 0 0 0;
        }

        .admin-section-title {
          font-size: var(--luna-font-size-xl);
          font-weight: var(--luna-font-weight-bold);
          color: var(--luna-text-primary);
          margin-bottom: var(--luna-space-8);
        }

        .admin-stats__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--luna-space-6);
          margin-bottom: var(--luna-space-10);
        }

        .admin-stat-card {
          background: #ffffff;
          border: 1px solid var(--luna-grey-200);
          border-radius: var(--luna-radius-lg);
          padding: var(--luna-space-6);
          box-shadow: var(--luna-shadow-sm);
          transition: all var(--luna-transition-fast);
        }

        .admin-stat-card:hover {
          box-shadow: var(--luna-shadow-md);
        }

        .admin-stat-card--readonly {
          background: var(--luna-bg-secondary);
        }

        .admin-stat-card__header h3 {
          font-size: var(--luna-font-size-base);
          font-weight: var(--luna-font-weight-semibold);
          color: var(--luna-text-primary);
          margin: 0 0 var(--luna-space-4) 0;
        }

        .admin-stat-input {
          width: 100%;
          padding: var(--luna-space-4);
          font-size: var(--luna-font-size-2xl);
          font-weight: var(--luna-font-weight-bold);
          color: var(--luna-primary);
          border: 2px solid var(--luna-grey-300);
          border-radius: var(--luna-radius-md);
          text-align: center;
          transition: all var(--luna-transition-fast);
        }

        .admin-stat-input:focus {
          outline: none;
          border-color: var(--luna-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .admin-stat-display {
          font-size: var(--luna-font-size-2xl);
          font-weight: var(--luna-font-weight-bold);
          color: var(--luna-secondary);
          text-align: center;
          padding: var(--luna-space-4);
        }

        .admin-actions {
          display: flex;
          gap: var(--luna-space-4);
          justify-content: center;
        }

        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--luna-space-4);
          }

          .admin-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Admin;