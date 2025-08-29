import React from 'react';

export default function ComplianceContent() {
  const handleOpenOptOut = () => {
    // Handle opt-out portal logic
    console.log('Opening opt-out portal...');
  };

  return (
    <div className="flex-1 p-4 lg:p-6 border border-[var(--border-input)] rounded-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1">
          Compliance & Risk
        </h1>
        <p className="text-[var(--text-muted)] text-sm lg:text-base">
          Public data only • GDPR & CAN-SPAM aligned
        </p>
      </div>

      {/* Main Content - Two Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Privacy Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-4">
            Privacy
          </h2>
          <p className="text-[var(--text-muted)] text-sm lg:text-base mb-6">
            Clear privacy policy, opt-out portal, and data handling procedures.
          </p>
          <button
            onClick={handleOpenOptOut}
            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-lg font-semibold hover:bg-[var(--bg-input)] transition-all duration-200 text-sm"
          >
            Open Opt-out
          </button>
        </div>

        {/* Network Safety Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-4">
            Network safety
          </h2>
          <p className="text-[var(--text-muted)] text-sm lg:text-base">
            IP rotation, throttling, CAPTCHA handling, and responsible scraping limits.
          </p>
        </div>
      </div>
    </div>
  );
}
