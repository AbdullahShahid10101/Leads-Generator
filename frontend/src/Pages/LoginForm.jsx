import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from '../components/login/LoginHeader';
import { loginUser, resendConfirmationEmail } from '../service/authService';
import LoginForm from '../components/login/LoginForm';
import LoginDivider from '../components/login/LoginDivider';
import GoogleLoginButton from '../components/login/GoogleLoginButton';
import LoginButton from '../components/login/LoginButton';
import LoginFooter from '../components/login/LoginFooter';
import Toast from '../components/global/Toast';

export default function LoginFormPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [toastAction, setToastAction] = useState(null);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('Attempting login...');
      const result = await loginUser({ email, password });
      console.log('Login successful:', result);
      
      // Show success toast
      setToast({ show: true, message: 'Login successful! Redirecting to dashboard...', type: 'success' });
      setToastAction(null);
      
      // Navigate after a short delay to show the toast
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (e) {
      console.error('Login error:', e);
      if (typeof e === 'object' && e?.code) {
        if (e.code === 'email_not_confirmed') {
          setToast({ show: true, message: e.message, type: 'error' });
          setToastAction(() => handleResend);
        } else if (e.code === 'invalid_credentials') {
          setToast({ show: true, message: e.message, type: 'error' });
          setToastAction(null);
        } else {
          setToast({ show: true, message: e.message || 'Login failed', type: 'error' });
          setToastAction(null);
        }
      } else {
        const msg = typeof e === 'string' ? e : 'Login failed';
        setToast({ show: true, message: msg, type: 'error' });
        setToastAction(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Optional helper to resend confirmation
  const handleResend = async () => {
    try {
      if (!email) {
        setToast({ show: true, message: 'Enter your email first.', type: 'error' });
        return;
      }
      await resendConfirmationEmail(email);
      setToast({ show: true, message: 'Confirmation email sent.', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: String(err), type: 'error' });
    }
  };

  const closeToast = () => {
    setToast({ show: false, message: '', type: 'success' });
    setToastAction(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="w-[584px] h-auto rounded-[20px] bg-[var(--bg-secondary)] shadow-2xl border border-[var(--border-primary)] p-8">
        <LoginHeader />
        
        {/* Backend-driven auth — enter your credentials below */}

        <form onSubmit={(e) => e.preventDefault()}>
          <LoginForm 
            email={email} 
            setEmail={setEmail} 
            password={password} 
            setPassword={setPassword} 
          />
        </form>

        <LoginDivider />
        <GoogleLoginButton />
        <LoginButton isLoading={isLoading} onClick={handleSignIn} />
        <LoginFooter />
      </div>
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={closeToast}
        actionLabel={toastAction ? 'Resend confirmation' : undefined}
        onAction={toastAction || undefined}
      />
    </div>
  );
}
