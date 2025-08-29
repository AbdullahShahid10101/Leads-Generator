import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/global/Header";
import Footer from "../components/global/Footer";
import { logoutUser } from "../service/authService";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-['Inter',sans-serif] flex flex-col bo1">
      {/* Header */}
      <Header onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 p-1 lg:p-2 m-2 bg-[var(--bg-primary)] border border-[var(--border-input)] rounded-2xl">
        {/* Navigation/Back Button */}
        <div className="px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-[var(--text-primary)] hover:text-[var(--btn-primary)] transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-[var(--text-muted)]">Back</span>
          </button>
        </div>

        {/* Main Content */}
        <main className="px-6 py-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Privacy Policy</h1>
            <p className="text-[var(--text-muted)]">Last Updated: Aug 27, 2025</p>
          </div>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">1.</span>
                Information We Collect
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We collect information you provide directly to us. For example, we collect information when you create an account, subscribe to our services, or communicate with us. We also automatically collect certain information about your device and usage of our Services.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">2.</span>
                How We Use Your Information
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We use the information we collect to provide, maintain, and improve our Services, to develop new services, and to protect our users.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71]  mb-4">
                <span className="text-[#2ECC71] mr-2">3.</span>
                Information Sharing
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We do not sell your personal information. We may share your information with service providers who perform services on our behalf, and in other limited circumstances.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">4.</span>
                Data Retention
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We store the information we collect about you for as long as necessary for the purpose(s) for which we collected it.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">5.</span>
                Your Rights
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                You have the right to access, correct, or delete your personal information. You can also object to or restrict certain processing activities.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">6.</span>
                Contact Us
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a 
                  href="mailto:support@leadharvest.ai" 
                  className="text-[var(--text-primary)] underline hover:text-[var(--btn-primary)] transition-colors"
                >
                  support@leadharvest.ai
                </a>.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
