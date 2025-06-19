import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function ProtectedRoute() {
  const { isAuthenticated, token, logout } = useAuth();
  const location = useLocation();

  // Check if token is valid
  useEffect(() => {
    if (token) {
      try {
        // Parse the token
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }

        // Decode the payload
        const payload = JSON.parse(atob(tokenParts[1]));
        
        // Check if token is expired
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        
        if (exp < now) {
          toast.error('Your session has expired. Please log in again.');
          logout();
        }
      } catch (error) {
        console.error('Error validating token:', error);
      }
    }
  }, [token, location.pathname, logout]);

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}