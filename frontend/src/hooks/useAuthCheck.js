import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../service/authService';

export function useAuthCheck(setToast) {
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) {
      return;
    }

    const authStatus = checkAuthStatus();
    
    if (!authStatus.isValid) {
      // Mark that we're redirecting to prevent multiple calls
      hasRedirected.current = true;
      
      let message = 'Authentication required. Please login.';
      
      if (authStatus.reason === 'expired') {
        message = 'Session expired. Please login again.';
      } else if (authStatus.reason === 'invalid') {
        message = 'Authentication error. Please login again.';
      }
      
      // Show toast message
      if (setToast) {
        setToast({
          show: true,
          message: message,
          type: 'error'
        });
      }
      
      // Redirect to login after a short delay to show the toast
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    }
  }, [navigate, setToast]);
}
