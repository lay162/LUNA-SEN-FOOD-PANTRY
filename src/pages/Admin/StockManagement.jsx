import React, { useState } from 'react';

const StockManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Items', count: 127 },
    { id: 'sen-safe', name: 'SEN-Safe Foods', count: 34, priority: 'high' },
    { id: 'allergens', name: 'Allergen-Free', count: 28, priority: 'high' },
    { id: 'baby', name: 'Baby/Child', count: 19, priority: 'high' },
    { id: 'staples', name: 'Staples', count: 24, priority: 'medium' },
    { id: 'hygiene', name: 'Hygiene', count: 15, priority: 'medium' },
    { id: 'pet', name: 'Pet Care', count: 7, priority: 'low' }
  ];

  const stockItems = [
    {
      id: 1,
      name: 'Gluten-Free Pasta Shapes',
      category: 'sen-safe',
      current: 3,
      minimum: 10,
      maximum: 25,
      unit: 'packets',
      lastUpdated: '2 hours ago',
      status: 'critical',
      supplier: 'Local Donations',
      notes: 'Specific brand required for texture-sensitive children'
    },
    {
      id: 2,
      name: 'Dairy-Free UHT Milk',
      category: 'allergens',
      current: 8,
      minimum: 15,
      maximum: 30,
      unit: 'cartons',
      lastUpdated: '1 day ago',
      status: 'low',
      supplier: 'Supermarket Partnership',
      notes: 'Multiple allergies supported'
    },
    {
      id: 3,
      name: 'Baby Formula (0-6 months)',
      category: 'baby',
      current: 5,
      minimum: 8,
      maximum: 20,
      unit: 'tins',
      lastUpdated: '3 hours ago',
      status: 'low',
      supplier: 'Healthcare Donations',
      notes: 'Critical for infant feeding'
    },
    {
      id: 4,
      name: 'Plain Rice (Long Grain)',
      category: 'staples',
      current: 15,
      minimum: 12,
      maximum: 25,
      unit: 'kg bags',
      lastUpdated: '1 day ago',
      status: 'good',
      supplier: 'Wholesale Purchase',
      notes: 'Safe food for most dietary needs'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'low': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-orange-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredItems = stockItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Stock Overview Header */}
      <div className="luna-card luna-card--primary mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Stock Management</h1>
            <button className="luna-button luna-button--gradient">
              Add New Item
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-600">12</p>
              <p className="text-sm text-gray-600">Critical Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">18</p>
              <p className="text-sm text-gray-600">Low Stock</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">97</p>
              <p className="text-sm text-gray-600">Well Stocked</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-luna-pink">127</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories and Search */}
      <div className="luna-card-grid luna-card-grid--2-col mb-8">
        {/* Categories */}
        <div className="luna-card">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg border-l-4 transition-all ${
                    selectedCategory === category.id 
                      ? 'bg-luna-pink-50 border-l-luna-pink'
                      : `bg-gray-50 ${getCategoryPriorityColor(category.priority)} hover:bg-gray-100`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-gray-600">
                      {category.count} items
                    </span>
                  </div>
                  {category.priority && (
                    <span className={`text-xs mt-1 inline-block ${
                      category.priority === 'high' ? 'text-red-600' :
                      category.priority === 'medium' ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                      {category.priority.toUpperCase()} PRIORITY
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="luna-card">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Search & Actions</h2>
            
            {/* Search */}
            <div className="mb-6">
              <label className="luna-form-label">Search Items</label>
              <input
                type="text"
                className="luna-form-input"
                placeholder="Search by item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button className="luna-button luna-button--primary w-full">
                Bulk Stock Update
              </button>
              <button className="luna-button luna-button--secondary w-full">
                Generate Stock Report
              </button>
              <button className="luna-button luna-button--outline w-full">
                QR Code Scanner
              </button>
              <button className="luna-button luna-button--outline w-full">
                Print Labels
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Items List */}
      <div className="luna-card">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">
            Stock Items 
            {selectedCategory !== 'all' && (
              <span className="text-sm text-gray-600 font-normal ml-2">
                - {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
          </h2>

          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.notes}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(item.status)}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Current Stock</p>
                    <p className="font-medium">{item.current} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Minimum Level</p>
                    <p className="font-medium">{item.minimum} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Maximum Capacity</p>
                    <p className="font-medium">{item.maximum} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Supplier</p>
                    <p className="font-medium">{item.supplier}</p>
                  </div>
                </div>

                {/* Stock Level Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Stock Level</span>
                    <span>{Math.round((item.current / item.maximum) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        item.status === 'critical' ? 'bg-red-500' :
                        item.status === 'low' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((item.current / item.maximum) * 100, 100)}%` }}
                    />
                    {/* Minimum level indicator */}
                    <div
                      className="absolute w-0.5 h-3 bg-gray-600"
                      style={{ left: `${(item.minimum / item.maximum) * 100}%`, marginTop: '-12px' }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last updated: {item.lastUpdated}</span>
                  <div className="space-x-2">
                    <button className="luna-button luna-button--sm luna-button--outline">
                      Edit
                    </button>
                    <button className="luna-button luna-button--sm luna-button--primary">
                      Update Stock
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No items found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StockManagement;