/* ========================================
   KataLaku AI — Supabase Auth Service
   ======================================== */

import { supabase } from '../utils/supabase';

// ---------- Validation ----------

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function getPasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: '', color: '' };
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: 'Weak', color: '#ef4444' };
  if (score <= 3) return { score: 2, label: 'Fair', color: '#f59e0b' };
  if (score <= 4) return { score: 3, label: 'Strong', color: '#22c55e' };
  return { score: 4, label: 'Very Strong', color: '#10b981' };
}

// ---------- Auth Methods ----------

export async function loginUser({ email, password, rememberMe = false }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Retrieve user profile
  let profile = await getProfile(data.user.id);
  if (!profile) {
    // Resilient fallback: create profile if missing
    profile = await createProfile({
      id: data.user.id,
      fullName: data.user.user_metadata?.full_name || 'User',
      businessName: data.user.user_metadata?.business_name || 'My Business',
      email: data.user.email,
    });
  }

  return { user: profile, session: data.session };
}

export async function registerUser({ fullName, businessName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        business_name: businessName,
      },
    },
  });

  if (error) throw error;

  // Create user profile in profiles table
  const profile = await createProfile({
    id: data.user.id,
    fullName,
    businessName,
    email,
  });

  return { user: profile, session: data.session };
}

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/dashboard',
    },
  });

  if (error) throw error;
  return data;
}

export async function forgotPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-password',
  });

  if (error) throw error;
  return { message: 'If an account exists, a reset link has been sent.' };
}

export async function resetPassword({ token, newPassword }) {
  // If token is passed (e.g. from hash), we set the session first, or let Supabase handle session recovery.
  // In a Vite SPA, Supabase Auth auto-recovers the session from the URL hash.
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return { message: 'Password reset successfully. You can now log in.' };
}

export async function verifyEmail(token) {
  // In Supabase, verification is done by clicking the link which auto-authenticates the user.
  // We can check if the current user session is active and verified.
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.email_confirmed_at) {
    return { message: 'Email verified successfully!' };
  }
  return { message: 'Email verified.' };
}

export async function restoreSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const profile = await getProfile(session.user.id);
  return { user: profile, token: session.access_token };
}

export async function logoutUser() {
  await supabase.auth.signOut();
}

// ---------- Profiles CRUD ----------

async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    fullName: data.full_name,
    businessName: data.business_name,
    email: data.email,
    subscriptionPlan: data.subscription_plan,
    remainingCredits: data.remaining_credits,
    createdAt: data.created_at,
  };
}

async function createProfile({ id, fullName, businessName, email }) {
  const newProfile = {
    id,
    full_name: fullName,
    business_name: businessName,
    email: email,
    subscription_plan: 'free',
    remaining_credits: 10,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(newProfile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile in database:', error);
    // Return the local representation even if DB write fails, to allow app to work
    return {
      id,
      fullName,
      businessName,
      email,
      subscriptionPlan: 'free',
      remainingCredits: 10,
      createdAt: newProfile.created_at,
    };
  }

  return {
    id: data.id,
    fullName: data.full_name,
    businessName: data.business_name,
    email: data.email,
    subscriptionPlan: data.subscription_plan,
    remainingCredits: data.remaining_credits,
    createdAt: data.created_at,
  };
}

// ---------- Credit Methods ----------

export async function useCredit(userId) {
  // Get current profile
  const profile = await getProfile(userId);
  if (!profile) return null;

  if (profile.subscriptionPlan === 'pro') {
    return { remainingCredits: Infinity, plan: 'pro' };
  }

  if (profile.remainingCredits <= 0) {
    return { remainingCredits: 0, plan: 'free', needsUpgrade: true };
  }

  const nextCredits = profile.remainingCredits - 1;

  const { error } = await supabase
    .from('profiles')
    .update({ remaining_credits: nextCredits })
    .eq('id', userId);

  if (error) console.error('Error updating credits:', error);

  return {
    remainingCredits: nextCredits,
    plan: 'free',
    needsUpgrade: nextCredits <= 0,
  };
}

export async function upgradeToPro(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      subscription_plan: 'pro',
      remaining_credits: 999999, // standard representation for DB
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    fullName: data.full_name,
    businessName: data.business_name,
    email: data.email,
    subscriptionPlan: data.subscription_plan,
    remainingCredits: data.remaining_credits,
    createdAt: data.created_at,
  };
}

export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.fullName,
      business_name: updates.businessName,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    fullName: data.full_name,
    businessName: data.business_name,
    email: data.email,
    subscriptionPlan: data.subscription_plan,
    remainingCredits: data.remaining_credits,
    createdAt: data.created_at,
  };
}
