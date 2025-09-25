import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";

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

export default function ProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "John Smith",
    email: "you@company.com",
    role: "Owner",
    credits: 0,
    subscriptionActive: false,
    planName: "",
    periodEnd: "",
  });

  const closeToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  const handleCancelSubscriptionImmediately = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE}/billing/cancel-subscription-immediately`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        setToast({
          show: true,
          message: `❌ Failed to cancel: ${json.error || "Unknown error"}`,
          type: "error",
        });
        return;
      }

      setToast({
        show: true,
        message: "✅ Subscription canceled immediately and credits removed.",
        type: "success",
      });

      setProfileData((prev) => ({
        ...prev,
        subscriptionActive: false,
        planName: "",
        credits: 0,
      }));
      setShowConfirmCancel(false); // close confirm modal
    } catch (err) {
      console.error("Cancel subscription error:", err);
      setToast({
        show: true,
        message: "❌ Error canceling subscription",
        type: "error",
      });
    }
  };

  const handleSave = async () => {
    setToast({
      show: true,
      message: "✅ Profile saved (demo only, no API yet).",
      type: "success",
    });
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

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

        const first = p.first_name || "";
        const last = p.last_name || "";
        const full =
          p.full_name || `${first} ${last}`.trim() || profileData.fullName;

        setProfileData({
          fullName: full,
          email:
            p.email || localStorage.getItem("userEmail") || profileData.email,
          role: p.role || profileData.role,
          credits:
            typeof p.credits === "number" ? p.credits : profileData.credits,
          subscriptionActive: !!p.subscription_active,
          planName: p.plan_name || "",
          periodEnd: p.subscription_current_period_end
            ? new Date(p.subscription_current_period_end).toLocaleDateString()
            : "",
        });
      } catch {
        // ignore silently
      }
    };

    if (isOpen) loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
        onClick={onClose}
        style={{
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      >
        <div
          className="bg-[var(--bg-primary)] rounded-xl sm:rounded-2xl border border-[var(--border-model)] shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--text-secondary)]">
                Account
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-[var(--text-muted)]">
                Manage team & billing
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base font-medium text-[var(--text-secondary)]"
              aria-label="Close modal"
            >
              Close
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Profile Information */}{" "}
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {" "}
                <div className="space-y-3 sm:space-y-4">
                  {" "}
                  <div>
                    {" "}
                    <label className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-1.5 sm:mb-2">
                      {" "}
                      Full name{" "}
                    </label>{" "}
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] focus:border-transparent transition-all duration-300 text-xs sm:text-sm md:text-base"
                      placeholder="Enter your full name"
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-1.5 sm:mb-2">
                      {" "}
                      Email{" "}
                    </label>{" "}
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] focus:border-transparent transition-all duration-300 text-xs sm:text-sm md:text-base"
                      placeholder="Enter your email"
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-1.5 sm:mb-2">
                      {" "}
                      Role{" "}
                    </label>{" "}
                    <input
                      type="text"
                      value={profileData.role}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] focus:border-transparent transition-all duration-300 text-xs sm:text-sm md:text-base"
                      placeholder="Enter your role"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 md:py-2 bg-gradient-to-r from-[var(--btn-primary)] to-[var(--btn-secondary)] text-[var(--bg-accent)] rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base"
                  style={{ background: "var(--btn-gradient)" }}
                >
                  {" "}
                  Save{" "}
                </button>{" "}
              </div>
              {/* Plan Info */}
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="w-full bg-[var(--bg-secondary)] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-[var(--border-primary)]">
                  <div className="mb-3 sm:mb-4 md:mb-6">
                    <div className="text-lg font-bold text-[var(--text-secondary)]">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[var(--text-secondary)] mb-1">
                        Plan
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] mb-1">
                        {profileData.subscriptionActive
                          ? profileData.planName || "Active subscription"
                          : "No active subscription"}
                      </p>
                    </div>
                    <div className="text-[var(--text-muted)]">
                      {profileData.subscriptionActive &&
                        profileData.periodEnd && (
                          <span className="text-xs sm:text-sm">
                            Renews on {profileData.periodEnd}
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 flex flex-col items-center">
                    {/* Credits + Status */}
                    <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 mb-2">
                      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md p-3 text-center">
                        <div className="text-xs sm:text-sm text-[var(--text-muted)]">
                          Credits
                        </div>
                        <div className="text-lg sm:text-xl font-semibold text-[var(--text-secondary)]">
                          {profileData.credits}
                        </div>
                      </div>
                      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md p-3 text-center">
                        <div className="text-xs sm:text-sm text-[var(--text-muted)]">
                          Status
                        </div>
                        <div className="text-lg sm:text-xl font-semibold text-[var(--text-secondary)]">
                          {profileData.subscriptionActive ? "Active" : "Free"}
                        </div>
                      </div>
                    </div>

                    {/* Manage Buttons */}
                    <button
                      onClick={() => {
                        onClose();
                        navigate("/billing-plans");
                      }}
                      className="w-full sm:w-40 md:w-48 px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base"
                    >
                      Manage Billing
                    </button>
                    <button className="w-full sm:w-40 md:w-48 px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base">
                      Manage Team
                    </button>

                    {/* Cancel Subscription Button */}
                    {profileData.subscriptionActive && (
                      <button
                        onClick={() => setShowConfirmCancel(true)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        Cancel Subscription
                      </button>
                    )}

                    {/* Toast */}
                    <Toast
                      message={toast.message}
                      type={toast.type}
                      isVisible={toast.show}
                      onClose={closeToast}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-[var(--bg-primary)] rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-3 text-white">Cancel Subscription</h3>
            <p className="text-sm text-slate-300 mb-4">
              Are you sure you want to cancel your subscription immediately?
              Your remaining credits will be removed.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmCancel(false)}
                 className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--btn-primary)] to-[var(--btn-secondary)]  text-white hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base"
              >
                No, Keep
              </button>
              <button
                onClick={handleCancelSubscriptionImmediately}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
