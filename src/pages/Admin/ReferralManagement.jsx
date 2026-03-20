import React, { useState } from 'react';

const ReferralManagement = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = [
    { id: 'all', name: 'All Referrals', count: 47 },
    { id: 'urgent', name: 'Urgent', count: 8, color: 'red' },
    { id: 'pending', name: 'Pending Review', count: 12, color: 'orange' },
    { id: 'active', name: 'Active Support', count: 23, color: 'green' },
    { id: 'completed', name: 'Completed', count: 4, color: 'blue' }
  ];

  const referrals = [
    {
      id: 'REF-001',
      familyCode: 'FAM-2024-089',
      referredBy: 'School SENCO',
      contactName: 'Sarah Williams',
      contactEmail: 'sarah.w@primaryschool.edu',
      dateReferred: '2024-01-15',
      priority: 'urgent',
      status: 'pending',
      familySize: 4,
      childrenAges: [6, 8, 12],
      senNeeds: ['Autism', 'ADHD', 'Sensory Processing'],
      dietaryReqs: ['Gluten-Free', 'Dairy-Free'],
      lastContact: '2 days ago',
      nextAction: 'Initial assessment call',
      notes: 'Mother reports significant food anxiety in 6-year-old. Texture sensitivity extreme. Family struggling with suitable foods after recent diagnosis.',
      urgencyReason: 'Child not eating, weight loss concern'
    },
    {
      id: 'REF-002', 
      familyCode: 'FAM-2024-091',
      referredBy: 'Health Visitor',
      contactName: 'Dr. James Mitchell',
      contactEmail: 'j.mitchell@healthtrust.nhs.uk',
      dateReferred: '2024-01-12',
      priority: 'high',
      status: 'active',
      familySize: 3,
      childrenAges: [4, 7],
      senNeeds: ['Down Syndrome', 'Swallowing Difficulties'],
      dietaryReqs: ['Soft Foods', 'No Nuts'],
      lastContact: '1 week ago',
      nextAction: 'Weekly food parcel delivery',
      notes: 'Established support plan. Regular deliveries working well. Mother very grateful.',
      packages: ['Weekly SEN-Safe Essentials', 'Soft Foods Pack', 'Child Nutrition Supplements']
    },
    {
      id: 'REF-003',
      familyCode: 'FAM-2024-087',
      referredBy: 'Social Services',
      contactName: 'Lisa Thompson',
      contactEmail: 'l.thompson@socialservices.gov.uk',
      dateReferred: '2024-01-10',
      priority: 'urgent',
      status: 'urgent',
      familySize: 5,
      childrenAges: [3, 5, 9, 11],
      senNeeds: ['Multiple Learning Disabilities', 'Severe Autism'],
      dietaryReqs: ['Limited Safe Foods List', 'Texture-Specific'],
      lastContact: '1 day ago',
      nextAction: 'Emergency food delivery today',
      notes: 'Crisis situation. Multiple children with severe food limitations. Only 8 foods accepted across all children.',
      urgencyReason: 'Benefits delayed, no food in house, children refusing alternative foods',
      safefoods: ['White bread (specific brand)', 'Plain pasta shapes', 'Chicken nuggets (frozen)', 'Banana', 'Plain rice cakes', 'UHT milk', 'Apple juice', 'Plain digestive biscuits']
    },
    {
      id: 'REF-004',
      familyCode: 'FAM-2024-093',
      referredBy: 'GP Practice',
      contactName: 'Dr. Amanda Foster',
      contactEmail: 'a.foster@medicalpractice.nhs.uk',
      dateReferred: '2024-01-08',
      priority: 'medium',
      status: 'active',
      familySize: 2,
      childrenAges: [14],
      senNeeds: ['Eating Disorder (ARFID)', 'Anxiety'],
      dietaryReqs: ['Very Limited Foods', 'No Food Mixing'],
      lastContact: '3 days ago',
      nextAction: 'Fortnightly check-in call',
      notes: 'Teenager with ARFID. Progress slow but steady. Mother reports small improvements in food acceptance.',
      packages: ['ARFID-Safe Selection', 'Individual Portions Pack']
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredReferrals = referrals.filter(referral => {
    const matchesStatus = selectedStatus === 'all' || referral.status === selectedStatus;
    const matchesSearch = 
      referral.familyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referredBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      {/* Referral Overview Header */}
      <div className="luna-card luna-card--primary mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Referral Management</h1>
            <button className="luna-button luna-button--gradient">
              New Referral
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-600">8</p>
              <p className="text-sm text-gray-600">Urgent Cases</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">12</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">23</p>
              <p className="text-sm text-gray-600">Active Support</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-luna-pink">47</p>
              <p className="text-sm text-gray-600">Total Referrals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter and Search */}
      <div className="luna-card-grid luna-card-grid--2-col mb-8">
        {/* Status Filter */}
        <div className="luna-card">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Filter by Status</h2>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedStatus(option.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedStatus === option.id 
                      ? 'bg-luna-pink-50 border border-luna-pink'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.name}</span>
                    <span className="text-sm text-gray-600">
                      {option.count}
                    </span>
                  </div>
                  {option.color && option.id !== 'all' && (
                    <div className={`w-3 h-3 rounded-full bg-${option.color}-500 mt-1`} />
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
              <label className="luna-form-label">Search Referrals</label>
              <input
                type="text"
                className="luna-form-input"
                placeholder="Family code, referrer, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button className="luna-button luna-button--primary w-full">
                Generate Referral Report
              </button>
              <button className="luna-button luna-button--secondary w-full">
                Email All Referrers
              </button>
              <button className="luna-button luna-button--outline w-full">
                Export to CSV
              </button>
              <button className="luna-button luna-button--outline w-full">
                Print Summary
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="luna-card">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">
            Referrals List
            {selectedStatus !== 'all' && (
              <span className="text-sm text-gray-600 font-normal ml-2">
                - {statusOptions.find(s => s.id === selectedStatus)?.name}
              </span>
            )}
          </h2>

          <div className="space-y-6">
            {filteredReferrals.map((referral) => (
              <div key={referral.id} className="border rounded-lg p-6 hover:bg-gray-50">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{referral.familyCode}</h3>
                    <p className="text-sm text-gray-600">
                      Referred by {referral.referredBy} • {referral.dateReferred}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(referral.priority)}`}>
                      {referral.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-lg ${getStatusColor(referral.status)}`}>
                      {referral.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Family Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Family Size</p>
                    <p className="font-medium">{referral.familySize} people</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Children Ages</p>
                    <p className="font-medium">{referral.childrenAges.join(', ')} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Contact</p>
                    <p className="font-medium">{referral.lastContact}</p>
                  </div>
                </div>

                {/* SEN Needs & Dietary Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">SEN Needs</p>
                    <div className="flex flex-wrap gap-1">
                      {referral.senNeeds.map((need, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Dietary Requirements</p>
                    <div className="flex flex-wrap gap-1">
                      {referral.dietaryReqs.map((req, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Special Info for Urgent Cases */}
                {referral.urgencyReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">
                      <strong>Urgency Reason:</strong> {referral.urgencyReason}
                    </p>
                  </div>
                )}

                {/* Safe Foods List for Complex Cases */}
                {referral.safefoods && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-700 font-medium mb-2">SAFE FOODS LIST:</p>
                    <div className="flex flex-wrap gap-1">
                      {referral.safefoods.map((food, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded">
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Packages */}
                {referral.packages && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-green-700 font-medium mb-2">ACTIVE PACKAGES:</p>
                    <div className="space-y-1">
                      {referral.packages.map((pkg, index) => (
                        <span key={index} className="inline-block px-2 py-1 text-xs bg-green-200 text-green-800 rounded mr-2">
                          {pkg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">{referral.notes}</p>
                </div>

                {/* Contact & Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p><strong>Contact:</strong> {referral.contactName}</p>
                    <p className="text-gray-600">{referral.contactEmail}</p>
                    <p className="text-luna-pink font-medium">Next: {referral.nextAction}</p>
                  </div>
                  <div className="space-x-2">
                    <button className="luna-button luna-button--sm luna-button--outline">
                      Contact
                    </button>
                    <button className="luna-button luna-button--sm luna-button--secondary">
                      Update
                    </button>
                    <button className="luna-button luna-button--sm luna-button--primary">
                      View Full Case
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredReferrals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No referrals found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReferralManagement;