import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/global/Header";
import Sidebar from "../components/global/Sidebar";
import Footer from "../components/global/Footer";
import CleaningVerifyContent from "../components/cleaning/CleaningVerifyContent";
import { logoutUser } from "../service/authService";
import Toast from "../components/global/Toast";
import { useAuthCheck } from "../hooks/useAuthCheck";

export default function CleaningVerify() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Use the custom auth check hook
  useAuthCheck(setToast);

  const isAnyModalOpen = isProfileModalOpen || isLogoutModalOpen;

  const handleLogout = () => {
    logoutUser();
    
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

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-['Inter',sans-serif] flex flex-col">
      <Header onLogout={handleLogout} onMenuToggle={toggleSidebar} />

      <div className={`flex-1 flex flex-col lg:flex-row gap-4 p-1 lg:p-2 relative`}>        
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <div className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:block`}>
          <Sidebar currentPage="cleaning-verify" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-input)] rounded-2xl p-4 lg:p-6">
            <CleaningVerifyContent />
          </div>
        </div>

        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full border border-[var(--border-input)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] shadow"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <Footer />
      
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


