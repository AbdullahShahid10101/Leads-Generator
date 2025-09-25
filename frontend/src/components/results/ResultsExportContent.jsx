import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getSavedLeads, saveCleanedLeads } from '../../service/modelService';

export default function ResultsExportContent() {
  const location = useLocation();
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState('None');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingLeads, setPendingLeads] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getSavedLeads({ limit: 500 });
        if (!active) return;
        const arr = Array.isArray(data) ? data : (data?.data || []);
        setLeads(arr);
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
  }, []);

  // Pick up pending leads passed from Cleaning page
  useEffect(() => {
    const incoming = location.state?.pendingLeads;
    if (Array.isArray(incoming) && incoming.length > 0) {
      setPendingLeads(incoming);
    }
  }, [location.state]);

  const uiLeads = useMemo(() => {
    return (leads || []).map(l => ({
      id: l.id,
      company: l.company || l.name || '',
      contact: l.name || '',
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

  const handleSelectLead = (leadId) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === uiLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(uiLeads.map(lead => lead.id));
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

  const filteredLeads = uiLeads.filter(lead =>
    lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function toCSV(rows) {
    if (!rows || rows.length === 0) return '';
    const headers = ['id','company','contact','email','phone','location','industry','source','created_at'];
    const out = [headers.join(',')];
    rows.forEach(r => {
      const vals = [
        r.id,
        r.company || '',
        r.contact || '',
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
    const csv = toCSV(uiLeads);
    download('leads.csv', csv, 'text/csv;charset=utf-8;');
  };

  const handleDownloadSelectedCSV = () => {
    const rows = uiLeads.filter(l => selectedLeads.includes(l.id));
    const csv = toCSV(rows);
    download('leads_selected.csv', csv, 'text/csv;charset=utf-8;');
  };

  const handleDownloadAllJSON = () => {
    download('leads.json', JSON.stringify(leads, null, 2), 'application/json');
  };

  const handleSavePendingLeads = async () => {
    if (!pendingLeads || pendingLeads.length === 0) return;
    setSaving(true);
    try {
      const res = await saveCleanedLeads(pendingLeads);
      if (res?.success) {
        // refresh list
        const data = await getSavedLeads({ limit: 500 });
        const arr = Array.isArray(data) ? data : (data?.data || []);
        setLeads(arr);
        setPendingLeads([]);
        alert(`Saved ${res.inserted_count || 0} leads`);
      } else {
        alert(res?.error || 'Failed to save leads');
      }
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || 'Failed to save leads');
    } finally {
      setSaving(false);
    }
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
              Download: CSV • Excel • JSON • Push to CRM or API
            </p>
          </div>
          
          {/* Right Side: Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 lg:justify-end lg:items-center">
            <button onClick={handleSavePendingLeads} disabled={saving || pendingLeads.length === 0} className="text-base px-4 py-2 bg-[var(--accent-primary)] text-[var(--text-secondary)] rounded-lg  hover:bg-[var(--accent-primary)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--btn-gradient)' }}>
              {saving ? 'Saving…' : `Save List to Database  (${pendingLeads.length})`}
            </button>
            <button onClick={handleDownloadAllCSV} disabled={loading || uiLeads.length === 0} className="text-base px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-secondary)] rounded-lg  hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              Download CSV
            </button>
            <button onClick={handleDownloadAllJSON} disabled={loading || uiLeads.length === 0} className="text-base px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              Download JSON
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
                      checked={selectedLeads.length > 0 && selectedLeads.length === uiLeads.length}
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
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 text-center text-[var(--text-muted)]">Loading leads...</td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 text-center text-red-500">{error}</td>
                  </tr>
                )}
                {!loading && !error && filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 text-center text-[var(--text-muted)]">No leads found</td>
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
                  onClick={handleDownloadSelectedCSV}
                  disabled={selectedLeads.length === 0}
                  className="px-6 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-lg text-base hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export Selected (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
