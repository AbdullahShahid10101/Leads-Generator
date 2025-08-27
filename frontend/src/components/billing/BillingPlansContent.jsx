import { useState } from 'react';

export default function BillingPlansContent() {
  const [quantity, setQuantity] = useState(100);
  const [selectedTier, setSelectedTier] = useState('standard');

  const plans = [
    { name: 'Starter', price: '$29/mo', leads: '300', extra: '$0.20' },
    { name: 'Pro', price: '$59/mo', leads: '1,200', extra: '$0.18' },
    { name: 'Agency', price: '$149/mo', leads: '5,000', extra: '$0.15' },
    { name: 'Enterprise', price: 'Custom', leads: 'Unlimited', extra: 'Negotiable' }
  ];

  const tiers = [
    { id: 'standard', name: 'Standard ($0.20)', price: 0.20 },
    { id: 'premium', name: 'Premium ($0.25)', price: 0.25 },
    { id: 'enterprise', name: 'Enterprise ($0.30)', price: 0.30 }
  ];

  const selectedTierData = tiers.find(tier => tier.id === selectedTier);
  const estimatedCost = (quantity * selectedTierData.price).toFixed(2);

  const handleBuyCredits = () => {
    // Handle buy credits logic
    console.log('Buying credits:', { quantity, tier: selectedTier, cost: estimatedCost });
  };

  return (
    <div className="flex-1 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1">
          Billing & Plans
        </h1>
        <p className="text-[var(--text-muted)] text-sm lg:text-base">
          Pay-per-lead or subscription
        </p>
      </div>

      {/* Main Content - Two Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Plans Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-6">
            Plans
          </h2>
          
          {/* Plans Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-input)]">
                  <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">Plan</th>
                  <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">Price</th>
                  <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">Leads</th>
                  <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">Extra</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, index) => (
                  <tr 
                    key={plan.name} 
                    className={`border-b border-[var(--border-input)] ${index === plans.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <td className="py-3 px-2 text-[var(--text-primary)] font-medium">{plan.name}</td>
                    <td className="py-3 px-2 text-[var(--text-primary)]">{plan.price}</td>
                    <td className="py-3 px-2 text-[var(--text-primary)]">{plan.leads}</td>
                    <td className="py-3 px-2 text-[var(--text-primary)]">{plan.extra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pay-Per-Lead Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-6">
            Pay-Per-Lead
          </h2>
          
          <div className="space-y-6">
            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-sm"
                placeholder="Enter quantity"
                min="1"
              />
            </div>

            {/* Tier Dropdown */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Tier
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-sm"
              >
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Cost */}
            <div className="flex flex-row justify-between">
              
                <span className="text-[var(--text-muted)] pt-3 text-lg ">Est. Cost: ${estimatedCost}</span>
            {/* Buy Credits Button */}
            <button
              onClick={handleBuyCredits}
              className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-200 text-sm"
              style={{ background: 'var(--btn-gradient)' }}
            >
              Buy Credits
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
