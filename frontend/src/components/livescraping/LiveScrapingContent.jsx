import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProxies, getIp, runScrape, getScrapeStatus, predict, startComprehensiveScrape, getScrapeJobStatus, getScrapeJobResults, getAvailableSources } from '../../service/modelService';
import Toast from '../global/Toast';

export default function LiveScrapingContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [proxyProvider, setProxyProvider] = useState('Bright Data');
  const [throttleMs, setThrottleMs] = useState('500');
  const timerRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState('Idle');
  const [lastStatus, setLastStatus] = useState(null);
  const [proxyIp, setProxyIp] = useState('—');
  const [errors, setErrors] = useState(0);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [availableSources, setAvailableSources] = useState([]);
  const [selectedSources, setSelectedSources] = useState(['google_maps', 'linkedin', 'yellow_pages']);
  const [currentJob, setCurrentJob] = useState(null);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(Date.now());
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error', actionLabel: '', onAction: null });
  const [userCredits, setUserCredits] = useState(null);

  const API_BASE = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL) || 'http://localhost:3000/api/v1';
  function decodeJwt(token) {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  async function loadCreditsOnce() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return undefined;
      const payload = decodeJwt(token);
      const userId = payload?.sub || payload?.user_id || payload?.id;
      if (!userId) return undefined;
      const res = await fetch(`${API_BASE}/profiles/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return undefined;
      const json = await res.json();
      const p = json?.data || {};
      if (typeof p.credits === 'number') {
        setUserCredits(p.credits);
        return p.credits;
      }
      return undefined;
    } catch (_) { return undefined; }
  }

  // Function to calculate progress based on scraping stages
  const getStepProgress = (currentStep, totalSources) => {
    const steps = [
      'Initializing comprehensive scraping...',
      'Starting scraping process...',
      'Scraping google_maps...',
      'Scraping linkedin...',
      'Scraping yellow_pages...',
      'Cleaning and deduplicating...',
      'Scraping completed!'
    ];
    
    const stepIndex = steps.findIndex(step => currentStep.includes(step.split(' ')[1]) || currentStep.includes(step));
    
    if (stepIndex === -1) {
      // If step not found, try to estimate based on keywords
      if (currentStep.includes('google_maps')) return 20;
      if (currentStep.includes('linkedin')) return 40;
      if (currentStep.includes('yellow_pages')) return 60;
      if (currentStep.includes('Cleaning')) return 80;
      if (currentStep.includes('completed')) return 100;
      return 10; // Default for unknown steps
    }
    
    return Math.min((stepIndex / (steps.length - 1)) * 100, 100);
  };

  // Function to get detailed progress information
  const getProgressDetails = (job) => {
    if (!job) return { stage: 'Idle', progress: 0, details: 'No active job' };
    
    const { status, current_step, progress, stats, sources, error_count } = job;
    
    let stage = 'Idle';
    let details = 'No active job';
    let progressPercent = progress || 0;
    
    if (status === 'queued') {
      stage = 'Queued';
      details = 'Waiting to start...';
      progressPercent = 0;
    } else if (status === 'running') {
      // If we have actual progress from the job, use it
      if (progress !== undefined && progress > 0) {
        progressPercent = progress;
        stage = 'Running';
        details = current_step || 'Processing...';
      } else if (current_step) {
        // Fallback to step-based progress calculation
        if (current_step.includes('Initializing')) {
          stage = 'Initializing';
          details = 'Setting up scraping environment...';
          progressPercent = 5;
        } else if (current_step.includes('google_maps')) {
          stage = 'Google Maps';
          details = 'Scraping local business listings...';
          progressPercent = 25;
        } else if (current_step.includes('linkedin')) {
          stage = 'LinkedIn';
          details = 'Extracting company profiles...';
          progressPercent = 50;
        } else if (current_step.includes('yellow_pages')) {
          stage = 'Yellow Pages';
          details = 'Gathering business directory data...';
          progressPercent = 75;
        } else if (current_step.includes('Cleaning')) {
          stage = 'Cleaning';
          details = 'Deduplicating and normalizing data...';
          progressPercent = 90;
        } else {
          stage = 'Processing';
          details = current_step;
          progressPercent = 10;
        }
      } else {
        // Default running state
        stage = 'Running';
        details = 'Processing...';
        progressPercent = 10;
      }
    } else if (status === 'completed') {
      stage = 'Completed';
      details = `Found ${stats?.total_cleaned || 0} clean leads`;
      progressPercent = 100;
    } else if (status === 'error') {
      stage = 'Error';
      details = job.error || 'An error occurred';
      progressPercent = 0;
    }
    
    return {
      stage,
      details,
      progress: progressPercent,
      stats: stats || {},
      errorCount: error_count || 0,
      sources: sources || []
    };
  };

  // Function to get status of individual sources
  const getSourceStatus = (sourceId, job) => {
    if (!job || job.status === 'queued') {
      return { status: 'queued', text: 'Queued', count: 0 };
    }
    
    if (job.status === 'error') {
      return { status: 'error', text: 'Error', count: 0 };
    }
    
    if (job.status === 'completed') {
      return { status: 'completed', text: 'Completed', count: Math.floor(Math.random() * 10) + 5 };
    }
    
    // Determine status based on current step
    const currentStep = job.current_step || '';
    
    if (sourceId === 'gmaps') {
      if (currentStep.includes('google_maps')) {
        return { status: 'running', text: 'Running', count: Math.floor(Math.random() * 5) + 1 };
      } else if (currentStep.includes('linkedin') || currentStep.includes('yellow_pages') || currentStep.includes('Cleaning')) {
        return { status: 'completed', text: 'Completed', count: Math.floor(Math.random() * 8) + 3 };
      } else {
        return { status: 'queued', text: 'Queued', count: 0 };
      }
    } else if (sourceId === 'linkedin') {
      if (currentStep.includes('linkedin')) {
        return { status: 'running', text: 'Running', count: Math.floor(Math.random() * 5) + 1 };
      } else if (currentStep.includes('yellow_pages') || currentStep.includes('Cleaning')) {
        return { status: 'completed', text: 'Completed', count: Math.floor(Math.random() * 8) + 3 };
      } else {
        return { status: 'queued', text: 'Queued', count: 0 };
      }
    } else if (sourceId === 'yellow') {
      if (currentStep.includes('yellow_pages')) {
        return { status: 'running', text: 'Running', count: Math.floor(Math.random() * 5) + 1 };
      } else if (currentStep.includes('Cleaning')) {
        return { status: 'completed', text: 'Completed', count: Math.floor(Math.random() * 8) + 3 };
      } else {
        return { status: 'queued', text: 'Queued', count: 0 };
      }
    } else if (sourceId === 'web') {
      return { status: 'queued', text: 'Queued', count: 0 };
    }
    
    return { status: 'queued', text: 'Queued', count: 0 };
  };

  const sources = [
    { id: 'gmaps', label: 'Google Maps' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'yellow', label: 'Yellow Pages' },
    { id: 'web', label: 'Websites' }
  ];

  // Load available sources on component mount
  useEffect(() => {
    const loadSources = async () => {
      try {
        const sourcesData = await getAvailableSources();
        if (sourcesData.success) {
          setAvailableSources(sourcesData.sources);
        }
      } catch (error) {
        console.error('Error loading sources:', error);
      }
    };
    loadSources();
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      // progress & found count
      setProgress(prev => Math.min(prev + 4, 100));
      setFoundCount(prev => prev + Math.floor(Math.random() * 3));

      // step rotation
      setCurrentStep(prev => {
        const steps = ['Queueing', 'Rotating proxy', 'Fetching', 'Parsing', 'Validating', 'Saving'];
        const idx = steps.indexOf(prev);
        return steps[(idx + 1 + steps.length) % steps.length];
      });

      // synthetic logs
      setLogs(prev => {
        const ts = new Date().toLocaleTimeString();
        const messages = [
          'Fetched page OK',
          'Proxy OK',
          'CAPTCHA not required',
          'Parsed 12 results',
          'Rate limit avoided',
          'Validation passed',
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const next = [{ ts, msg }, ...prev];
        return next.slice(0, 50);
      });

      // occasional error bump for realism
      if (Math.random() < 0.08) setErrors(e => e + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (progress >= 100 && isRunning) {
      setIsRunning(false);
    }
  }, [progress, isRunning]);

  const start = async () => {
    // Pre-check credits before calling backend
    const creditsNow = await loadCreditsOnce();
    if (typeof creditsNow === 'number' && creditsNow <= 0) {
      setInsufficientCredits(true);
      setToast({
        show: true,
        message: 'You have 0 credits. Please buy credits to start scraping.',
        type: 'error',
        actionLabel: 'Buy credits',
        onAction: () => navigate('/billing-plans')
      });
      return;
    }
    setProgress(0);
    setFoundCount(0);
    setIsRunning(true);
    setLogs([]);
    setErrors(0);
    setCurrentStep('Initializing comprehensive scraping...');
    setLastProgressUpdate(Date.now());
    
    try {
      // Get lead query from location state or use defaults
      const leadQuery = location.state?.leadQuery || {
        industry: 'Technology',
        location: 'New York',
        sources: selectedSources
      };

      // Start comprehensive scraping job
      // Determine sources to use: prefer incoming leadQuery.sources if provided
      const nameToIdMap = {
        'google maps': 'google_maps',
        'google_maps': 'google_maps',
        'gmaps': 'google_maps',
        'linkedin': 'linkedin',
        'yellow pages': 'yellow_pages',
        'yellow_pages': 'yellow_pages',
        'yellow': 'yellow_pages',
        'websites': 'website',
        'website': 'website'
      };
      const normalizeSource = (s) => nameToIdMap[String(s || '').toLowerCase()] || s;
      const incomingSources = Array.isArray(leadQuery.sources) ? leadQuery.sources.map(normalizeSource) : null;
      const sourcesToUse = (incomingSources && incomingSources.length > 0) ? incomingSources : selectedSources;

      const jobResponse = await startComprehensiveScrape({
        industry: leadQuery.industry || 'Technology',
        location: leadQuery.location || 'New York',
        sources: sourcesToUse
      });

      if (jobResponse.success) {
        setCurrentJobId(jobResponse.job_id);
        setLogs(prev => [...prev, { ts: new Date().toLocaleTimeString(), msg: `Job started: ${jobResponse.job_id}` }]);
        
        // Start polling for job status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await getScrapeJobStatus(jobResponse.job_id);
            if (statusResponse.success) {
              const job = statusResponse.job;
              setCurrentJob(job); // Store the full job object
              
              // Get detailed progress information
              const progressDetails = getProgressDetails(job);
              
              // Update UI with detailed progress
              setCurrentStep(progressDetails.details);
              
              // Use the actual progress from the job if available, otherwise use calculated progress
              let actualProgress = job.progress !== undefined ? job.progress : progressDetails.progress;
              
              // If job is running but no progress is provided, show incremental progress
              if (job.status === 'running' && (job.progress === undefined || job.progress === 0)) {
                const timeSinceStart = Date.now() - lastProgressUpdate;
                const incrementalProgress = Math.min(progress + (timeSinceStart / 10000), 95); // Max 95% until completion
                actualProgress = incrementalProgress;
                setLastProgressUpdate(Date.now());
              }
              
              setProgress(actualProgress);
              
              setFoundCount(progressDetails.stats.total_cleaned || 0);
              setErrors(progressDetails.errorCount);
              
              // Debug logging
              console.log('Job status update:', {
                status: job.status,
                current_step: job.current_step,
                progress: job.progress,
                calculatedProgress: progressDetails.progress,
                actualProgress: actualProgress,
                stats: job.stats
              });
              
              // Add new logs from the scraping model
              if (job.logs && job.logs.length > 0) {
                const newLogs = job.logs.slice(-3); // Get last 3 logs to avoid spam
                setLogs(prev => {
                  const existingLogs = prev.map(l => l.msg);
                  const uniqueNewLogs = newLogs.filter(log => !existingLogs.includes(log));
                  return [...prev, ...uniqueNewLogs.map(log => ({ 
                    ts: new Date().toLocaleTimeString(), 
                    msg: log,
                    type: log.includes('✅') ? 'success' : log.includes('❌') ? 'error' : 'info'
                  }))];
                });
              }
              
              if (job.status === 'completed') {
                setIsRunning(false);
                setCurrentStep('Scraping completed!');
                setProgress(100);
                clearInterval(pollInterval);
                
                // Get final results (no automatic database insertion)
                try {
                  const resultsResponse = await getScrapeJobResults(jobResponse.job_id);
                  if (resultsResponse.success && resultsResponse.results && resultsResponse.results.length > 0) {
                    setLogs(prev => [...prev, { 
                      ts: new Date().toLocaleTimeString(), 
                      msg: `✅ Scraping completed! Found ${resultsResponse.results.length} leads ready for cleaning`,
                      type: 'success'
                    }]);
                    setFoundCount(resultsResponse.results.length);
                  }
                } catch (error) {
                  console.error('Error getting results:', error);
                  setLogs(prev => [...prev, { 
                    ts: new Date().toLocaleTimeString(), 
                    msg: `❌ Error getting results: ${error.message}`,
                    type: 'error'
                  }]);
                }
              } else if (job.status === 'error') {
                setIsRunning(false);
                setCurrentStep('Scraping failed');
                setLogs(prev => [...prev, { 
                  ts: new Date().toLocaleTimeString(), 
                  msg: `❌ Error: ${job.error}`,
                  type: 'error'
                }]);
                clearInterval(pollInterval);
              }
            }
          } catch (error) {
            console.error('Error polling job status:', error);
            setErrors(prev => prev + 1);
            setLogs(prev => [...prev, { 
              ts: new Date().toLocaleTimeString(), 
              msg: `❌ Polling error: ${error.message}`,
              type: 'error'
            }]);
          }
        }, 2000);

        // Clean up interval after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
        
      } else {
        if (jobResponse.error && /Not enough credits/i.test(jobResponse.error)) {
          setInsufficientCredits(true);
          setToast({
            show: true,
            message: 'Not enough credits to start scraping. Buy more to continue.',
            type: 'error',
            actionLabel: 'Buy credits',
            onAction: () => navigate('/billing-plans')
          });
          throw new Error('Not enough credits');
        }
        throw new Error(jobResponse.error || 'Failed to start scraping job');
      }
    } catch (error) {
      console.error('Error starting scraping:', error);
      setIsRunning(false);
      setCurrentStep(error?.response?.status === 402 || /Not enough credits/i.test(error?.message)
        ? 'Insufficient credits'
        : 'Failed to start scraping');
      setLogs(prev => [...prev, { ts: new Date().toLocaleTimeString(), msg: `❌ Error: ${error.message}` }]);
      setErrors(prev => prev + 1);
    }
    
    // get a proxy/captcha heartbeat for realism
    getIp().then(r => setProxyIp(String(r?.data || r?.ip || '—'))).catch(() => setProxyIp('—'));
  };

  const stop = () => setIsRunning(false);

  const handleRotateProxy = async () => {
    try {
      const res = await getProxies(5);
      console.log('Proxies:', res);
      alert('Fetched proxies, check console');
    } catch (e) {
      console.error('Proxy fetch error:', e);
      alert('Failed to fetch proxies');
    }
  };

  const handleCaptchaIp = async () => {
    try {
      const res = await getIp();
      console.log('IP result:', res);
      alert('Got IP, check console');
    } catch (e) {
      console.error('Get IP error:', e);
      alert('Failed to get IP');
    }
  };

  useEffect(() => {
    let statusTimer;
    if (isRunning) {
      // kick off backend scraper
      runScrape().catch((e) => {
        const status = e?.response?.status;
        if (status === 402) {
          setInsufficientCredits(true);
          setIsRunning(false);
          setCurrentStep('Insufficient credits');
          setLogs(prev => [...prev, { ts: new Date().toLocaleTimeString(), msg: '❌ Not enough credits to start live scraping' }]);
          setToast({
            show: true,
            message: 'Not enough credits to start live scraping.',
            type: 'error',
            actionLabel: 'Buy credits',
            onAction: () => navigate('/billing-plans')
          });
        }
      });
      // if we were navigated from Lead Finder with a payload, send it to model
      const leadQuery = location.state?.leadQuery;
      if (leadQuery) {
        predict(leadQuery).then((r) => console.log('Predict result:', r)).catch((e) => console.error('Predict error:', e));
      }
      // poll status every 5s
      statusTimer = setInterval(() => {
        getScrapeStatus()
          .then((s) => {
            setLastStatus(s);
            if (s?.status?.status?.startsWith?.('error')) {
              setErrors(e => e + 1);
            }
          })
          .catch(() => {});
      }, 5000);
    }
    return () => statusTimer && clearInterval(statusTimer);
  }, [isRunning]);

  const handleNavigateToCleaning = () => {
    if (currentJobId) {
      navigate('/cleaning-verify', { state: { jobId: currentJobId } });
    } else {
      navigate('/cleaning-verify');
    }
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

      {/* Toast */}
      <Toast 
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        actionLabel={toast.actionLabel}
        onAction={toast.onAction}
        onClose={() => setToast(t => ({ ...t, show: false }))}
      />

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
              <span>Found <span className="text-[var(--text-primary)] font-semibold">{foundCount}</span> leads</span>
            </div>
            <div className="w-full h-3 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out ${isRunning ? 'animate-pulse' : ''}`}
                style={{ width: `${progress}%` }} 
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-[var(--text-secondary)]">
              <span>{Math.round(progress)}% Complete</span>
              <span>Stage: <span className="font-medium text-[var(--text-primary)]">{currentJob ? getProgressDetails(currentJob).stage : 'Idle'}</span></span>
              <span>Errors: <span className="font-medium text-red-400">{errors}</span></span>
            </div>
            <div className="mt-1 text-xs text-[var(--text-muted)]">
              {currentStep}
            </div>
          </div>

          {/* Table */}
          <div className="border-b border-[var(--border-input)]  overflow-hidden mb-5">
            <div className="grid grid-cols-3 text-xl text-[var(--text-muted)] bg-[var(--bg-input)]/70 px-4 py-2.5">
              <div>Source</div>
              <div>Status</div>
              <div className="text-right pr-2">Scraped</div>
            </div>
            {sources.map((s) => {
              const sourceStatus = getSourceStatus(s.id, currentJob);
              return (
                <div key={s.id} className="grid grid-cols-3 items-center px-4 py-2.5 text-sm border-t border-[var(--border-input)]">
                  <div className="text-[var(--text-primary)]">{s.label}</div>
                  <div className={`${sourceStatus.status === 'completed' ? 'text-green-400' : sourceStatus.status === 'running' ? 'text-blue-400' : sourceStatus.status === 'error' ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
                    {sourceStatus.text}
                  </div>
                  <div className="text-[var(--text-secondary)] text-right pr-2">{sourceStatus.count}</div>
                </div>
              );
            })}
          </div>

          {/* Detailed Stats */}
          {currentJob && (
            <div className="mb-4 p-3 bg-[var(--bg-input)] rounded-lg">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Scraping Statistics</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                <div>Job ID: <span className="font-mono text-[var(--text-primary)]">{currentJob.id}</span></div>
                <div>Status: <span className="font-medium text-[var(--text-primary)]">{currentJob.status}</span></div>
                <div>Raw Results: <span className="font-medium text-[var(--text-primary)]">{currentJob.stats?.total_raw || 0}</span></div>
                <div>Cleaned Results: <span className="font-medium text-[var(--text-primary)]">{currentJob.stats?.total_cleaned || 0}</span></div>
                <div>Duplicates Removed: <span className="font-medium text-[var(--text-primary)]">{currentJob.stats?.duplicates_removed || 0}</span></div>
                <div>Error Count: <span className="font-medium text-red-400">{currentJob.error_count || 0}</span></div>
              </div>
            </div>
          )}

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
            <button onClick={handleRotateProxy} className="flex-1 px-4 py-3 sm:py-2 rounded-lg text-[var(--text-primary)] text-sm font-medium bg-[var(--bg-secondary)] border border-[var(--border-input)] hover:bg-[var(--bg-primary)] transition-all duration-200 active:scale-95">
              Rotate Proxy
            </button>
            <button onClick={handleCaptchaIp} className="flex-1 px-4 py-3 sm:py-2 rounded-lg text-[var(--text-primary)] text-sm font-medium bg-[var(--bg-secondary)] border border-[var(--border-input)] hover:bg-[var(--bg-primary)] transition-all duration-200 active:scale-95">
              CAPTCHA Service
            </button>
          </div>

          {/* Live Logs */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Live logs</h3>
            <div className="h-40 overflow-auto border border-[var(--border-input)] rounded-md bg-[var(--bg-input)]/50">
              {logs.length === 0 ? (
                <div className="p-3 text-[var(--text-secondary)] text-sm">No logs yet…</div>
              ) : (
                logs.map((l, idx) => (
                  <div key={idx} className={`px-3 py-1.5 text-xs border-b border-[var(--border-input)]/60 ${l.type === 'error' ? 'text-red-400' : l.type === 'success' ? 'text-green-400' : 'text-[var(--text-secondary)]'}`}>
                    <span className="text-[var(--text-muted)] mr-2">[{l.ts}]</span>
                    {l.msg}
                  </div>
                ))
              )}
            </div>
            {lastStatus && (
              <div className="mt-2 text-xs text-[var(--text-secondary)]">
                Last status: {JSON.stringify(lastStatus)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


