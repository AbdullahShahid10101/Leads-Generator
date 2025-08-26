import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleMap from './GoogleMap';

export default function AreaSelectionContent() {
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState({
    city: 'New York, USA',
    radius: '25'
  });

  const handleInputChange = (field, value) => {
    setSelectedArea(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If city is changed, geocode it to update the map
    if (field === 'city' && value && window.geocodeCity) {
      window.geocodeCity(value);
    }
  };

  const handleApplyArea = () => {
    console.log('Applying area:', selectedArea);
    // TODO: Implement area application logic
  };

  const handleBackToFinder = () => {
    navigate('/lead-finder');
  };

  return (
    <div className="w-full p-1">
    

      {/* Main Content */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6 lg:p-8">
          {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-2">
              Area Selection
            </h1>
            <p className="text-[var(--text-secondary)] text-sm lg:text-base">
              Pick exact city, state, country or draw a custom radius.
            </p>
          </div>
          {/* Selected Area Display */}
          <div className="mt-4 lg:mt-0 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-4 py-2">
            <div className="text-sm text-[var(--text-primary)]">
              <span className="font-medium">Selected:</span> {selectedArea.city} · Radius: {selectedArea.radius} km
            </div>
          </div>
        </div>
      </div>
        {/* Map Section */}
        <div className="mb-8">
          <div className="relative bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg overflow-hidden" style={{ height: '350px' }}>
            <GoogleMap 
              selectedArea={selectedArea} 
              onAreaChange={setSelectedArea}
            />
          </div>
        </div>

        {/* Input Fields */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* City / State / Country */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                City / State / Country
              </label>
              <input
                type="text"
                value={selectedArea.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter city, state, or country"
                className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Radius (km)
              </label>
              <input
                type="number"
                value={selectedArea.radius}
                onChange={(e) => handleInputChange('radius', e.target.value)}
                placeholder="Enter radius in kilometers"
                min="1"
                max="1000"
                className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col lg:flex-row gap-4">
          <button
            onClick={handleApplyArea}
            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200" style={{ background: 'var(--btn-gradient)' }}
          >
            Apply Area
          </button>
          <button
            onClick={handleBackToFinder}
            className="px-4 py-2 bg-transparent hover:bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-input)] rounded-lg font-medium transition-colors duration-200"
          >
            Back to Finder
          </button>
        </div>
      </div>
    </div>
  );
}
