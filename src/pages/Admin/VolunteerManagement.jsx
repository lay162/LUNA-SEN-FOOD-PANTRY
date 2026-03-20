import React, { useState } from 'react';

const VolunteerManagement = () => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const roleOptions = [
    { id: 'all', name: 'All Volunteers', count: 34 },
    { id: 'delivery', name: 'Delivery Drivers', count: 12, priority: 'high' },
    { id: 'packer', name: 'Food Packers', count: 8, priority: 'high' },
    { id: 'admin', name: 'Admin Support', count: 6, priority: 'medium' },
    { id: 'fundraiser', name: 'Fundraisers', count: 5, priority: 'medium' },
    { id: 'specialist', name: 'SEN Specialists', count: 3, priority: 'high' }
  ];

  const volunteers = [
    {
      id: 'VOL-001',
      name: 'Emma Thompson',
      email: 'emma.thompson@email.com',
      phone: '07123 456 789',
      role: 'delivery',
      status: 'active',
      joinDate: '2023-08-15',
      lastActive: '2 days ago',
      hoursThisMonth: 24,
      totalHours: 186,
      availability: ['Monday AM', 'Wednesday PM', 'Saturday'],
      skills: ['Driving License', 'Local Area Knowledge', 'SEN Experience'],
      backgroundCheck: 'valid',
      training: ['Food Safety', 'Safeguarding', 'SEN Awareness'],
      notes: 'Excellent volunteer. Very reliable and understands SEN family needs. Has child with autism herself.',
      emergencyContact: 'Partner - 07987 654 321',
      address: 'Local Area',
      nextShift: 'Tomorrow 10:00 AM - Delivery Round 3'
    },
    {
      id: 'VOL-002',
      name: 'Michael Chen',
      email: 'm.chen@email.com',
      phone: '07234 567 890',
      role: 'packer',
      status: 'active',
      joinDate: '2023-11-02',
      lastActive: '1 day ago',
      hoursThisMonth: 16,
      totalHours: 94,
      availability: ['Tuesday PM', 'Thursday PM', 'Sunday AM'],
      skills: ['Food Handling', 'Organization', 'Dietary Restrictions Knowledge'],
      backgroundCheck: 'valid',
      training: ['Food Safety', 'Allergen Awareness', 'ARFID Training'],
      notes: 'Meticulous attention to detail with food packaging. Great for SEN-safe food preparation.',
      emergencyContact: 'Wife - 07876 543 210',
      address: 'Local Area',
      nextShift: 'Thursday 2:00 PM - SEN-Safe Food Prep'
    },
    {
      id: 'VOL-003',
      name: 'Dr. Sarah Williams',
      email: 'dr.williams@email.com',
      phone: '07345 678 901',
      role: 'specialist',
      status: 'active',
      joinDate: '2023-06-20',
      lastActive: '3 days ago',
      hoursThisMonth: 8,
      totalHours: 72,
      availability: ['Saturday Morning', 'Available for urgent consultations'],
      skills: ['Pediatric Dietitian', 'SEN Specialist', 'ARFID Expert'],
      backgroundCheck: 'valid',
      training: ['Professional Qualifications', 'Safeguarding', 'Crisis Intervention'],
      notes: 'Qualified pediatric dietitian. Provides professional guidance on complex SEN dietary needs. Invaluable for difficult cases.',
      emergencyContact: 'Hospital - 01234 567 890',
      address: 'Local Area',
      nextShift: 'Saturday 9:00 AM - SEN Assessment Clinic'
    },
    {
      id: 'VOL-004',
      name: 'James Rodriguez',
      email: 'james.rodriguez@email.com',
      phone: '07456 789 012',
      role: 'delivery',
      status: 'on-leave',
      joinDate: '2023-09-10',
      lastActive: '2 weeks ago',
      hoursThisMonth: 0,
      totalHours: 142,
      availability: ['Temporarily unavailable'],
      skills: ['Driving License', 'Customer Service', 'Patience with Children'],
      backgroundCheck: 'valid',
      training: ['Food Safety', 'Safeguarding', 'SEN Awareness'],
      notes: 'On paternity leave until end of month. Excellent delivery volunteer, very popular with families.',
      emergencyContact: 'Partner - 07765 432 109',
      address: 'Local Area',
      nextShift: 'Expected return: End of January'
    },
    {
      id: 'VOL-005',
      name: 'Lisa Park',
      email: 'lisa.park@email.com',
      phone: '07567 890 123',
      role: 'admin',
      status: 'active',
      joinDate: '2023-07-03',
      lastActive: '1 day ago',
      hoursThisMonth: 20,
      totalHours: 156,
      availability: ['Monday-Friday 9-3 (flexible)'],
      skills: ['Database Management', 'Phone Support', 'Data Entry'],
      backgroundCheck: 'valid',
      training: ['Data Protection', 'Safeguarding', 'Customer Service'],
      notes: 'Handles phone inquiries and database updates. Excellent with worried parents and referral coordination.',
      emergencyContact: 'Sister - 07654 321 098',
      address: 'Local Area',
      nextShift: 'Tomorrow 9:00 AM - Office Support'
    },
    {
      id: 'VOL-006',
      name: 'David Thompson',
      email: 'd.thompson@email.com',
      phone: '07678 901 234',
      role: 'fundraiser',
      status: 'inactive',
      joinDate: '2023-04-15',
      lastActive: '1 month ago',
      hoursThisMonth: 0,
      totalHours: 89,
      availability: ['Currently unavailable'],
      skills: ['Event Planning', 'Social Media', 'Community Outreach'],
      backgroundCheck: 'expires-soon',
      training: ['Fundraising Basics', 'Social Media Training'],
      notes: 'Good fundraiser but inconsistent availability. Background check expires next month.',
      emergencyContact: 'Mother - 07543 210 987',
      address: 'Local Area',
      nextShift: 'No upcoming shifts scheduled'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBackgroundCheckColor = (status) => {
    switch (status) {
      case 'valid': return 'text-green-600';
      case 'expires-soon': return 'text-orange-600';
      case 'expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRolePriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-orange-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesRole = selectedRole === 'all' || volunteer.role === selectedRole;
    const matchesSearch = 
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <>
      {/* Volunteer Overview Header */}
      <div className="luna-card luna-card--primary mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Volunteer Management</h1>
            <button className="luna-button luna-button--gradient">
              Add New Volunteer
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">28</p>
              <p className="text-sm text-gray-600">Active Volunteers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-sm text-gray-600">On Leave</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">3</p>
              <p className="text-sm text-gray-600">Inactive</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-luna-pink">340</p>
              <p className="text-sm text-gray-600">Hours This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Filter and Search */}
      <div className="luna-card-grid luna-card-grid--2-col mb-8">
        {/* Role Filter */}
        <div className="luna-card">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Filter by Role</h2>
            <div className="space-y-2">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full text-left p-3 rounded-lg border-l-4 transition-all ${
                    selectedRole === role.id 
                      ? 'bg-luna-pink-50 border-l-luna-pink'
                      : `bg-gray-50 ${getRolePriorityColor(role.priority)} hover:bg-gray-100`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{role.name}</span>
                    <span className="text-sm text-gray-600">
                      {role.count}
                    </span>
                  </div>
                  {role.priority && role.id !== 'all' && (
                    <span className={`text-xs mt-1 inline-block ${
                      role.priority === 'high' ? 'text-red-600' :
                      role.priority === 'medium' ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                      {role.priority.toUpperCase()} NEED
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
              <label className="luna-form-label">Search Volunteers</label>
              <input
                type="text"
                className="luna-form-input"
                placeholder="Name, email, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button className="luna-button luna-button--primary w-full">
                Schedule Management
              </button>
              <button className="luna-button luna-button--secondary w-full">
                Send Group Message
              </button>
              <button className="luna-button luna-button--outline w-full">
                Training Calendar
              </button>
              <button className="luna-button luna-button--outline w-full">
                Volunteer Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteers List */}
      <div className="luna-card">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">
            Volunteers List
            {selectedRole !== 'all' && (
              <span className="text-sm text-gray-600 font-normal ml-2">
                - {roleOptions.find(r => r.id === selectedRole)?.name}
              </span>
            )}
          </h2>

          <div className="space-y-6">
            {filteredVolunteers.map((volunteer) => (
              <div key={volunteer.id} className="border rounded-lg p-6 hover:bg-gray-50">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{volunteer.name}</h3>
                    <p className="text-sm text-gray-600">
                      {volunteer.email} • {volunteer.phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      Volunteer since {volunteer.joinDate}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-luna-pink font-medium">
                      {volunteer.role.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(volunteer.status)}`}>
                      {volunteer.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Hours This Month</p>
                    <p className="font-bold text-lg">{volunteer.hoursThisMonth}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Hours</p>
                    <p className="font-bold text-lg">{volunteer.totalHours}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Active</p>
                    <p className="font-medium">{volunteer.lastActive}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Background Check</p>
                    <p className={`font-medium ${getBackgroundCheckColor(volunteer.backgroundCheck)}`}>
                      {volunteer.backgroundCheck.replace('-', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Availability</p>
                  <div className="flex flex-wrap gap-1">
                    {volunteer.availability.map((slot, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Skills & Qualifications</p>
                  <div className="flex flex-wrap gap-1">
                    {volunteer.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Training */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Completed Training</p>
                  <div className="flex flex-wrap gap-1">
                    {volunteer.training.map((course, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Next Shift */}
                {volunteer.nextShift && (
                  <div className="bg-luna-blue-50 border border-luna-blue rounded-lg p-3 mb-4">
                    <p className="text-sm">
                      <strong className="text-luna-pink">Next Shift:</strong> {volunteer.nextShift}
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">{volunteer.notes}</p>
                </div>

                {/* Emergency Contact */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500">Emergency Contact: {volunteer.emergencyContact}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    ID: {volunteer.id}
                  </div>
                  <div className="space-x-2">
                    <button className="luna-button luna-button--sm luna-button--outline">
                      Contact
                    </button>
                    <button className="luna-button luna-button--sm luna-button--secondary">
                      Schedule
                    </button>
                    <button className="luna-button luna-button--sm luna-button--primary">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVolunteers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No volunteers found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VolunteerManagement;