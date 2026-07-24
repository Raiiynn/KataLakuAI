import { useCredits } from '../context/CreditContext';
import { X, Crown, Check } from 'lucide-react';
import './UpgradeModal.css';

export default function UpgradeModal() {
  const { showUpgradeModal, closeUpgradeModal, upgradeToPlan } = useCredits();

  if (!showUpgradeModal) return null;

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
          <h2 className="upgrade-title">Upgrade ke Pro Creator</h2>
          <p className="upgrade-subtitle">
            Kembangkan bisnis Anda ke level berikutnya dengan fitur AI unggulan dari KataLaku AI.
          </p>
        </div>

        <div className="upgrade-plans-grid">
          {/* Pro Creator Plan */}
          <div className="upgrade-plan-card popular">
            <div className="plan-badge">Paling Populer</div>
            <h3 className="plan-name">Pro Creator</h3>
            <p className="plan-desc">Untuk pertumbuhan cepat media sosial</p>
            <div className="plan-price">
              <span className="price-currency">Rp</span>
              <span className="price-amount">19k</span>
              <span className="price-period">/bulan</span>
            </div>
            <ul className="plan-features">
              <li><Check size={16} /> 200 Kredit / Bulan</li>
              <li><Check size={16} /> AI Engine Prioritas (Lebih Cepat)</li>
              <li><Check size={16} /> Akses Content Planner Penuh</li>
              <li><Check size={16} /> Riwayat Selamanya</li>
              <li><Check size={16} /> Akses Fitur Premium Baru</li>
            </ul>
            <button
              className="btn btn-primary upgrade-cta"
              onClick={() => upgradeToPlan('pro')}
            >
              Upgrade ke Pro
            </button>
          </div>
        </div>

        <button className="upgrade-skip" onClick={closeUpgradeModal}>
          Mungkin Nanti
        </button>
      </div>
    </div>
  );
}

