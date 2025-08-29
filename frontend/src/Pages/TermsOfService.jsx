import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/global/Header";
import Footer from "../components/global/Footer";
import { logoutUser } from "../service/authService";

export default function TermsOfService() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-['Inter',sans-serif] flex flex-col">
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
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back</span>
          </button>
        </div>

        {/* Main Content */}
        <main className="px-6 py-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Terms of Servies</h1>
            <p className="text-[var(--text-muted)]">Last updated: August 14, 2025</p>
          </div>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">1.</span>
                Acceptance of Terms
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                By accessing and using LeadHarvest AI, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">2.</span>
                Services Description
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                LeadHarvest AI is a B2B lead generation service that scrapes publicly available information from various online sources to provide business leads and contact information.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">3.</span>
                Account Registration
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                You must provide accurate, current, and complete information during registration and keep your account credentials secure. You are responsible for all activities under your account.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">4.</span>
                Payment Terms
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                All fees are payable in advance and are generally non-refundable. We reserve the right to modify our pricing with 30 days notice.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">5.</span>
                Acceptable Use
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                You agree not to use our services for any unlawful purpose or in violation of these terms. Prohibited activities include:
              </p>
              <ul className="text-[var(--text-secondary)] leading-relaxed list-disc list-inside space-y-2 ml-4">
                <li>Sending unsolicited commercial emails (spam)</li>
                <li>Reverse engineering or attempting to extract source code</li>
                <li>Harassment or abuse of other users</li>
                <li>Violation of applicable laws including GDPR and CAN-SPAM</li>
                <li>Sharing account credentials with unauthorized users</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">6.</span>
                Limitation of Liability
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                LeadHarvest AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">7.</span>
                Governing Law
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of Delaware, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-bold text-[#2ECC71] mb-4">
                <span className="text-[#2ECC71] mr-2">8.</span>
                Changes of Terms
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website or notification via email.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
