import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LiveScrapingContent() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [proxyProvider, setProxyProvider] = useState('Bright Data');
  const [throttleMs, setThrottleMs] = useState('500');
  const timerRef = useRef(null);

  const sources = [
    { id: 'gmaps', label: 'Google Maps' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'yellow', label: 'Yellow Pages' },
    { id: 'web', label: 'Websites' }
  ];

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 100));
      setFoundCount(prev => prev + Math.floor(Math.random() * 5));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (progress >= 100 && isRunning) {
      setIsRunning(false);
    }
  }, [progress, isRunning]);

  const start = () => {
    setProgress(0);
    setFoundCount(0);
    setIsRunning(true);
  };

  const stop = () => setIsRunning(false);

  const handleNavigateToCleaning = () => {
    navigate('/cleaning-verify');
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1">Live Scraping</h1>
          <p className="text-[var(--text-muted)] text-sm lg:text-base">Proxy rotation, CAPTCHA handling, per-source scraping stats</p>
        </div>
        <div className="px-3 py-2 rounded-md border border-[var(--border-input)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm shadow-sm">Engine: Scrapy + Playwright</div>
      </div>

      {/* Two main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Job */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-5 lg:p-6 shadow-lg/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-[var(--text-muted)]">Job</h2>
            <div className="text-lg text-[var(--text-muted)]">Status: {isRunning ? 'Running' : 'Idle'}</div>
          </div>
          <div className="text-[#58A6FF] text-lg mb-4">{isRunning ? 'Scraping in progress…' : '⚡ No active job running.'}</div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2 text-lg text-[var(--text-muted)]">
              <span>Progress</span>
              <span>Found <span className="text-[var(--text-muted)] font-semibold">{foundCount}</span></span>
            </div>
            <div className="w-full h-2.5 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-full overflow-hidden">
              <div className="h-full bg-[#ffff] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Table */}
          <div className="border-b border-[var(--border-input)]  overflow-hidden mb-5">
            <div className="grid grid-cols-3 text-xl text-[var(--text-muted)] bg-[var(--bg-input)]/70 px-4 py-2.5">
              <div>Source</div>
              <div>Status</div>
              <div className="text-right pr-2">Scraped</div>
            </div>
            {sources.map((s) => (
              <div key={s.id} className="grid grid-cols-3 items-center px-4 py-2.5 text-sm border-t border-[var(--border-input)]">
                <div className="text-[var(--text-primary)]">{s.label}</div>
                <div className="text-[var(--text-secondary)]">{isRunning ? 'Running' : 'Queued'}</div>
                <div className="text-[var(--text-secondary)] text-right pr-2">{isRunning ? Math.floor(progress / 10) : 0}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <button 
                onClick={start} 
                disabled={isRunning} 
                className={`flex-1 px-4 py-3 sm:py-2 rounded-lg text-white text-sm font-medium shadow transition-all duration-200 ${isRunning ? 'bg-gray-600/60 cursor-not-allowed' : 'bg-[var(--accent-primary)] hover:opacity-90 active:scale-95'}`} 
                style={{ background: 'var(--btn-gradient)' }}
              >
                Start Scrape
              </button>
              <button 
                onClick={stop} 
                disabled={!isRunning} 
                className={`flex-1 px-4 py-3 sm:py-2 rounded-lg text-white text-sm font-medium shadow transition-all duration-200 ${!isRunning ? 'bg-gray-600/60 cursor-not-allowed' : 'bg-red-500 hover:opacity-90 active:scale-95'}`}
              >
                Stop
              </button>
            </div>
            <button 
              onClick={handleNavigateToCleaning}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg text-white text-sm font-medium bg-green-600 hover:opacity-90 active:scale-95 shadow transition-all duration-200"
            >
              Next: Clean & verify
            </button>
          </div>
        </div>

        {/* Right: Network & Hygiene */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-5 lg:p-6 shadow-lg/20">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Network & Hygiene</h2>
          <p className="text-[var(--text-muted)] text-lg mb-4">Proxy pools, CAPTCHA handling, request throttling</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Proxy Provider</label>
              <select value={proxyProvider} onChange={(e) => setProxyProvider(e.target.value)} className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]">
                <option>Bright Data</option>
                <option>Oxylabs</option>
                <option>Smartproxy</option>
                <option>ScraperAPI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Throttle (ms)</label>
              <input value={throttleMs} onChange={(e) => setThrottleMs(e.target.value)} className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button className="flex-1 px-4 py-3 sm:py-2 rounded-lg text-[var(--text-primary)] text-sm font-medium bg-[var(--bg-secondary)] border border-[var(--border-input)] hover:bg-[var(--bg-primary)] transition-all duration-200 active:scale-95">
              Rotate Proxy
            </button>
            <button className="flex-1 px-4 py-3 sm:py-2 rounded-lg text-[var(--text-primary)] text-sm font-medium bg-[var(--bg-secondary)] border border-[var(--border-input)] hover:bg-[var(--bg-primary)] transition-all duration-200 active:scale-95">
              CAPTCHA Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


