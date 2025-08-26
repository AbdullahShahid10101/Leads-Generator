import { useState } from 'react';

export default function DownloadsContent() {
  const [selectedList, setSelectedList] = useState('Dentists — NYC');
  const [format, setFormat] = useState('CSV');
  const [fields, setFields] = useState('company,contact,role,email,phone,website,location,status');

  // Mock data for download history
  const downloadHistory = [
    {
      id: 1,
      file: 'leads1.csv',
      format: 'CSV',
      created: '2025-08-20 14:32:10'
    },
    {
      id: 2,
      file: 'leads2.xlsx',
      format: 'XLSX',
      created: '2025-08-18 09:15:44'
    },
    {
      id: 3,
      file: 'leads3.csv',
      format: 'CSV',
      created: '2025-08-15 17:05:22'
    },
    {
      id: 4,
      file: 'leads4.json',
      format: 'JSON',
      created: '2025-08-13 08:41:37'
    }
  ];

  const handleStartDownload = () => {
    console.log('Starting download:', { selectedList, format, fields });
    // Here you would implement the download logic
  };

  return (
    <div className="flex-1 p-4 lg:p-6">
      {/* Main Container */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
        {/* Heading Area */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">
            Downloads
          </h1>
          <p className="text-[var(--text-muted)] text-xs lg:text-sm">
            Select format and fields
          </p>
        </div>

        {/* Two Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Download Options */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              Select format and fields
            </h2>
            
            <div className="space-y-6">
              {/* Choose List */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Choose list
                </label>
                <select
                  value={selectedList}
                  onChange={(e) => setSelectedList(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  <option value="Dentists — NYC">Dentists — NYC</option>
                  <option value="IT Services - CA">IT Services - CA</option>
                  <option value="Law Firms - Florida">Law Firms - Florida</option>
                  <option value="Restaurants - Texas">Restaurants - Texas</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  <option value="CSV">CSV</option>
                  <option value="XLSX">XLSX</option>
                  <option value="JSON">JSON</option>
                  <option value="PDF">PDF</option>
                </select>
              </div>

              {/* Fields */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Fields (comma-separated)
                </label>
                <input
                  type="text"
                  value={fields}
                  onChange={(e) => setFields(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="Enter fields separated by commas"
                />
              </div>

              {/* Start Download Button */}
              <button
                onClick={handleStartDownload}
                className="w-auto px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:bg-[var(--accent-secondary)] transition-colors duration-300"
                style={{ background: 'var(--btn-gradient)' }}
              >
                Start Download
              </button>
            </div>
          </div>

          {/* Right Panel - Download History */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              Download history
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-input)]">
                    <th className="px-4 py-2 text-left text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {downloadHistory.map((download) => (
                    <tr key={download.id} className="border-b border-[var(--border-input)] hover:bg-[var(--bg-input)] transition-colors duration-200">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--text-primary)]">
                          {download.file}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-secondary)]">
                          {download.format}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-secondary)]">
                          {download.created}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
