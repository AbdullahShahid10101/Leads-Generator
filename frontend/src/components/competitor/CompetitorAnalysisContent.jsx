import React from 'react';
import CheckIcon from '../../assets/check.png';
import XIcon from '../../assets/x.png';
import WarningIcon from '../../assets/triangle-alert.png';

export default function CompetitorAnalysisContent() {
  const competitors = [
    { name: 'LeadHarvest AI', isHighlighted: true },
    { name: 'Apollo.io' },
    { name: 'ZoomInfo' },
    { name: 'Hunter.io' },
    { name: 'Lusha' }
  ];

  const features = [
    {
      name: 'Real-time scraping',
      leadHarvest: 'check',
      apollo: 'x',
      zoomInfo: 'x',
      hunter: 'x',
      lusha: 'x'
    },
    {
      name: 'Multi-source data',
      leadHarvest: 'check',
      apollo: 'x',
      zoomInfo: 'x',
      hunter: 'x',
      lusha: 'x'
    },
    {
      name: 'Email verification',
      leadHarvest: 'check',
      apollo: 'check',
      zoomInfo: 'check',
      hunter: 'check',
      lusha: 'check'
    },
    {
      name: 'Area selection',
      leadHarvest: 'check',
      apollo: 'warning',
      zoomInfo: 'warning',
      hunter: 'x',
      lusha: 'x'
    },
    {
      name: 'Pay-per-lead',
      leadHarvest: 'check',
      apollo: 'x',
      zoomInfo: 'x',
      hunter: 'x',
      lusha: 'x'
    }
  ];

  const renderStatus = (status) => {
    switch (status) {
      case 'check':
        return (
          <div className="flex justify-center">
            <img src={CheckIcon} alt="Check" className="w-4 h-4" />
          </div>
        );
      case 'x':
        return (
          <div className="flex justify-center">
            <img src={XIcon} alt="X" className="w-4 h-4" />
          </div>
        );
      case 'warning':
        return (
          <div className="flex justify-center">
            <img src={WarningIcon} alt="Warning" className="w-4 h-4" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1">
          Competitor Analysis
        </h1>
        <p className="text-[var(--text-muted)] text-sm lg:text-base">
          How LeadHarvest AI stacks up
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-input)]">
                <th className="text-left py-4 px-4 font-semibold text-[var(--text-primary)] text-sm">
                  Feature
                </th>
                                 {competitors.map((competitor) => (
                   <th 
                     key={competitor.name}
                     className="text-center py-4 px-4 font-semibold text-[var(--text-primary)] text-sm"
                   >
                     {competitor.name}
                   </th>
                 ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr 
                  key={feature.name}
                  className={`border-b border-[var(--border-input)]`}
                >
                  <td className="py-4 px-4 text-[var(--text-primary)] font-medium text-sm">
                    {feature.name}
                  </td>
                                     <td className="py-4 px-4 text-center">
                     {renderStatus(feature.leadHarvest)}
                   </td>
                  <td className="py-4 px-4 text-center">
                    {renderStatus(feature.apollo)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {renderStatus(feature.zoomInfo)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {renderStatus(feature.hunter)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {renderStatus(feature.lusha)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
