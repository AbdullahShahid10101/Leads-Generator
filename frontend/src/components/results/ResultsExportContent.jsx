import { useState } from 'react';

export default function ResultsExportContent() {
  const [selectedLeads, setSelectedLeads] = useState([1, 2, 3]); // Pre-select first 3 as shown in image
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState('None');

  // Mock data matching the image exactly
  const mockLeads = [
    {
      id: 1,
      company: 'Bright Dental',
      contact: 'Dr. Alice Carter',
      role: 'Owner',
      email: 'contact@brightdental.com',
      location: 'Irvine, CA',
      status: 'Verified'
    },
    {
      id: 2,
      company: 'Glow Salon',
      contact: 'Sarah Lee',
      role: 'Manager',
      email: 'sarah@glowsalon.com',
      location: 'Chicago, IL',
      status: 'Verified'
    },
    {
      id: 3,
      company: 'Urban Bites',
      contact: 'David Kim',
      role: 'Owner',
      email: 'contact@urbanbites.com',
      location: 'Seattle, WA',
      status: 'Failed'
    },
    {
      id: 4,
      company: 'Spark Tutors',
      contact: 'Olivia Adams',
      role: 'Coordinator',
      email: 'olivia@sparktutores.com',
      location: 'Boston, MA',
      status: 'Verified'
    },
    {
      id: 5,
      company: 'NYC Smiles',
      contact: 'Dr. Noah Greens',
      role: 'Owner',
      email: 'contact@nycsmiles.com',
      location: 'Manhattan, NY',
      status: 'Verified'
    },
    {
      id: 6,
      company: 'FitZone Gym',
      contact: 'Mark Johnson',
      role: 'Manager',
      email: 'contact@fitzonegym.com',
      location: 'New York, NY',
      status: 'Verified'
    },
    {
      id: 7,
      company: 'Elite Cars',
      contact: 'Michael Brown',
      role: 'Manager',
      email: 'contact@elitecars.com',
      location: 'Phoenix, AZ',
      status: 'Failed'
    },
    {
      id: 8,
      company: 'Swift Travel',
      contact: 'Emily James',
      role: 'Partner',
      email: 'emily@swifftravel.com',
      location: 'Chicago, IL',
      status: 'Verified'
    }
  ];

  const handleSelectLead = (leadId) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === mockLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(mockLeads.map(lead => lead.id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return 'text-green-500';
      case 'Failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredLeads = mockLeads.filter(lead =>
    lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 lg:p-6">
      {/* Main Container */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
        {/* Heading Area Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Left Side: Heading and Subheading */}
          <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">
              Results & Export
            </h1>
            <p className="text-[var(--text-muted)] text-xs lg:text-sm">
              Download: CSV • Excel • JSON • Push to CRM or API
            </p>
          </div>
          
          {/* Right Side: Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 lg:justify-end lg:items-center">
            <button className="text-base px-4 py-2 bg-[var(--accent-primary)] text-[var(--text-secondary)] rounded-lg  hover:bg-[var(--accent-primary)] transition-colors duration-300"style={{ background: 'var(--btn-gradient)' }}>
              Save List
            </button>
            <button className="text-base px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-secondary)] rounded-lg  hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors duration-300">
              Download
            </button>
            <button className="text-base px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors duration-300">
              Export to CRM
            </button>
          </div>
        </div>

        {/* Combined Container: Search, Table, and Actions */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl shadow-lg overflow-hidden">
                    {/* Search and Bulk Actions */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search company, contact, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>
              <div className="lg:w-48">
                <label className="block text-base font-medium text-[var(--text-muted)] ml-1 mb-2">
                  Bulk action
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  <option value="None">None</option>
                  <option value="Export">Export Selected</option>
                  <option value="Delete">Delete Selected</option>
                  <option value="MarkVerified">Mark as Verified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-b border-[var(--border-input)] mx-6">
              <thead>
                <tr className="border-b border-[var(--border-input)]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === mockLeads.length}
                      onChange={handleSelectAll}
                      className="rounded border-[var(--border-input)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[var(--border-input)] hover:bg-[var(--bg-input)] transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="rounded border-[var(--border-input)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--text-primary)]">{lead.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-secondary)]">{lead.contact}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-secondary)]">{lead.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-secondary)]">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-secondary)]">{lead.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Section */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="text-[var(--text-muted)] text-base">
                Selected: {selectedLeads.length}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  disabled={selectedLeads.length === 0}
                  className="px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-base hover:bg-[var(--accent-secondary)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--btn-gradient)' }}
                >
                  Buy Selected (Pay-per-Lead)
                </button>
                <button 
                  disabled={selectedLeads.length === 0}
                  className="px-6 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-lg text-base hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
