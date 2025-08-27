import { useState, useEffect } from 'react';

export default function ProfileModal({ isOpen, onClose }) {
  const [profileData, setProfileData] = useState({
    fullName: 'John Smith',
    email: 'you@company.com',
    role: 'Owner'
  });

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Profile saved:', profileData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with subtle blur effect */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
        onClick={onClose}
        style={{
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)'
        }}
      >
        {/* Modal - no blur on content */}
        <div 
          className="bg-[var(--bg-primary)] rounded-xl sm:rounded-2xl border border-[var(--border-model)] shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--text-secondary)]">Account</h2>
              <p className="text-xs sm:text-sm md:text-base text-[var(--text-muted)]">Manage team & billing</p>
            </div>
            <button
              onClick={onClose}
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base font-medium text-[var(--text-secondary)]"
              aria-label="Close modal"
            >
              Close
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Profile Information */}
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-1.5 sm:mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] focus:border-transparent transition-all duration-300 text-xs sm:text-sm md:text-base"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-1.5 sm:mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] focus:border-transparent transition-all duration-300 text-xs sm:text-sm md:text-base"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-1.5 sm:mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profileData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] focus:border-transparent transition-all duration-300 text-xs sm:text-sm md:text-base"
                      placeholder="Enter your role"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 md:py-2 bg-gradient-to-r from-[var(--btn-primary)] to-[var(--btn-secondary)] text-[var(--bg-accent)] rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base"
                  style={{ background: 'var(--btn-gradient)' }}
                >
                  Save
                </button>
              </div>

              {/* Plan Information */}
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                
                <div className="w-full bg-[var(--bg-secondary)] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-[var(--border-primary)]">
                  <div className="mb-3 sm:mb-4 md:mb-6">
                    <div className="text-lg font-bold text-[var(--text-secondary)]">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[var(--text-secondary)] mb-1">Plan</h3>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] mb-1">Pro 1,200 leads / mo</p>
                    </div>
                    <div className="text-[var(--text-muted)]">
                      
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 flex flex-col items-center">
                    <button className="w-full sm:w-40 md:w-48 px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base">
                      Manage Billing
                    </button>
                    <button className="w-full sm:w-40 md:w-48 px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base">
                      Manage Team
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
