import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/global/Header";
import Sidebar from "../components/global/Sidebar";
import DashboardContent from "../components/dashboard/DashboardContent";
import Footer from "../components/global/Footer";
import { logoutUser } from "../service/authService";
import Toast from "../components/global/Toast";
import { useAuthCheck } from "../hooks/useAuthCheck";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Use the custom auth check hook
  useAuthCheck(setToast);

  useEffect(() => {
    // Add smooth scrolling to the document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Cleanup function to remove smooth scrolling
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleProfileModalChange = (isOpen) => {
    console.log('Profile modal state changed:', isOpen); // Debug log
    setIsProfileModalOpen(isOpen);
  };

  const handleLogoutModalChange = (isOpen) => {
    console.log('Logout modal state changed:', isOpen); // Debug log
    setIsLogoutModalOpen(isOpen);
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
        
        {/* Dashboard Content */}
        <div 
          className="flex-1 overflow-y-auto scroll-smooth transition-all duration-300"
          style={{
            filter: isAnyModalOpen ? 'blur(2px)' : 'blur(0px)',
            transform: isAnyModalOpen ? 'scale(0.99)' : 'scale(1)',
            opacity: isAnyModalOpen ? '0.9' : '1'
          }}
        >
          <DashboardContent />
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
