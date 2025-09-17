import { useState } from "react";
import { registerUser } from "../service/authService";
import SignupHeader from "../components/signup/SignupHeader";
import NameFields from "../components/signup/NameFields";
import FormInput from "../components/signup/FormInput";
import FormDivider from "../components/signup/FormDivider";
import GoogleSignupButton from "../components/signup/GoogleSignupButton";
import SubmitButton from "../components/signup/SubmitButton";
import SignupFooter from "../components/signup/SignupFooter";
import Toast from "../components/global/Toast";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser({
        firstname: (formData.firstName || '').trim(),
        lastname: (formData.lastName || '').trim(),
        email: (formData.email || '').trim(),
        password: (formData.password || '').trim(),
      });
      
      // Show success toast
      setToast({
        show: true,
        message: 'Account created successfully! Please check your email to confirm your account.',
        type: 'success'
      });
      
      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      
    } catch (error) {
      console.error("Signup failed:", error);
      
      // Show error toast
      setToast({
        show: true,
        message: `Signup failed: ${error}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-[584px] rounded-[20px] shadow-2xl border backdrop-blur-sm bg-[var(--bg-secondary)] border-[var(--border-primary)]">
        <SignupHeader />
        <div className="px-6 sm:px-8 lg:px-10 pb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <NameFields formData={formData} handleChange={handleChange} />
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              placeholder="e.g. johnsmith@example.com"
              value={formData.email}
              onChange={handleChange}
              width="w-full"
            />
            <FormInput
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••••"
              value={formData.password}
              onChange={handleChange}
              width="w-full"
            />
            <FormDivider />
            <GoogleSignupButton />
            <SubmitButton isLoading={isLoading} />
          </form>
          <SignupFooter />
        </div>
      </div>
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={closeToast}
      />
    </div>
  );
}
