import { useState } from 'react';

export default function CleaningVerifyContent() {
  const [provider, setProvider] = useState('SMTP +DNS');
  const [retries, setRetries] = useState('2');

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1">Cleaning & Email Verification</h1>
          <p className="text-[var(--text-muted)] text-sm lg:text-base">Normalize, deduplicate and run multi-step email checks (DNS/MX/SMTP + 3rd-party)</p>
        </div>
        <div className="px-3 py-2 rounded-md border border-[var(--border-input)] bg-[var(--bg-primary)] text-[var(--text-muted)] text-sm shadow-sm">Providers: Hunter · NeverBounce</div>
      </div>

      <div className="flex flex-cols lg:flex-row gap-6">
        {/* Left: Pipeline counts */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-5 lg:p-6 h-64 w-full ">
          <h2 className="text-[var(--text-muted)] text-lg font-semibold mb-4">Pipeline counts</h2>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Raw', value: 1248 },
              { label: 'After Clean', value: 1190 },
              { label: 'Verified', value: 1132 },
              { label: 'Failed', value: 58 }
            ].map((m) => (
              <div key={m.label} className=" p-2 ">
                <div className="text-2xl font-bold text-[var(--text-primary)]">{m.value}</div>
                <div className="text-xs text-[var(--text-muted)]">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-10">
            <button className="px-4 py-2 rounded-lg text-white text-sm shadow bg-[var(--accent-primary)]" style={{ background: 'var(--btn-gradient)' }}>Run Cleaning</button>
            <button className="px-4 py-2 rounded-lg text-white text-sm shadow bg-green-600">Run Verification</button>
            <button className="px-4 py-2 rounded-lg text-[var(--text-primary)] text-sm bg-[var(--bg-secondary)] hover:bg-[var(--bg-input)] border border-[var(--border-input)]">View Result</button>
          </div>
        </div>

        {/* Right: Verification settings */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-5 lg:p-6 w-full">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Verification settings</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]">
                <option>SMTP +DNS</option>
                <option>NeverBounce</option>
                <option>Hunter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Retries</label>
              <input value={retries} onChange={(e) => setRetries(e.target.value)} className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]" />
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg text-[var(--text-primary)] text-sm bg-[var(--bg-secondary)] border border-[var(--border-input)] hover:bg-[var(--bg-input)]">Apply Suppression List</button>
              <button className="px-4 py-2 rounded-lg text-[var(--text-primary)] text-sm bg-[var(--bg-secondary)] border border-[var(--border-input)] hover:bg-[var(--bg-input)]">Apply Opt-out Filter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


