import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import {
  loginUser,
  registerUser,
  loginWithGoogle as loginWithGoogleService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  verifyEmail as verifyEmailService,
  restoreSession,
  logoutUser,
  updateUserProfile,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session and subscribe to auth state changes
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const result = await restoreSession();
        if (result && mounted) {
          setUser(result.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session) {
        const result = await restoreSession();
        if (result) {
          setUser(result.user);
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const result = await loginUser({ email, password, rememberMe });
    setUser(result.user);
    setIsAuthenticated(true);
    return result;
  }, []);

  const register = useCallback(async ({ fullName, businessName, email, password }) => {
    const result = await registerUser({ fullName, businessName, email, password });
    setUser(result.user);
    setIsAuthenticated(true);
    return result;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const result = await loginWithGoogleService();
    return result;
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return await forgotPasswordService(email);
  }, []);

  const resetUserPassword = useCallback(async ({ token, newPassword }) => {
    return await resetPasswordService({ token, newPassword });
  }, []);

  const verifyUserEmail = useCallback(async (token) => {
    const result = await verifyEmailService(token);
    const session = await restoreSession();
    if (session) {
      setUser(session.user);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user) return;
    const updatedUser = await updateUserProfile(user.id, updates);
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    const session = await restoreSession();
    if (session) {
      setUser(session.user);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    loginWithGoogle,
    forgotPassword,
    resetPassword: resetUserPassword,
    verifyEmail: verifyUserEmail,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
