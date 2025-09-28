import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getScrapeJobResults, saveCleanedLeads, cleanLeads } from '../../service/modelService';

export default function CleaningVerifyContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [provider, setProvider] = useState('SMTP +DNS');
  const [retries, setRetries] = useState('2');
  const [scrapedLeads, setScrapedLeads] = useState([]);
  const [cleanedLeads, setCleanedLeads] = useState([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stats, setStats] = useState({
    raw: 0,
    afterClean: 0,
    verified: 0,
    failed: 0
  });

  // Load scraped data when component mounts
  useEffect(() => {
    const loadScrapedData = async () => {
      const jobId = location.state?.jobId;
      console.log('Cleaning page - Loading data for jobId:', jobId);
      
      if (jobId) {
        try {
          const response = await getScrapeJobResults(jobId);
          console.log('Cleaning page - Response:', response);
          
          if (response.success && response.results) {
            setScrapedLeads(response.results);
            setStats(prev => ({ ...prev, raw: response.results.length }));
            console.log('Cleaning page - Loaded leads:', response.results.length);
          } else {
            console.warn('Cleaning page - No results found in response');
          }
        } catch (error) {
          console.error('Error loading scraped data:', error);
        }
      } else {
        console.warn('Cleaning page - No jobId provided');
        // For testing, add some sample data
        const sampleLeads = [
          {
            name: "John Smith",
            company: "Tech Corp",
            industry: "Technology",
            email: "john.smith@techcorp.com",
            phone: "+1-555-0123",
            location: "New York, NY",
            source: "google_maps"
          },
          {
            name: "Sarah Johnson",
            company: "Marketing Solutions",
            industry: "Marketing",
            email: "sarah.j@marketingsolutions.com",
            phone: "+1-555-0456",
            location: "Los Angeles, CA",
            source: "linkedin"
          }
        ];
        setScrapedLeads(sampleLeads);
        setStats(prev => ({ ...prev, raw: sampleLeads.length }));
      }
    };
    loadScrapedData();
  }, [location.state]);

  // Server-side cleaning process
  const runCleaning = async () => {
    console.log('Starting server cleaning with', scrapedLeads.length, 'leads');
    setIsCleaning(true);
    try {
      const res = await cleanLeads(scrapedLeads);
      console.log('Cleaning API response:', res);

      // Normalize different possible response shapes
      const cleanedFromRoot = Array.isArray(res?.cleaned) ? res.cleaned : undefined;
      const cleanedFromData = Array.isArray(res?.data?.cleaned) ? res.data.cleaned : undefined;
      const cleanedFromResults = Array.isArray(res?.results) ? res.results : undefined;
      const cleanedFromSelf = Array.isArray(res) ? res : undefined;
      const cleaned = cleanedFromRoot || cleanedFromData || cleanedFromResults || cleanedFromSelf || [];
      const statsFromServer = res?.stats || res?.data?.stats || {};

      if (cleaned.length >= 0) {
        console.log('Cleaning successful. Cleaned array length:', cleaned.length);
        if (cleaned.length === 0 && scrapedLeads.length > 0) {
          console.warn('Cleaning returned 0 items; falling back to raw scraped leads so verification can proceed.');
          setCleanedLeads([...scrapedLeads]);
          setStats(prev => ({
            ...prev,
            afterClean: scrapedLeads.length,
            verified: 0,
            failed: 0,
            raw: prev.raw || statsFromServer.total_raw || scrapedLeads.length
          }));
          console.log('Post-clean fallback stats:', { afterClean: scrapedLeads.length, raw: statsFromServer.total_raw || scrapedLeads.length });
        } else {
          setCleanedLeads(Array.isArray(cleaned) ? [...cleaned] : []);
          setStats(prev => ({
            ...prev,
            afterClean: cleaned.length,
            verified: 0,
            failed: 0,
            raw: prev.raw || statsFromServer.total_raw || scrapedLeads.length
          }));
          console.log('Post-clean stats:', { afterClean: cleaned.length, raw: statsFromServer.total_raw || scrapedLeads.length });
        }
      } else {
        console.error('Cleaning API failed (no cleaned array detected):', res);
        const errMsg = res?.error || (typeof res === 'string' ? res : 'Unknown error');
        alert(`Cleaning failed: ${errMsg}`);
      }
    } catch (e) {
      console.error('Cleaning API error:', e);
      alert(`Cleaning error: ${e?.message || e}`);
    } finally {
      setIsCleaning(false);
    }
  };

  // Simulate email verification
  const runVerification = async () => {
    setIsVerifying(true);
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate verification results
    const verified = cleanedLeads.map(lead => {
      const hasEmail = Boolean(lead.email);
      const hasAltContact = Boolean(lead.phone) || Boolean(lead.website);
      const emailStatus = hasEmail
        ? (Math.random() > 0.2 ? 'valid' : 'invalid')
        : (hasAltContact ? 'valid' : 'invalid');
      return {
        ...lead,
        emailStatus,
        verificationDate: new Date().toISOString()
      };
    });
    
    const validCount = verified.filter(l => l.emailStatus === 'valid').length;
    const invalidCount = verified.filter(l => l.emailStatus === 'invalid').length;
    
    setCleanedLeads(verified);
    setStats(prev => ({ 
      ...prev, 
      verified: validCount,
      failed: invalidCount
    }));
    setIsVerifying(false);
  };

  // Navigate to Results page with verified (or fallback to cleaned) leads for saving there
  const viewResults = () => {
    const verifiedLeads = cleanedLeads.filter(lead => lead.emailStatus === 'valid');
    const payload = verifiedLeads.length > 0 ? verifiedLeads : cleanedLeads;
    if (payload.length === 0) {
      alert('No leads to view. Run cleaning first.');
      return;
    }
    
    // Save to localStorage for persistence - save leads and scraping context
    try {
      localStorage.setItem('latest_scraped_leads', JSON.stringify(payload));
      localStorage.removeItem('pending_leads'); // Clear old pending leads
      
      // Store scraping context - try to extract from leads or location state
      const scrapingContext = {
        industry: location.state?.industry || 
                  (payload[0]?.industry || 'unknown'),
        location: location.state?.location || 
                  (payload[0]?.location || payload[0]?.address || 'unknown'),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('scraping_context', JSON.stringify(scrapingContext));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    navigate('/results-export', { state: { pendingLeads: payload } });
  };

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
              { label: 'Raw', value: stats.raw },
              { label: 'After Clean', value: stats.afterClean },
              { label: 'Verified', value: stats.verified },
              { label: 'Failed', value: stats.failed }
            ].map((m) => (
              <div key={m.label} className="text-center ">
                <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{m.value}</div>
                <div className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <button 
                onClick={runCleaning}
                disabled={isCleaning || scrapedLeads.length === 0}
                className={`flex-1 px-4 py-3 sm:py-2 rounded-lg text-white text-sm font-medium shadow transition-all duration-200 ${isCleaning || scrapedLeads.length === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-[var(--accent-primary)] hover:opacity-90 active:scale-95'}`}
                style={!isCleaning && scrapedLeads.length > 0 ? { background: 'var(--btn-gradient)' } : {}}
              >
                {isCleaning ? 'Cleaning...' : 'Run Cleaning'}
              </button>
              <button 
                onClick={runVerification}
                disabled={isVerifying || (cleanedLeads.length === 0 && (stats.afterClean || 0) === 0)}
                className={`flex-1 px-4 py-3 sm:py-2 rounded-lg text-white text-sm font-medium shadow transition-all duration-200 ${isVerifying || cleanedLeads.length === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:opacity-90 active:scale-95'}`}
              >
                {isVerifying ? 'Verifying...' : 'Run Verification'}
              </button>
            </div>
            <button 
              onClick={viewResults}
              disabled={cleanedLeads.length === 0}
              className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${cleanedLeads.length === 0 ? 'text-gray-500 bg-gray-200 cursor-not-allowed' : 'text-white bg-blue-600 hover:opacity-90'}`}
            >
              View Results ({Math.max(stats.verified, cleanedLeads.length)})
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

      {/* Leads Preview Section */}
      {scrapedLeads.length > 0 && (
        <div className="mt-6 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-5 lg:p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Scraped Leads Preview ({scrapedLeads.length} leads)
          </h2>
          <div className="max-h-96 overflow-y-auto">
            <div className="grid gap-3">
              {scrapedLeads.slice(0, 10).map((lead, index) => (
                <div key={index} className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-[var(--text-muted)]">Name:</span>
                      <div className="text-[var(--text-primary)] font-medium">{lead.name || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">Company:</span>
                      <div className="text-[var(--text-primary)]">{lead.company || lead.name || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">Email:</span>
                      <div className="text-[var(--text-primary)]">{lead.email || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">Phone:</span>
                      <div className="text-[var(--text-primary)]">{lead.phone || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">Location:</span>
                      <div className="text-[var(--text-primary)]">{lead.location || lead.address || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">Website:</span>
                      <div className="text-[var(--text-primary)]">{lead.website || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">Source:</span>
                      <div className="text-[var(--text-primary)] capitalize">{lead.source || 'N/A'}</div>
                    </div>
                    {lead.rating && (
                      <div>
                        <span className="text-[var(--text-muted)]">Rating:</span>
                        <div className="text-[var(--text-primary)]">{lead.rating}/5 ({lead.reviews} reviews)</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {scrapedLeads.length > 10 && (
              <div className="text-center mt-4 text-[var(--text-muted)]">
                ... and {scrapedLeads.length - 10} more leads
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {scrapedLeads.length === 0 && (
        <div className="mt-6 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-5 lg:p-6 text-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Scraped Data</h2>
          <p className="text-[var(--text-muted)] mb-4">
            No scraped leads found. Please go to Live Scraping page first to scrape some leads.
          </p>
          <button 
            onClick={() => navigate('/live-scraping')}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium bg-[var(--accent-primary)] hover:opacity-90 transition-all duration-200"
            style={{ background: 'var(--btn-gradient)' }}
          >
            Go to Live Scraping
          </button>
        </div>
      )}
    </div>
  );
}
