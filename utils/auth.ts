
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface AdminUser {
  uid: string;
  username: string; // Email
  role: UserRole;
  name?: string;
  profilePicture?: string;
}

export const login = async (email: string, pass: string): Promise<boolean> => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) {
    console.error("Login error:", error.message);
    return false;
  }
  window.dispatchEvent(new Event('auth-change'));
  return true;
};

export const logout = async () => {
  await supabase.auth.signOut();
  window.dispatchEvent(new Event('auth-change'));
};

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Fetch profile data including role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setCurrentUser({
          uid: profile.id,
          username: profile.email,
          role: profile.role || 'USER',
          name: profile.name,
          profilePicture: profile.profile_picture
        });
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    window.addEventListener('auth-change', checkAuth);
    
    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  return { user: currentUser, loading, isAuth: !!currentUser };
};

export const getCurrentUser = (): AdminUser | null => {
  // Note: This is synchronous and might return null initially in a fresh page load 
  // before the async checkAuth completes. 
  // In a real app, prefer useAuth hook. This is kept for backward compatibility with existing utils.
  // We can try to grab from local storage token if needed, but for now we return null
  // or simple check.
  return null; 
};

export const registerUser = async (name: string, email: string, pass: string): Promise<boolean> => {
  const { error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        name: name,
      },
    },
  });

  if (error) {
    console.error("Signup error:", error.message);
    return false;
  }
  
  return true;
};

export const updateUser = async (email: string, data: { name?: string; profilePicture?: string }): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const updates: any = {};
  if (data.name) updates.name = data.name;
  if (data.profilePicture) updates.profile_picture = data.profilePicture;

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (!error) {
    window.dispatchEvent(new Event('auth-change'));
    return true;
  }
  return false;
};

// Admin Functions
export const getAdmins = async (): Promise<AdminUser[]> => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['ADMIN', 'SUPER_ADMIN']);
  
  return (data || []).map((p: any) => ({
    uid: p.id,
    username: p.email,
    role: p.role,
    name: p.name,
    profilePicture: p.profile_picture
  }));
};

export const getUsers = async (): Promise<AdminUser[]> => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'USER');

  return (data || []).map((p: any) => ({
    uid: p.id,
    username: p.email,
    role: p.role,
    name: p.name,
    profilePicture: p.profile_picture
  }));
};

// Note: Supabase Client SDK cannot delete users from auth.users easily without a server-side function.
// We will just delete the profile for now or set role to banned.
// For true deletion, you need a Supabase Edge Function.
export const deleteUser = async (username: string) => {
   // Placeholder: In real Supabase app, use Admin API
   console.log("Delete not fully supported in client-side only mode for:", username);
};

export const createAdmin = async (email: string, pass: string): Promise<boolean> => {
    // Requires Admin privs or Edge Function to set role immediately.
    // For now, register then manually update DB in Supabase Dashboard.
    return registerUser('Admin', email, pass);
};

export const deleteAdmin = async (username: string) => {
    return deleteUser(username);
};

export const resetPasswordWithRecovery = (username: string, code: string, newPass: string): { success: boolean, message: string } => {
    // Supabase handles this differently (via email link).
    // We will trigger a password reset email instead.
    supabase.auth.resetPasswordForEmail(username);
    return { success: true, message: "If account exists, password reset email sent." };
};
