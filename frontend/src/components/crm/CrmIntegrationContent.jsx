import { useState } from 'react';

export default function CrmIntegrationContent() {
  const [selectedList, setSelectedList] = useState('Dentist - NYC');

  const lists = [
    'Dentist - NYC',
    'Law Firms - Florida',
    'Restaurants - Texas',
    'IT Services - California'
  ];

  return (
    <div className="flex-1 p-4 lg:p-6">
      {/* Main Container */}
      <div className="space-y-8">
        
        {/* CRM Integrations Section */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1">
                CRM Integrations
              </h1>
              <p className="text-[var(--text-muted)] text-sm lg:text-base">
                HubSpot · Zoho · Salesforce
              </p>
            </div>
            <button className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] transition-colors duration-300 text-sm font-medium self-start sm:self-auto">
              Connect
            </button>
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            {/* HubSpot Card */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    HubSpot
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mb-6">
                    One-click sync to Contacts/Companies
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 px-4 py-3 sm:py-2 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-200 text-sm" style={{ background: 'var(--btn-gradient)' }}>
                    Connect HubSpot
                  </button>
                  <button className="flex-1 px-4 py-3 sm:py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-input)] transition-all duration-200 text-sm font-medium">
                    Map Fields
                  </button>
                </div>
              </div>
            </div>

            {/* Salesforce & Zoho Card */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    Salesforce & Zoho
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mb-6">
                    Bulk upsets, retries, field maps
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 px-4 py-3 sm:py-2 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-200 text-sm" style={{ background: 'var(--btn-gradient)' }}>
                    Connect Salesforce
                  </button>
                  <button className="flex-1 px-4 py-3 sm:py-2 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-200 text-sm" style={{ background: 'var(--btn-gradient)' }}>
                    Connect Zoho
                  </button>
                </div>
              </div>
            </div>
          </div>
         {/* Export a List Section */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
                Export a List
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <select 
                value={selectedList} 
                onChange={(e) => setSelectedList(e.target.value)}
                className="flex-1 sm:w-64 px-4 py-3 sm:py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-sm"
              >
                {lists.map((list) => (
                  <option key={list} value={list}>
                    {list}
                  </option>
                ))}
              </select>
              <button className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-200 text-sm" style={{ background: 'var(--btn-gradient)' }}>
                Export Now
              </button>
            </div>
          </div>
        </div>
        </div>

        
      </div>
    </div>
  );
}
