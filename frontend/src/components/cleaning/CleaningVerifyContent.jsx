import { useState } from 'react';

export default function CleaningVerifyContent() {
  const [provider, setProvider] = useState('SMTP +DNS');
  const [retries, setRetries] = useState('2');

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1">Cleaning & Email Verification</h1>
          <p className="text-[var(--text-muted)] text-sm lg:text-base">Normalize, deduplicate and run multi-step email checks (DNS/MX/SMTP + 3rd-party)</p>
        </div>
        <div className="px-3 py-2 rounded-md border border-[var(--border-input)] bg-[var(--bg-primary)] text-[var(--text-muted)] text-sm shadow-sm self-start sm:self-auto">
          Providers: Hunter · NeverBounce
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Pipeline counts */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-5 lg:p-6 w-full">
          <h2 className="text-[var(--text-muted)] text-lg font-semibold mb-4">Pipeline counts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Raw', value: 1248 },
              { label: 'After Clean', value: 1190 },
              { label: 'Verified', value: 1132 },
              { label: 'Failed', value: 58 }
            ].map((m) => (
              <div key={m.label} className="text-center ">
                <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{m.value}</div>
                <div className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <button className="flex-1 px-4 py-3 sm:py-2 rounded-lg text-white text-sm font-medium shadow transition-all duration-200 bg-[var(--accent-primary)] hover:opacity-90 active:scale-95" style={{ background: 'var(--btn-gradient)' }}>
                Run Cleaning
              </button>
              <button className="flex-1 px-4 py-3 sm:py-2 rounded-lg text-white text-sm font-medium shadow transition-all duration-200 bg-green-600 hover:opacity-90 active:scale-95">
                Run Verification
              </button>
            </div>
            <button className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg text-[var(--text-primary)] text-sm font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-input)] border border-[var(--border-input)] transition-all duration-200 active:scale-95">
              View Result
            </button>
          </div>
        </div>

        {/* Right: Verification settings */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-5 lg:p-6 w-full">
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mb-4">Verification settings</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full px-3 py-3 sm:py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-sm">
                <option>SMTP +DNS</option>
                <option>NeverBounce</option>
                <option>Hunter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Retries</label>
              <input value={retries} onChange={(e) => setRetries(e.target.value)} className="w-full px-3 py-3 sm:py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-sm" />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button className="flex-1 px-4 py-3 sm:py-2 rounded-lg text-[var(--text-primary)] text-sm font-medium bg-[var(--bg-secondary)] border border-[var(--border-input)] hover:bg-[var(--bg-input)] transition-all duration-200 active:scale-95">
                Apply Suppression List
              </button>
              <button className="flex-1 px-4 py-3 sm:py-2 rounded-lg text-[var(--text-primary)] text-sm font-medium bg-[var(--bg-secondary)] border border-[var(--border-input)] hover:bg-[var(--bg-input)] transition-all duration-200 active:scale-95">
                Apply Opt-out Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


