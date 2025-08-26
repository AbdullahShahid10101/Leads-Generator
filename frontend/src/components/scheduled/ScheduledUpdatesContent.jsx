import { useState } from 'react';

export default function ScheduledUpdatesContent() {
  const [selectedList, setSelectedList] = useState('IT Services - CA');
  const [frequency, setFrequency] = useState('Weekly');
  const [notifyEmail, setNotifyEmail] = useState('temp@mail.com');

  // Mock data for existing schedules
  const existingSchedules = [
    {
      id: 1,
      list: 'IT Services - CA',
      frequency: 'Weekly',
      next: 'Next Mon'
    },
    {
      id: 2,
      list: 'Dentist - NYC',
      frequency: 'Monthly',
      next: 'Next Month'
    }
  ];

  const handleAddSchedule = () => {
    console.log('Adding schedule:', { selectedList, frequency, notifyEmail });
    // Here you would implement the schedule creation logic
  };

  const handleRemoveSchedule = (scheduleId) => {
    console.log('Removing schedule:', scheduleId);
    // Here you would implement the schedule removal logic
  };

  return (
    <div className="flex-1 p-4 lg:p-6">
      {/* Main Container */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
        {/* Heading Area */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">
            Scheduled Updates
          </h1>
          <p className="text-[var(--text-muted)] text-xs lg:text-sm">
            Normalize, deduplicate and run multi-step email checks (DNS/MX/SMTP + 3rd-party)
          </p>
        </div>

        {/* Two Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - New Schedule Form */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              New Schedule
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
                  <option value="IT Services - CA">IT Services - CA</option>
                  <option value="Dentist - NYC">Dentist - NYC</option>
                  <option value="Law Firms - Florida">Law Firms - Florida</option>
                  <option value="Restaurants - Texas">Restaurants - Texas</option>
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Daily">Daily</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                </select>
              </div>

              {/* Notify Email */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Notify Email
                </label>
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="Enter email address"
                />
              </div>

              {/* Add Schedule Button */}
              <button
                onClick={handleAddSchedule}
                className="w-auto px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:bg-[var(--accent-secondary)] transition-colors duration-300"
                style={{ background: 'var(--btn-gradient)' }}
              >
                Add Schedule
              </button>
            </div>
          </div>

          {/* Right Panel - Existing Schedules */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              Existing schedules
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-input)]">
                    <th className="px-3 py-2 text-left text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      List
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Next
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {existingSchedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-[var(--border-input)] hover:bg-[var(--bg-input)] transition-colors duration-200">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--text-primary)]">
                          {schedule.list}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-secondary)]">
                          {schedule.frequency}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-secondary)]">
                          {schedule.next}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleRemoveSchedule(schedule.id)}
                          className="px-3 py-3 bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors duration-300"
                        >
                          Remove
                        </button>
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
