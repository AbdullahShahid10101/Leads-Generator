import { useState } from 'react';

export default function IndustryPackagesContent() {
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Mock data for industry packages
  const industryPackages = [
    {
      id: 1,
      title: 'Dentists — NYC',
      leads: 500,
      verifyRate: 92,
      description: 'Targeted dental practices in New York City area'
    },
    {
      id: 2,
      title: 'Law Firms — Florida',
      leads: 800,
      verifyRate: 90,
      description: 'Legal services across Florida state'
    },
    {
      id: 3,
      title: 'Restaurants — Texas',
      leads: 1200,
      verifyRate: 88,
      description: 'Restaurant businesses throughout Texas'
    },
    {
      id: 4,
      title: 'IT Services — California',
      leads: 1000,
      verifyRate: 93,
      description: 'Technology companies in California'
    }
  ];

  const handleUsePackage = (packageId) => {
    setSelectedPackage(packageId);
    console.log(`Using package: ${packageId}`);
    // Here you would implement the package selection logic
  };

  return (
    <div className="flex-1 p-4 lg:p-6">
      {/* Main Container */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
        {/* Heading Area Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Left Side: Heading and Subheading */}
          <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">
              Industry Packages
            </h1>
            <p className="text-[var(--text-muted)] text-xs lg:text-sm">
              Pre-built targeted lists for speed
            </p>
          </div>
          
          {/* Right Side: Action Button */}
          <div className="flex flex-col sm:flex-row gap-3 lg:justify-end lg:items-center">
            <button className="text-base px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] transition-colors duration-300">
              Use Package
            </button>
          </div>
        </div>

        {/* Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {industryPackages.map((pkg) => (
            <div 
              key={pkg.id} 
              className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                 {/* Package Info */}
                 <div className="flex-1">
                   <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                     {pkg.title}
                   </h3>
                   <div className="flex items-center gap-4 text-lg">
                    <span className="text-[var(--text-muted)]">
                      {pkg.leads.toLocaleString()} leads
                    </span>
                    <span className="text-[var(--text-muted)]">
                      • Verify {pkg.verifyRate}%
                    </span>
                  </div>
                </div>
                
                {/* Use Button */}
                <div className="lg:flex-shrink-0">
                  <button
                    onClick={() => handleUsePackage(pkg.id)}
                    className="px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:bg-[var(--accent-secondary)] transition-colors duration-300"
                    style={{ background: 'var(--btn-gradient)' }}
                  >
                    Use
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
