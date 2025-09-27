import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function DashboardContent() {
  const navigate = useNavigate();
  const [planLabel, setPlanLabel] = useState("Free");
  const [credits, setCredits] = useState(null);
  const [recentLists, setRecentLists] = useState([]); 

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const payload = decodeJwt(token);
        const userId = payload?.sub || payload?.user_id || payload?.id;
        if (!userId) return;
        const res = await fetch(`${API_BASE}/profiles/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const p = json?.data || {};
        const label = p.subscription_active ? p.plan_name || "Active" : "Free";
        setPlanLabel(label);
        if (typeof p.credits === "number") setCredits(p.credits);
      } catch (_) {}
    };
    const loadRecentLists = async () => {
      const token = localStorage.getItem("access_token"); // or however you store it
      const res = await fetch(`${API_BASE}/recentlists/recent`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        console.error("Unauthorized - token missing or expired");
        return;
      }

      const data = await res.json();
      const lists = Array.isArray(data) ? data : data.data || [];
      // Show only the first 4 recent lists
      setRecentLists(lists.slice(0, 4));
    };

    loadRecentLists();
    loadProfile();
  }, []);

  const goToLeadFinder = () => navigate("/lead-finder");
  const newLeadSearch = () => navigate("/area-selection");
  
  const openList = (industry, location) => {
    navigate(`/recent-list-details?industry=${encodeURIComponent(industry)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <main className="flex-1 bg-[var(--bg-primary)] p-2 sm:p-4 border border-[var(--border-input)] rounded-2xl scroll-smooth overflow-y-auto">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-secondary)] mb-2">
            Welcome back 👋
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)]">
            Real-time scraping • Multi-source • Email verification
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button className=" h-auto px-3 sm:px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-colors text-sm">
            {`Plan: ${planLabel}`}
            {typeof credits === "number" ? ` • Credits: ${credits}` : ""}
          </button>
          <button
            onClick={newLeadSearch}
            className="h-auto items-center px-4 sm:px-4 py-2 sm:py-2 bg-gradient-to-r from-[var(--btn-primary)] to-[var(--btn-secondary)] text-[var(--bg-accent)] rounded-lg font-semibold hover:shadow-lg transition-shadow text-sm sm:text-sm"
            style={{ background: "var(--btn-gradient)" }}
          >
            New Lead Search
          </button>
        </div>
      </div>

      {/* Live Engine Snapshot Card and Quick Actions Card - Responsive Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Live Engine Snapshot Card */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-3 sm:p-4 border border-[var(--border-primary)] scroll-smooth">
          <div className="flex items-start sm:items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-secondary)] mb-1">
                Live engine snapshot
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                Real-time scraping • Multi-source • Verification
              </p>
              <span className="text-xs text-[var(--text-muted)]">
                Updated: Aug 16, 2025
              </span>
            </div>
          </div>

          {/* Metrics - Responsive Grid */}
          <div className="grid grid-cols-3 gap-4 sm:gap-10 mb-4">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-[var(--text-muted)] mb-1">
                Scraped
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text-secondary)]">
                1,248
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-[var(--text-muted)] mb-1">
                Cleaned
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text-secondary)]">
                1,190
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-[var(--text-muted)] mb-1">
                Verified
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text-secondary)]">
                1,132
              </div>
            </div>
          </div>

          {/* Action Buttons - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-6 sm:my-12">
              <button
                onClick={() => recentLists.length > 0 && openList(recentLists[0].industry, recentLists[0].location)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 ${
                  recentLists.length === 0 
                    ? 'text-[var(--text-muted)] bg-[var(--bg-primary)] border border-[var(--border-primary)] cursor-not-allowed opacity-50' 
                    : 'text-[var(--text-secondary)]'
                }`}
                style={recentLists.length > 0 ? { background: "var(--btn-gradient)" } : {}}
                disabled={recentLists.length === 0}
              >
                Open Latest List
              </button>
              <button className="px-3 sm:px-4 py-2 text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-all duration-300 hover:scale-105 text-sm">
                Auto-refresh
              </button>
              <button className="px-3 sm:px-4 py-2 text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-all duration-300 hover:scale-105 text-sm">
                Queue
              </button>
            </div>
        </div>

        {/* Combined Quick Actions and Recent Lists Card */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-3 sm:p-4 border border-[var(--border-primary)] scroll-smooth">
          {/* Quick Actions Section */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--text-secondary)] mb-1">
              Quick Actions
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-4">
              One-click
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-6 sm:my-12">
              <button
                onClick={goToLeadFinder}
                className="px-3 sm:px-4 py-2 text-[var(--text-secondary)] rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105"
                style={{ background: "var(--btn-gradient)" }}
              >
                Lead Finder
              </button>
              <button className="px-3 sm:px-4 py-2 text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-all duration-300 hover:scale-105 text-sm">
                Industry Packages
              </button>
              <button className="px-3 sm:px-4 py-2 text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-all duration-300 hover:scale-105 text-sm">
                Connect CRM
              </button>
            </div>
          </div>

          {/* Recent Lists Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--text-muted)] mb-2">
              Recent lists
            </h3>

            {/* Column Headers - Hidden on very small screens */}
            <div className="hidden sm:flex items-center justify-between py-2 px-3 mb-3 border-b border-[var(--border-primary)] last:border-b-0">
              <div className="flex-1 font-medium text-[var(--text-muted)] text-sm">
                List
              </div>
              <div className="w-20 text-center font-medium text-[var(--text-muted)] text-sm">
                Created
              </div>
              <div className="w-20 text-center font-medium text-[var(--text-muted)] text-sm">
                Verified
              </div>
              <div className="w-20 text-center font-medium text-[var(--text-muted)] text-sm">
                Action
              </div>
            </div>

            <div className="space-y-3">
              {recentLists.length === 0 ? (
                <div className="text-sm text-[var(--text-muted)] text-center py-4">
                  No recent lists yet.
                </div>
              ) : (
                recentLists.map((list, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-[var(--border-primary)] last:border-b-0 space-y-2 sm:space-y-0 hover:bg-[var(--bg-primary)] transition-all duration-300 rounded-lg px-2"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-[var(--text-secondary)] text-sm sm:text-base">
                        {list.industry} - {list.location}
                      </div>
                      <div className="sm:hidden text-xs text-[var(--text-muted)]">
                        {new Date(list.created_at).toLocaleDateString()} •{" "}
                        {list.verified_count} verified
                      </div>
                    </div>
                    <div className="hidden sm:block w-20 text-center text-sm text-[var(--text-secondary)]">
                      {new Date(list.created_at).toLocaleDateString()}
                    </div>
                    <div className="hidden sm:block w-20 text-center text-sm text-[var(--text-secondary)]">
                      {list.verified_count}
                    </div>
                    <div className="w-full sm:w-16 text-center">
                      <button
                        onClick={() => openList(list.industry, list.location)}
                        className="w-full sm:w-auto px-3 py-1 text-[var(--text-secondary)] rounded text-sm border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-all duration-300 hover:scale-105"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
