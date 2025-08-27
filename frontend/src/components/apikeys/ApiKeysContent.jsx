import { useState } from 'react';

export default function ApiKeysContent() {
  const [apiKey, setApiKey] = useState('sk_live_abc123...');
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleRegenerateKey = () => {
    // Generate a new API key
    const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
  };

  const handleSaveWebhook = () => {
    // Handle webhook save logic
    console.log('Webhook saved:', webhookUrl);
  };

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6">
      {/* Main Container with Border and Secondary Background */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="space-y-6 sm:space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[var(--text-primary)] mb-1">
                API & Keys
              </h1>
              <p className="text-[var(--text-muted)] text-xs sm:text-sm lg:text-base">
                REST endpoints · Rate-limited · Webhooks
              </p>
            </div>
            <button
              onClick={handleRegenerateKey}
              className="px-3 sm:px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] transition-colors duration-300 text-xs sm:text-sm font-medium self-start sm:self-auto w-full sm:w-auto"
            >
              Regenerate Key
            </button>
          </div>

          {/* API Key and Webhook Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* API Key Card */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                API Key
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={apiKey}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] font-mono text-xs sm:text-sm focus:outline-none"
                />
                <p className="text-[var(--text-muted)] text-xs sm:text-sm">
                  Use Authorization: Bearer &lt;key&gt;
                </p>
              </div>
            </div>

            {/* Webhook Card */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                Webhook
              </h3>
              <div className="space-y-3">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs sm:text-sm"
                  placeholder="https://yourapp.com/webhook/leadharvest"
                />
                <button
                  onClick={handleSaveWebhook}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-input)] transition-colors duration-300 text-xs sm:text-sm font-medium"
                >
                  Save Webhook
                </button>
              </div>
            </div>
          </div>

          {/* Quick API docs Section */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6">
              Quick API docs
            </h3>

            <div className="space-y-4 sm:space-y-6 text-[var(--text-muted)]">
              {/* POST /v1/leads/search */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm font-bold">POST</span>
                  <code className="font-mono text-xs sm:text-sm break-all">/v1/leads/search</code>
                </div>
                <div className="ml-0 sm:ml-4 space-y-1">
                  <div className="text-xs sm:text-sm">
                    <span className="font-semibold">Body:</span> {'{ industry, role, size, location, keywords }'}
                  </div>
                  <div className="text-xs sm:text-sm">
                    <span className="font-semibold">Response:</span> jobId
                  </div>
                </div>
              </div>

              {/* GET /v1/jobs/{jobId}/status */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm font-bold">GET</span>
                  <code className="font-mono text-xs sm:text-sm break-all">/v1/jobs/{'{jobId}'}/status</code>
                </div>
              </div>

              {/* GET /v1/lists/{id} */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm font-bold">GET</span>
                  <code className="font-mono text-xs sm:text-sm break-all">/v1/lists/{'{id}'}</code>
                </div>
              </div>

              {/* GET /v1/lists/{id}/download */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm font-bold">GET</span>
                  <code className="font-mono text-xs sm:text-sm break-all">/v1/lists/{'{id}'}/download?format=csv</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
