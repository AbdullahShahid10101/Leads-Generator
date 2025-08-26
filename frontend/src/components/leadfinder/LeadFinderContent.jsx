import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LeadFinderContent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    industry: '',
    location: '',
    role: 'Owner/ Founder',
    companySize: 'Any',
    keywords: ''
  });

  const [selectedSources, setSelectedSources] = useState([]);

  const roleOptions = [
    'Owner/ Founder',
    'CEO/ President',
    'VP/ Director',
    'Manager',
    'Any'
  ];

  const companySizeOptions = [
    'Any',
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-1000 employees',
    '1000+ employees'
  ];

  const sources = [
    'Google Maps',
    'LinkedIn',
    'Yellow Pages',
    'Company Websites'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSourceToggle = (source) => {
    setSelectedSources(prev => 
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleGenerateLeads = () => {
    console.log('Generating leads with:', { ...formData, selectedSources });
    // TODO: Implement lead generation logic
  };

  const handlePreviewWorkflow = () => {
    console.log('Previewing workflow');
    // TODO: Implement workflow preview
  };

  const handleOpenAreaSelection = () => {
    navigate('/area-selection');
  };

  const handleUseIndustryPackage = () => {
    console.log('Using industry package');
    // TODO: Implement industry package selection
  };

  return (
    <div className=" w-full p-1 ">
      

      {/* Main Form */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6 lg:p-8">
        {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-2">
              Lead Finder
            </h1>
            <p className="text-[var(--text-secondary)] text-sm lg:text-base">
              Search by industry, location, role, company size — live scraping multi-source.
            </p>
          </div>
          <button
            onClick={handlePreviewWorkflow}
            className="mt-4 lg:mt-0 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200" style={{ background: 'var(--btn-gradient)' }}
          >
            Preview Workflow
          </button>
        </div>
      </div>
                 <div className="space-y-6">
           {/* Row 1: Industry and Location */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Industry */}
             <div>
               <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                 Industry
               </label>
               <input
                 type="text"
                 value={formData.industry}
                 onChange={(e) => handleInputChange('industry', e.target.value)}
                 placeholder="e.g., Dentists"
                 className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200"
               />
             </div>

             {/* Location */}
             <div>
               <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                 Location
               </label>
               <input
                 type="text"
                 value={formData.location}
                 onChange={(e) => handleInputChange('location', e.target.value)}
                 placeholder="City State or Country — e.g., New York, USA"
                 className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200"
               />
             </div>
           </div>

           {/* Row 2: Role/Seniority and Company Size */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Role / Seniority */}
             <div>
               <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                 Role / Seniority
               </label>
               <select
                 value={formData.role}
                 onChange={(e) => handleInputChange('role', e.target.value)}
                 className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200"
               >
                 {roleOptions.map((role) => (
                   <option key={role} value={role}>{role}</option>
                 ))}
               </select>
             </div>

             {/* Company Size */}
             <div>
               <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                 Company Size
               </label>
               <select
                 value={formData.companySize}
                 onChange={(e) => handleInputChange('companySize', e.target.value)}
                 className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200"
               >
                 {companySizeOptions.map((size) => (
                   <option key={size} value={size}>{size}</option>
                 ))}
               </select>
             </div>
           </div>

           {/* Row 3: Keywords and Sources */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             {/* Keywords */}
             <div className='col-span-2'>
               <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                 Keywords (optional)
               </label>
               <input
                 type="text"
                 value={formData.keywords}
                 onChange={(e) => handleInputChange('keywords', e.target.value)}
                 placeholder="e.g., Invisalign, SaaS, ISO 27001"
                 className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200"
               />
             </div>

             {/* Sources */}
             <div>
               <div className="w-52 h-48 border border-[var(--border-input)] rounded-lg py-2 px-4">
                 <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                   Sources
                 </h3>
                 <div className="space-y-3">
                   {sources.map((source) => (
                     <label key={source} className="flex items-center space-x-3 cursor-pointer">
                       <input
                         type="checkbox"
                         checked={selectedSources.includes(source)}
                         onChange={() => handleSourceToggle(source)}
                         className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-input)] border-[var(--border-input)] rounded focus:ring-[var(--accent-primary)] focus:ring-2"
                       />
                       <span className="text-[var(--text-primary)] font-medium">{source}</span>
                     </label>
                   ))}
                 </div>
                 <p className="text-xs text-[var(--text-secondary)] mt-4 italic">
                   Ctrl / Cmd + click to multi-select.
                 </p>
               </div>
             </div>
           </div>
         </div>

        {/* Action Buttons */}
        <div className="w-2/3  pt-5 lg:pt-2">
          <div className="flex flex-col lg:flex-row gap-4">
            <button
              onClick={handleGenerateLeads}
              className="w-64 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-2 py-2 rounded-lg font-semibold text-lg transition-colors duration-200" style={{ background: 'var(--btn-gradient)' }}
            >
              Generate Leads (Live)
            </button>
            <button
              onClick={handleOpenAreaSelection}
              className="w-56 px-2 py-2 hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-input)] rounded-lg font-medium transition-colors duration-200"
            >
              Open Area Selection
            </button>
            <button
              onClick={handleUseIndustryPackage}
              className="w-56 px-2 py-2 hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-input)] rounded-lg font-medium transition-colors duration-200"
            >
              Use Industry Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
