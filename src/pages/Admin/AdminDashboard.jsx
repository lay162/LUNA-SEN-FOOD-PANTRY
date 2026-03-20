import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const urgentReferrals = [
    {
      id: 'REF-001',
      familyCode: 'FAM-2024-089',
      reason: 'Child not eating, weight loss concern',
      timeAgo: '2 hours ago',
      priority: 'critical'
    },
    {
      id: 'REF-003', 
      familyCode: 'FAM-2024-087',
      reason: 'Benefits delayed, no food in house',
      timeAgo: '1 day ago',
      priority: 'urgent'
    }
  ];

  const lowStockItems = [
    {
      name: 'Gluten-Free Pasta Shapes',
      current: 3,
      minimum: 10,
      category: 'SEN-Safe'
    },
    {
      name: 'Dairy-Free UHT Milk', 
      current: 8,
      minimum: 15,
      category: 'Allergen-Free'
    },
    {
      name: 'Baby Formula (0-6m)',
      current: 5,
      minimum: 8,
      category: 'Baby Care'
    }
  ];

  return (
    <>
      {/* Dashboard Header */}
      <div className="luna-card luna-card--primary mb-8">
        <div className="p-6">
          <h1 className="luna-text-gradient text-3xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Managing LUNA SEN Food Pantry operations • {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="luna-card-grid luna-card-grid--4-col mb-8">
        <div className="luna-card">
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-luna-pink mb-2">127</div>
            <div className="text-sm text-gray-600">Active Families</div>
            <div className="text-xs text-green-600 mt-1">+3 this week</div>
          </div>
        </div>

        <div className="luna-card">
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">8</div>
            <div className="text-sm text-gray-600">Urgent Referrals</div>
            <div className="text-xs text-red-600 mt-1">Needs attention</div>
          </div>
        </div>

        <div className="luna-card">
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">12</div>
            <div className="text-sm text-gray-600">Low Stock Items</div>
            <div className="text-xs text-red-600 mt-1">Critical: 3 items</div>
          </div>
        </div>

        <div className="luna-card">
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">28</div>
            <div className="text-sm text-gray-600">Active Volunteers</div>
            <div className="text-xs text-green-600 mt-1">340h this month</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="luna-card-grid luna-card-grid--2-col">
        {/* Urgent Referrals */}
        <div className="luna-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Urgent Referrals</h2>
              <Link to="/admin/referrals" className="luna-button luna-button--sm luna-button--outline">
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {urgentReferrals.map((referral) => (
                <div key={referral.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-red-800">{referral.familyCode}</p>
                      <p className="text-sm text-red-600">{referral.reason}</p>
                      <p className="text-xs text-red-500 mt-1">{referral.timeAgo}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      referral.priority === 'critical' ? 
                      'bg-red-200 text-red-800' : 
                      'bg-orange-200 text-orange-800'
                    }`}>
                      {referral.priority.toUpperCase()}
                    </span>
                  </div>
                  <button className="luna-button luna-button--sm luna-button--primary mt-3">
                    Review Case
                  </button>
                </div>
              ))}
              
              {urgentReferrals.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No urgent referrals at this time
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="luna-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Stock Alerts</h2>
              <Link to="/admin/stock" className="luna-button luna-button--sm luna-button--outline">
                Manage Stock
              </Link>
            </div>
            
            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div key={index} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-orange-800">{item.name}</p>
                      <p className="text-sm text-orange-600">{item.category}</p>
                      <div className="flex items-center mt-2">
                        <div className="text-xs text-orange-600">
                          Current: <span className="font-bold">{item.current}</span> | 
                          Minimum: <span className="font-bold">{item.minimum}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        item.current < item.minimum / 2 ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {item.current}
                      </div>
                      <div className="text-xs text-gray-500">units</div>
                    </div>
                  </div>
                  <button className="luna-button luna-button--sm luna-button--secondary mt-3">
                    Update Stock
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="luna-card">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium">New urgent referral received</p>
                  <p className="text-sm text-gray-600">FAM-2024-089 • Child not eating</p>
                </div>
                <span className="text-xs text-gray-500">2h ago</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium">Stock critically low</p>
                  <p className="text-sm text-gray-600">Gluten-Free Pasta Shapes</p>
                </div>
                <span className="text-xs text-gray-500">4h ago</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium">Delivery completed</p>
                  <p className="text-sm text-gray-600">Route 3 • 8 families served</p>
                </div>
                <span className="text-xs text-gray-500">6h ago</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">New volunteer registered</p>
                  <p className="text-sm text-gray-600">Emma Thompson • Delivery driver</p>
                </div>
                <span className="text-xs text-gray-500">1d ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="luna-card">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/referrals" className="luna-button luna-button--primary w-full">
                📋 Review New Referrals
              </Link>
              
              <Link to="/admin/stock" className="luna-button luna-button--secondary w-full">
                📦 Update Stock Levels
              </Link>
              
              <Link to="/admin/volunteers" className="luna-button luna-button--outline w-full">
                👥 Manage Volunteers
              </Link>
              
              <button className="luna-button luna-button--outline w-full">
                📊 Generate Reports
              </button>
              
              <button className="luna-button luna-button--outline w-full">
                📱 QR Code Scanner
              </button>
              
              <button className="luna-button luna-button--outline w-full">
                💌 Send Family Updates
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;