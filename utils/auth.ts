import React from 'react';

const AUTH_TOKEN_KEY = 'sansarplus_auth_token';
const AUTH_USER_KEY = 'sansarplus_auth_user'; // Stores current logged in username
const ADMINS_STORAGE_KEY = 'sansarplus_admin_users';
const USERS_STORAGE_KEY = 'sansarplus_regular_users'; // New storage for regular users

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface AdminUser {
  username: string;
  password: string; // In a real app, this should be hashed.
  role: UserRole;
  email?: string; // Optional for admins, required for users usually
  name?: string; // Full name of the user
}

// Initialize Default Super Admin if not exists
const initAdmins = () => {
  const existing = localStorage.getItem(ADMINS_STORAGE_KEY);
  if (!existing) {
    const defaultSuperAdmin: AdminUser = {
      username: 'elovia22',
      password: 'Olivia@2023',
      role: 'SUPER_ADMIN',
      name: 'Super Admin'
    };
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify([defaultSuperAdmin]));
  }
};

// Ensure admins are initialized on load
initAdmins();

// --- ADMIN MANAGEMENT ---

export const getAdmins = (): AdminUser[] => {
  try {
    return JSON.parse(localStorage.getItem(ADMINS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const createAdmin = (username: string, pass: string): boolean => {
  const admins = getAdmins();
  if (admins.some(a => a.username === username)) {
    return false; // User exists
  }
  
  const newAdmin: AdminUser = {
    username,
    password: pass,
    role: 'ADMIN',
    name: username
  };
  
  admins.push(newAdmin);
  localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
  return true;
};

export const deleteAdmin = (username: string) => {
  let admins = getAdmins();
  admins = admins.filter(a => a.username !== username);
  localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
};

// --- REGULAR USER MANAGEMENT ---

export const getUsers = (): AdminUser[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const registerUser = (name: string, email: string, pass: string): boolean => {
  const users = getUsers();
  const admins = getAdmins();
  
  // Check if email already exists in users or admins
  if (users.some(u => u.username === email) || admins.some(a => a.username === email)) {
    return false;
  }

  const newUser: AdminUser = {
    username: email, // Using email as username for regular users
    password: pass,
    role: 'USER',
    email: email,
    name: name
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  // Auto login after register
  login(email, pass);
  return true;
};

export const deleteUser = (username: string) => {
  let users = getUsers();
  users = users.filter(u => u.username !== username);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// --- AUTHENTICATION ---

export const login = (username: string, pass: string): boolean => {
  initAdmins(); // Safety check
  
  const admins = getAdmins();
  const users = getUsers();
  
  // Check Admins first
  let user = admins.find(a => a.username === username && a.password === pass);
  
  // If not admin, check Users
  if (!user) {
    user = users.find(u => u.username === username && u.password === pass);
  }

  if (user) {
    // Generate a simple mock token
    const token = `token-${user.username}-${Date.now()}`;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, user.username);
    window.dispatchEvent(new Event('auth-change'));
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event('auth-change'));
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getCurrentUser = (): AdminUser | null => {
  const username = localStorage.getItem(AUTH_USER_KEY);
  if (!username) return null;
  
  // Check admins then users
  const admins = getAdmins();
  let user = admins.find(a => a.username === username);
  
  if (!user) {
      const users = getUsers();
      user = users.find(u => u.username === username);
  }
  
  return user || null;
};

export const getCurrentUserRole = (): UserRole | null => {
  const user = getCurrentUser();
  return user ? user.role : null;
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