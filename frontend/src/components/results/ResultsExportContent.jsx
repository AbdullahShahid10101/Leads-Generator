import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getSavedLeads, saveCleanedLeads } from '../../service/modelService';

// Local storage keys
const LOCAL_STORAGE_KEYS = {
  PENDING_LEADS: 'pending_leads',
  LATEST_SCRAPED_LEADS: 'latest_scraped_leads',
  SCRAPING_CONTEXT: 'scraping_context'
};

export default function ResultsExportContent() {
  const location = useLocation();
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState('None');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingLeads, setPendingLeads] = useState([]);
  const [latestScrapedLeads, setLatestScrapedLeads] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showLatestScraped, setShowLatestScraped] = useState(false);

  // Load data from localStorage on component mount - but only load if not already saved
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedPending = localStorage.getItem(LOCAL_STORAGE_KEYS.PENDING_LEADS);
        const storedLatest = localStorage.getItem(LOCAL_STORAGE_KEYS.LATEST_SCRAPED_LEADS);
        const storedContext = localStorage.getItem(LOCAL_STORAGE_KEYS.SCRAPING_CONTEXT);
        
        // Only load pending leads if they exist and haven't been saved
        if (storedPending) {
          const pendingLeadsData = JSON.parse(storedPending);
          // Check if these leads have already been saved (by comparing with empty array)
          if (pendingLeadsData.length > 0) {
            setPendingLeads(pendingLeadsData);
          } else {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.PENDING_LEADS);
          }
        }
        
        // Only load latest scraped leads if they exist and haven't been saved
        if (storedLatest) {
          const latestLeads = JSON.parse(storedLatest);
          if (latestLeads.length > 0) {
            setLatestScrapedLeads(latestLeads);
            // Automatically show latest scraped leads when they exist
            setShowLatestScraped(true);
          } else {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.LATEST_SCRAPED_LEADS);
          }
        }

        // Store scraping context for later use in filtering
        if (storedContext) {
          localStorage.setItem('current_scraping_context', storedContext);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    };

    loadFromStorage();
  }, []);

  // Manual localStorage management - we'll handle saving manually in handleSaveLeads

  // Load saved leads from database
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getSavedLeads({ limit: 500 });
        if (!active) return;
        const allLeads = Array.isArray(data) ? data : (data?.data || []);
             let recentlySavedLeads = allLeads;
        try {
          const scrapingContextStr = localStorage.getItem('current_scraping_context');
          if (scrapingContextStr) {
            const scrapingContext = JSON.parse(scrapingContextStr);
            
            // Filter leads by industry and location from scraping context
            recentlySavedLeads = allLeads.filter(lead => 
              (!scrapingContext.industry || scrapingContext.industry === 'unknown' || 
               (lead.industry && lead.industry.toLowerCase().includes(scrapingContext.industry.toLowerCase()))) &&
              (!scrapingContext.location || scrapingContext.location === 'unknown' || 
               (lead.location && lead.location.toLowerCase().includes(scrapingContext.location.toLowerCase())))
            );
          }
        } catch (contextError) {
          console.error('Error parsing scraping context:', contextError);   
          // Fallback to showing all leads if context parsing fails
          recentlySavedLeads = allLeads;
        }
        setLeads(recentlySavedLeads);
        setSelectedLeads([]);
      } catch (e) {
        if (!active) return;
        setError(e?.response?.data?.error || e?.message || 'Failed to load leads');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [showLatestScraped]);

  // Pick up pending leads passed from Cleaning page and save to localStorage
  useEffect(() => {
    const incoming = location.state?.pendingLeads;
    if (Array.isArray(incoming) && incoming.length > 0) {
      setPendingLeads(incoming);
      setLatestScrapedLeads(incoming); // Also set as latest scraped leads
    }
  }, [location.state]);

  const uiLeads = useMemo(() => {
    return (leads || []).map(l => ({
      id: l.id,
      company: l.company || l.name || '',
      name: l.name || '',
      role: l.role || '',
      email: l.email || '',
      phone: l.phone || '',
      location: l.location || '',
      industry: l.industry || '',
      source: l.source || '',
      status: 'Verified',
      created_at: l.created_at || ''
    }));
  }, [leads]);

  const latestScrapedUiLeads = useMemo(() => {
    return (latestScrapedLeads || []).map((l, index) => ({
      id: `scraped-${index}`,
      company: l.company || l.name || '',
      name: l.name || '',
      role: l.role || '',
      email: l.email || '',
      phone: l.phone || '',
      location: l.location || '',
      industry: l.industry || '',
      source: l.source || 'scraped',
      status: 'Pending Save',
      created_at: new Date().toISOString()
    }));
  }, [latestScrapedLeads]);

  const handleSelectLead = (leadId) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };

  const handleSelectAll = () => {
    const currentLeads = showLatestScraped ? latestScrapedUiLeads : uiLeads;
    if (selectedLeads.length === currentLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(currentLeads.map(lead => lead.id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return 'text-green-500';
      case 'Pending Save':
        return 'text-yellow-500';
      case 'Failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredLeads = (showLatestScraped ? latestScrapedUiLeads : uiLeads).filter(lead =>
    lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function toCSV(rows) {
    if (!rows || rows.length === 0) return '';
    const headers = ['id','company','name','email','phone','location','industry','source','created_at'];
    const out = [headers.join(',')];
    rows.forEach(r => {
      const vals = [
        r.id,
        r.company || '',
        r.name || '',
        r.email || '',
        r.phone || '',
        r.location || '',
        r.industry || '',
        r.source || '',
        r.created_at || ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      out.push(vals.join(','));
    });
    return out.join('\n');
  }

  function download(filename, content, mime = 'text/plain') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleDownloadAllCSV = () => {
    const csv = toCSV(showLatestScraped ? latestScrapedUiLeads : uiLeads);
    download('leads.csv', csv, 'text/csv;charset=utf-8;');
  };

  const handleDownloadSelectedCSV = () => {
    const currentLeads = showLatestScraped ? latestScrapedUiLeads : uiLeads;
    const rows = currentLeads.filter(l => selectedLeads.includes(l.id));
    const csv = toCSV(rows);
    download('leads_selected.csv', csv, 'text/csv;charset=utf-8;');
  };

  const handleDownloadAllJSON = () => {
    const data = showLatestScraped ? latestScrapedLeads : leads;
    download('leads.json', JSON.stringify(data, null, 2), 'application/json');
  };

  const handleSaveAllLeads = async () => {
    if (showLatestScraped) {
      await handleSaveLeads(latestScrapedLeads);
    } else {
      const selectedData = uiLeads.filter(l => selectedLeads.includes(l.id));
      await handleSaveLeads(selectedData);
    }
  };

  const handleSaveSelectedLeads = async () => {
    if (showLatestScraped) {
      const selectedData = latestScrapedLeads.filter((_, index) => 
        selectedLeads.includes(`scraped-${index}`)
      );
      await handleSaveLeads(selectedData);
    } else {
      const selectedData = leads.filter(lead => 
        selectedLeads.includes(lead.id)
      );
      await handleSaveLeads(selectedData);
    }
  };

  const handleSaveLeads = async (leadsToSave) => {
    if (!leadsToSave || leadsToSave.length === 0) return;
    
    setSaving(true);
    try {
      const res = await saveCleanedLeads(leadsToSave);
      if (res?.success) {
        // Remove saved leads from latest preview and localStorage
        if (showLatestScraped) {
          // Check if we're saving all leads (based on selection count)
          if (selectedLeads.length === 0 || selectedLeads.length === latestScrapedLeads.length) {
            // Saving all leads - clear everything from localStorage and state
            setLatestScrapedLeads([]);
            setPendingLeads([]);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.LATEST_SCRAPED_LEADS);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.PENDING_LEADS);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.SCRAPING_CONTEXT);
          } else {
            // Saving selected leads - remove only the selected ones from preview
            const remainingLeads = latestScrapedLeads.filter((_, index) => 
              !selectedLeads.includes(`scraped-${index}`)
            );
            setLatestScrapedLeads(remainingLeads);
            localStorage.setItem(LOCAL_STORAGE_KEYS.LATEST_SCRAPED_LEADS, JSON.stringify(remainingLeads));
            
            // Also update pending leads if they exist
            if (pendingLeads.length > 0) {
              const remainingPendingLeads = pendingLeads.filter((_, index) => 
                !selectedLeads.includes(`scraped-${index}`)
              );
              setPendingLeads(remainingPendingLeads);
              localStorage.setItem(LOCAL_STORAGE_KEYS.PENDING_LEADS, JSON.stringify(remainingPendingLeads));
            }
          }
        }
        
        // Clear selection and toggle to saved leads view
        setSelectedLeads([]);
        setShowLatestScraped(false);
        
        alert(`Successfully saved ${res.inserted_count || 0} leads to database`);
      } else {
        alert(res?.error || 'Failed to save leads');
      }
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || 'Failed to save leads');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePendingLeads = async () => {
    await handleSaveLeads(pendingLeads);
  };

  const clearLatestScraped = () => {
    setLatestScrapedLeads([]);
    setSelectedLeads([]);
  };

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
              {showLatestScraped 
                ? `Previewing ${latestScrapedLeads.length} latest scraped leads` 
                : `Viewing ${leads.length} saved leads from database`}
            </p>
          </div>
          
          {/* Right Side: Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 lg:justify-end lg:items-center">
            {pendingLeads.length > 0 && (
              <button onClick={handleSavePendingLeads} disabled={saving} className="text-base px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Saving…' : `Save Pending (${pendingLeads.length})`}
              </button>
            )}
            {latestScrapedLeads.length > 0 && (
              <button onClick={() => setShowLatestScraped(!showLatestScraped)} className="text-base px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
                {showLatestScraped ? 'View Saved Leads' : `View Latest Scraped (${latestScrapedLeads.length})`}
              </button>
            )}
            <button onClick={handleDownloadAllCSV} disabled={loading || (showLatestScraped ? latestScrapedUiLeads.length === 0 : uiLeads.length === 0)} className="text-base px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              Download CSV
            </button>
            <button onClick={handleDownloadAllJSON} disabled={loading || (showLatestScraped ? latestScrapedLeads.length === 0 : leads.length === 0)} className="text-base px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              Download JSON
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-[var(--text-muted)] text-sm">View:</span>
          <button
            onClick={() => setShowLatestScraped(false)}
            className={`px-4 py-2 rounded-lg text-sm ${
              !showLatestScraped
                ? 'bg-[var(--accent-primary)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            Saved Leads ({leads.length})
          </button>
          {latestScrapedLeads.length > 0 && (
            <button
              onClick={() => setShowLatestScraped(true)}
              className={`px-4 py-2 rounded-lg text-sm ${
                showLatestScraped
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              Latest Scraped ({latestScrapedLeads.length})
            </button>
          )}
        </div>

        {/* Save Actions */}
        {showLatestScraped && latestScrapedLeads.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-yellow-800 font-medium">
                {selectedLeads.length > 0 
                  ? `${selectedLeads.length} leads selected` 
                  : `${latestScrapedLeads.length} scraped leads ready to save`}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAllLeads}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save All to Database'}
                </button>
                {selectedLeads.length > 0 && (
                  <button
                    onClick={handleSaveSelectedLeads}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : `Save Selected (${selectedLeads.length})`}
                  </button>
                )}
                <button
                  onClick={clearLatestScraped}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Combined Container: Search, Table, and Actions */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl shadow-lg overflow-hidden">
          {/* Search and Bulk Actions */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search company, name, email..."
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
                      checked={selectedLeads.length > 0 && selectedLeads.length === (showLatestScraped ? latestScrapedUiLeads.length : uiLeads.length)}
                      onChange={handleSelectAll}
                      className="rounded border-[var(--border-input)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Company
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
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-6 text-center text-[var(--text-muted)]">Loading leads...</td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={8} className="px-6 py-6 text-center text-red-500">{error}</td>
                  </tr>
                )}
                {!loading && !error && filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-6 text-center text-[var(--text-muted)]">No leads found</td>
                  </tr>
                )}
                {!loading && !error && filteredLeads.map((lead) => (
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
                      <div className="text-sm font-medium text-[var(--text-primary)]">{lead.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-secondary)]">{lead.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-secondary)]">{lead.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-secondary)]">{lead.role || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-secondary)]">{lead.company || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-secondary)]">{lead.location || 'N/A'}</div>
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
                  onClick={handleDownloadSelectedCSV}
                  disabled={selectedLeads.length === 0}
                  className="px-6 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-lg text-base hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export Selected (CSV)
                </button>
                {showLatestScraped && selectedLeads.length > 0 && (
                  <button 
                    onClick={handleSaveSelectedLeads}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : `Save Selected (${selectedLeads.length})`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
