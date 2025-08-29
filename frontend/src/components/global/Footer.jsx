import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const handlePrivacyPolicy = () => {
    navigate('/privacy-policy');
  };

  const handleTermsOfService = () => {
    navigate('/terms-of-service');
  };

  const handleHelp = () => {
    navigate('/help');
  };

  return (
    <footer className="w-auto bg-transparent border border-[var(--border-input)] px-3 sm:px-6 py-3 sm:py-4 rounded-2xl m-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        {/* Left side - Copyright */}
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] text-center sm:text-left">
          © 2025 LeadHarvest. All Rights Reserved.
        </div>

        {/* Right side - Links */}
        <div className="flex items-center justify-center sm:justify-end space-x-4 sm:space-x-6">
          <button 
            onClick={handlePrivacyPolicy}
            className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Privacy Policy
          </button>
          <button 
            onClick={handleTermsOfService}
            className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Terms of Service
          </button>
          <button 
            onClick={handleHelp}
            className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Help
          </button>
        </div>
      </div>
    </footer>
  );
}
