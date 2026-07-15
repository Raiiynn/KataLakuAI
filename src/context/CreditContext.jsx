import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useCredit as useCreditService, upgradeToPro as upgradeToProService } from '../services/authService';

const CreditContext = createContext(null);

export function CreditProvider({ children }) {
  const { user, refreshUser, updateProfile } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const remainingCredits = user?.subscriptionPlan === 'pro' ? Infinity : (user?.remainingCredits ?? 0);
  const subscriptionPlan = user?.subscriptionPlan || 'free';
  const isPro = subscriptionPlan === 'pro';

  const consumeCredit = useCallback(async () => {
    if (!user) return null;

    if (user.subscriptionPlan === 'pro') {
      return { remainingCredits: Infinity, plan: 'pro' };
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
  }, [user, updateProfile, refreshUser]);

  const upgradeToPro = useCallback(async () => {
    if (!user) return;
    
    // Apply optimistic local update
    updateProfile({ subscriptionPlan: 'pro', remainingCredits: Infinity });
    
    await upgradeToProService(user.id);
    await refreshUser();
    setShowUpgradeModal(false);
  }, [user, updateProfile, refreshUser]);

  const openUpgradeModal = useCallback(() => setShowUpgradeModal(true), []);
  const closeUpgradeModal = useCallback(() => setShowUpgradeModal(false), []);

  const value = {
    remainingCredits,
    subscriptionPlan,
    isPro,
    showUpgradeModal,
    consumeCredit,
    upgradeToPro,
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
