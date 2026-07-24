import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useCredit as useCreditService, upgradeToPlan as upgradeToPlanService } from '../services/authService';

const CreditContext = createContext(null);

export function CreditProvider({ children }) {
  const { user, refreshUser, updateProfile } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const rawCredits = user?.remainingCredits ?? 0;
  const subscriptionPlan = user?.subscriptionPlan || 'free';
  const isPro = subscriptionPlan === 'pro';

  // Proteksi data lama jika database menyimpan 999999 untuk pro
  const remainingCredits = subscriptionPlan === 'pro' && rawCredits > 200 
    ? 200 
    : rawCredits;

  const consumeCredit = useCallback(async () => {
    if (!user) return null;

    if (user.remainingCredits <= 0) {
      setShowUpgradeModal(true);
      return { remainingCredits: 0, plan: subscriptionPlan, needsUpgrade: true };
    }

    const nextCredits = user.remainingCredits > 0 ? user.remainingCredits - 1 : 0;

    // 1. Apply optimistic local update for immediate UI feedback
    updateProfile({ remainingCredits: nextCredits });

    // 2. Persist update to Supabase DB
    const result = await useCreditService(user.id);
    if (!result) return null;

    if (result.needsUpgrade) {
      setShowUpgradeModal(true);
    }

    // 3. Refresh user profile asynchronously to sync with DB
    await refreshUser();
    return result;
  }, [user, updateProfile, refreshUser, subscriptionPlan]);

  const upgradeToPlan = useCallback(async (plan) => {
    if (!user) return;
    
    const credits = 200;
    
    // Apply optimistic local update
    updateProfile({ subscriptionPlan: plan, remainingCredits: credits });
    
    await upgradeToPlanService(user.id, plan);
    await refreshUser();
    setShowUpgradeModal(false);
  }, [user, updateProfile, refreshUser]);

  const openUpgradeModal = useCallback(() => setShowUpgradeModal(true), []);
  const closeUpgradeModal = useCallback(() => setShowUpgradeModal(false), []);

  const upgradeToPro = useCallback(() => upgradeToPlan('pro'), [upgradeToPlan]);

  const value = {
    remainingCredits,
    subscriptionPlan,
    isPro,
    showUpgradeModal,
    consumeCredit,
    upgradeToPro,
    upgradeToPlan,
    openUpgradeModal,
    closeUpgradeModal,
  };

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
}
