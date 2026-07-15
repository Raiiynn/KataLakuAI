import { useCredits } from '../context/CreditContext';
import { X, Sparkles, Zap, Calendar, Ban, Crown } from 'lucide-react';
import './UpgradeModal.css';

export default function UpgradeModal() {
  const { showUpgradeModal, closeUpgradeModal, upgradeToPro } = useCredits();

  if (!showUpgradeModal) return null;

  const handleUpgrade = () => {
    upgradeToPro();
  };

  return (
    <div className="upgrade-overlay" onClick={closeUpgradeModal}>
      <div className="upgrade-modal" onClick={e => e.stopPropagation()}>
        <button className="upgrade-close" onClick={closeUpgradeModal}>
          <X size={20} />
        </button>

        <div className="upgrade-header">
          <div className="upgrade-icon-wrapper">
            <Crown size={32} />
          </div>
          <h2 className="upgrade-title">Upgrade to Pro</h2>
          <p className="upgrade-subtitle">
            You've used all your free credits this month. Upgrade to unlock unlimited power!
          </p>
        </div>

        <div className="upgrade-price">
          <span className="upgrade-currency">Rp</span>
          <span className="upgrade-amount">19.000</span>
          <span className="upgrade-period">/month</span>
        </div>

        <ul className="upgrade-benefits">
          <li>
            <Sparkles size={18} />
            <span>Unlimited AI Caption Generations</span>
          </li>
          <li>
            <Zap size={18} />
            <span>Premium Writing Tones</span>
          </li>
          <li>
            <Calendar size={18} />
            <span>Unlimited Weekly Planner</span>
          </li>
          <li>
            <Ban size={18} />
            <span>No Ads Experience</span>
          </li>
        </ul>

        <button className="btn btn-primary btn-lg upgrade-cta" onClick={handleUpgrade}>
          <Crown size={18} />
          Upgrade to Pro
        </button>

        <button className="upgrade-skip" onClick={closeUpgradeModal}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
