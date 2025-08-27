import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../service/authService';

// Component to redirect authenticated users away from auth pages (signup/login)
export default function ProtectedRoute({ children, redirectTo = "/dashboard" }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  // If user is authenticated, don't render children (will redirect)
  if (isAuthenticated()) {
    return null;
  }

  // If user is not authenticated, render the auth page
  return children;
}
