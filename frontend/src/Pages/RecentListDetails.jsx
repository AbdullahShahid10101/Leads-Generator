import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from "../components/global/Header";
import Sidebar from "../components/global/Sidebar";
import Footer from "../components/global/Footer";
import Toast from "../components/global/Toast";
import { useAuthCheck } from "../hooks/useAuthCheck";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

export default function RecentListDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');

  // Use the custom auth check hook
  useAuthCheck(setToast);

  useEffect(() => {
    const industryParam = searchParams.get('industry');
    const locationParam = searchParams.get('location');
    
    if (industryParam && locationParam) {
      setIndustry(industryParam);
      setLocation(locationParam);
      loadListLeads(industryParam, locationParam);
    } else {
      setToast({
        show: true,
        message: 'Invalid list parameters',
        type: 'error'
      });
      navigate('/dashboard');
    }

    // Add smooth scrolling to the document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Cleanup function to remove smooth scrolling
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [searchParams, navigate]);

  const loadListLeads = async (industry, location) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      const res = await fetch(`${API_BASE}/recentlists/leads?industry=${encodeURIComponent(industry)}&location=${encodeURIComponent(location)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        console.error("Unauthorized - token missing or expired");
        setToast({
          show: true,
          message: 'Session expired. Please login again.',
          type: 'error'
        });
        navigate('/login');
        return;
      }

      const data = await res.json();
      
      if (data.success) {
        setLeads(data.data || []);
      } else {
        setToast({
          show: true,
          message: data.error || 'Failed to load list details',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error loading list leads:', error);
      setToast({
        show: true,
        message: 'Failed to load list details',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    
    // Show success toast
    setToast({
      show: true,
      message: 'Logged out successfully!',
      type: 'success'
    });
    
    // Navigate after a short delay to show the toast
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  const closeToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleProfileModalChange = (isOpen) => {
    setIsProfileModalOpen(isOpen);
  };

  const handleLogoutModalChange = (isOpen) => {
    setIsLogoutModalOpen(isOpen);
  };

  const goBack = () => {
    navigate('/dashboard');
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Industry', 'Location', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.company || '',
        lead.industry || '',
        lead.location || '',
        lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ''
      ].map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${industry}-${location}-leads.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if any modal is open
  const isAnyModalOpen = isProfileModalOpen || isLogoutModalOpen;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-['Inter',sans-serif] flex flex-col scroll-smooth">
      {/* Header */}
      <Header 
        onLogout={handleLogout} 
        onMenuToggle={toggleSidebar} 
        onProfileModalChange={handleProfileModalChange}
        onLogoutModalChange={handleLogoutModalChange}
      />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col lg:flex-row gap-4 p-1 lg:p-2 relative overflow-hidden transition-all duration-300 ${isAnyModalOpen ? 'bg-blur-strong' : ''}`}>
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Sidebar - hidden on mobile by default, shown when toggled */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:block`}>
          <Sidebar currentPage="dashboard" />
        </div>
        
        {/* Recent List Details Content */}
        <div 
          className="flex-1 overflow-y-auto scroll-smooth transition-all duration-300"
          style={{
            filter: isAnyModalOpen ? 'blur(2px)' : 'blur(0px)',
            transform: isAnyModalOpen ? 'scale(0.99)' : 'scale(1)',
            opacity: isAnyModalOpen ? '0.9' : '1'
          }}
        >
          <main className="flex-1 bg-[var(--bg-primary)] p-2 sm:p-4 border border-[var(--border-input)] rounded-2xl scroll-smooth overflow-y-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <div>
                <button
                  onClick={goBack}
                  className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-2 flex items-center text-sm"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-secondary)] mb-2">
                  {industry} - {location}
                </h1>
                <p className="text-sm sm:text-base text-[var(--text-muted)]">
                  {leads.length} leads found
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={exportToCSV}
                  className="h-auto px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-colors text-sm"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-[var(--bg-secondary)] rounded-xl p-3 sm:p-4 border border-[var(--border-primary)]">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--btn-primary)] mx-auto"></div>
                  <p className="text-[var(--text-muted)] mt-4">Loading leads...</p>
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--text-muted)]">No leads found for this list.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-primary)]">
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Phone</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Company</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Location</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, index) => (
                        <tr key={index} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-primary)]">
                          <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{lead.name || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{lead.email || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{lead.role || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{lead.phone || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{lead.company || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{lead.location || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-[var(--text-muted)]">
                            {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <div 
        className="transition-all duration-300"
        style={{
          filter: isAnyModalOpen ? 'blur(2px)' : 'blur(0px)',
          transform: isAnyModalOpen ? 'scale(0.99)' : 'scale(1)',
          opacity: isAnyModalOpen ? '0.9' : '1'
        }}
      >
        <Footer />
      </div>
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={closeToast}
      />
    </div>
  );
}
