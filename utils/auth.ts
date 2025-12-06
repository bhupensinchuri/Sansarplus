import React from 'react';

const AUTH_KEY = 'sansarplus_auth_token';
const MOCK_TOKEN = 'admin-secret-token-123';

export const login = (username: string, pass: string): boolean => {
  // Updated credentials as requested
  if (username === 'elovia22' && pass === 'Olivia@2023') {
    localStorage.setItem(AUTH_KEY, MOCK_TOKEN);
    window.dispatchEvent(new Event('auth-change'));
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('auth-change'));
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === MOCK_TOKEN;
};

// Hook to track auth state in components
export const useAuth = () => {
  const [isAuth, setIsAuth] = React.useState(isAuthenticated());

  React.useEffect(() => {
    const handleAuthChange = () => setIsAuth(isAuthenticated());
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  return isAuth;
};