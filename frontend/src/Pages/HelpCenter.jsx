import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/global/Header";
import { logoutUser } from "../service/authService";

export default function HelpCenter() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(0);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? -1 : index);
  };

  const faqs = [
    {
      question: "How often is data updated?",
      answer: "All data is scraped in real-time when you run a search, ensuring the most current information available."
    },
    {
      question: "What is your accuracy rate?",
      answer: "Our data accuracy rate is consistently above 95% for contact information and business details."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your access will remain active until the end of your current billing period."
    },
    {
      question: "Which sources do you scrape?",
      answer: "We scrape from publicly available business directories, company websites, LinkedIn, and other legitimate business sources."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-['Inter',sans-serif] flex flex-col">
      <Header onLogout={handleLogout} />

      <div className="flex-1 flex flex-col gap-4 p-1 lg:p-2 m-2 bg-[var(--bg-primary)] border border-[var(--border-input)] rounded-2xl">
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

        <main className="px-6 py-8 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Help Center</h1>
            <p className="text-[var(--text-muted)]">Get assistance with LeadHarvest AI</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Getting Started</h2>
              <p className="text-[var(--text-muted)] mb-6">New to LeadHarvest? Start here.</p>
              
              <ul className="space-y-3">
                <li className="flex items-center text-[var(--text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full mr-3"></div>
                  Creating your first lead search
                </li>
                <li className="flex items-center text-[var(--text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full mr-3"></div>
                  Understanding area selection
                </li>
                <li className="flex items-center text-[var(--text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full mr-3"></div>
                  Exporting leads to your CRM
                </li>
                <li className="flex items-center text-[var(--text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full mr-3"></div>
                  Managing your subscription
                </li>
                <li className="flex items-center text-[var(--text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full mr-3"></div>
                  Setting up API integrations
                </li>
                <li className="flex items-center text-[var(--text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full mr-3"></div>
                  Using industry-specific packages
                </li>
                <li className="flex items-center text-[var(--text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full mr-3"></div>
                  Scheduling automatic lead updates
                </li>
                <li className="flex items-center text-[var(--text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full mr-3"></div>
                  Understanding credit usage
                </li>
              </ul>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">FAQs</h2>
              <p className="text-[var(--text-muted)] mb-6">Frequently Asked Questions.</p>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl p-4 cursor-pointer hover:bg-[var(--bg-input)] transition-colors"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex items-center justify-between">
                    <h3 className="text-[#5cc086] font-semibold">{faq.question}</h3>
                      <svg 
                        className={`w-5 h-5 text-[#5cc086] transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {expandedFaq === index && (
                      <p className="text-[var(--text-secondary)] mt-3 leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-8 text-start">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Contact Support</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <button className="px-4 py-2 bg-[var(--btn-primary)] text-white rounded-lg font-semibold hover:bg-[var(--btn-secondary)] transition-colors">
                Submit a Ticket
              </button>
              <button className="px-4 py-2 bg-transparent border border-[var(--border-input)] text-[var(--text-primary)] rounded-lg font-semibold hover:bg-[var(--bg-input)] transition-colors">
                Email Support
              </button>
            </div>
            
            <p className="text-[var(--text-muted)] text-sm mb-2">
              Typically responds within 12 business hours
            </p>
            <a 
              href="mailto:support@leadharvest.ai" 
              className="text-[var(--text-primary)] hover:text-[var(--btn-primary)] transition-colors"
            >
              support@leadharvest.ai
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
