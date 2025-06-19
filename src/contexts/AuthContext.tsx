import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, expiresIn: number) => void;
  logout: () => void;
  token: string | null;
  user: {
    userId?: string;
    username?: string;
    role?: string;
  } | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  token: null,
  user: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [tokenTimer, setTokenTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Check if token exists in localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedExpiration = localStorage.getItem('tokenExpiration');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedExpiration && storedUser) {
      const expirationDate = new Date(storedExpiration).getTime();
      const now = new Date().getTime();
      
      // Check if token is still valid
      if (expirationDate > now) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Set timer for auto logout
        const remainingTime = expirationDate - now;
        setAutoLogoutTimer(remainingTime);
      } else {
        // Token expired, perform cleanup
        handleLogout();
      }
    }
  }, []);

  // Set a timer for auto logout when token expires
  const setAutoLogoutTimer = (duration: number) => {
    if (tokenTimer) {
      clearTimeout(tokenTimer);
    }
    
    const timer = setTimeout(() => {
      toast.error('Your session has expired. Please log in again.');
      handleLogout();
    }, duration);
    
    setTokenTimer(timer);
  };

  const login = (newToken: string, expiresIn: number) => {
    // Parse JWT to get user info
    const parsedToken = parseJwt(newToken);
    
    const user = {
      userId: parsedToken.userId,
      username: parsedToken.username,
      role: parsedToken.role
    };
    
    // Calculate expiration time
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    
    // Store in localStorage
    localStorage.setItem('token', newToken);
    localStorage.setItem('tokenExpiration', expirationDate.toISOString());
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update state
    setToken(newToken);
    setUser(user);
    
    // Set auto logout timer
    setAutoLogoutTimer(expiresIn * 1000);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('user');
    
    // Reset state
    setToken(null);
    setUser(null);
    
    // Clear timer
    if (tokenTimer) {
      clearTimeout(tokenTimer);
      setTokenTimer(null);
    }
    
    // Redirect to login
    navigate('/login');
  };

  // Helper function to parse JWT
  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return {};
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!token, 
        login, 
        logout: handleLogout, 
        token, 
        user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);