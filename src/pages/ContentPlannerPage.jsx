import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCredits } from '../context/CreditContext';
import { useToast } from '../context/ToastContext';
import { 
  fetchWeeklyPlan, 
  generateWeeklyPlan, 
  getMondayOfThisWeek 
} from '../services/plannerService';
import { CalendarDays, Sparkles, ArrowRight, RefreshCw, Zap, ShieldCheck, Heart } from 'lucide-react';
import './ProtectedPages.css';

const DAYS_FULL = {
  Monday: 'Senin',
  Tuesday: 'Selasa',
  Wednesday: 'Rabu',
  Thursday: 'Kamis',
  Friday: 'Jumat',
  Saturday: 'Sabtu',
  Sunday: 'Minggu'
};

export default function ContentPlannerPage() {
  const { user } = useAuth();
  const { isPro, openUpgradeModal } = useCredits();
  const toast = useToast();
  const navigate = useNavigate();

  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const weekStart = getMondayOfThisWeek();

  useEffect(() => {
    async function loadPlan() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const plan = await fetchWeeklyPlan(user.id, weekStart);
        setWeeklyPlan(plan);
      } catch (err) {
        console.error('Error loading weekly plan:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPlan();
  }, [user, weekStart]);

  const handleGenerate = async () => {
    if (!user?.id) return;
    
    if (!user.productCategory) {
      toast.warning('Silakan pilih kategori produk utama Anda terlebih dahulu di menu Settings.');
      navigate('/settings');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateWeeklyPlan(user.id, user.productCategory, isPro);
      if (result.error === 'QUOTA_EXCEEDED') {
        toast.error('Quota mingguan tercapai. Upgrade ke Pro untuk mendapatkan unlimited plan!');
        openUpgradeModal();
        return;
      }

      setWeeklyPlan(result.planData);
      toast.success('Rencana konten mingguan berhasil dibuat!');
    } catch (err) {
      toast.error('Gagal membuat rencana konten harian.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrefillCaption = (theme, reasoning) => {
    // Redirect to caption generator and pass state
    navigate('/caption-generator', {
      state: {
        prefilledTheme: theme,
        prefilledDescription: `Tema Konten: ${theme}. Konteks: ${reasoning}`
      }
    });
  };

  const productCategoryLabel = {
    fashion: 'Fashion',
    food: 'Food & Beverage',
    beauty: 'Beauty & Skincare',
    electronics: 'Electronics',
    home_living: 'Home & Living',
    other: 'Lainnya'
  }[user?.productCategory] || 'Belum diatur';

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1><CalendarDays size={28} /> AI Content Planner</h1>
          <p>Dapatkan ide tema konten harian yang dirancang khusus oleh AI untuk bisnis Anda.</p>
        </div>
        {user?.productCategory && (
          <div className="badge-category" style={{ background: 'var(--surface-100)', border: '1px solid var(--glass-border)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Kategori: <strong>{productCategoryLabel}</strong>
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="spinner spinner-lg spinner-primary" style={{ margin: '0 auto var(--space-4)' }} />
          <p>Memuat rencana konten...</p>
        </div>
      ) : weeklyPlan ? (
        <div className="planner-container">
          {/* Top Banner / Actions */}
          <div className="planner-top-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--surface-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Rencana Minggu Ini ({weekStart})</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                {isPro ? '✨ Anda menikmati akses pembuatan rencana konten tanpa batas.' : '🔒 Akun Free terbatas 1x pembuatan rencana per minggu.'}
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleGenerate} disabled={isGenerating}>
              <RefreshCw size={14} className={isGenerating ? 'spin' : ''} style={{ marginRight: '6px' }} />
              Generate Ulang Rencana Konten
            </button>
          </div>

          {/* 7 Days Cards */}
          <div className="planner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
            {weeklyPlan.week_plan.map((dayPlan, idx) => {
              const localDay = DAYS_FULL[dayPlan.day] || dayPlan.day;
              return (
                <div key={idx} className="planner-day-card card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5)', borderLeft: '4px solid var(--primary-500)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <span className="day-badge" style={{ background: 'var(--surface-200)', color: 'var(--primary-400)', fontSize: 'var(--text-xs)', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                        {localDay}
                      </span>
                    </div>
                    <h3 className="day-theme-title" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                      {dayPlan.theme}
                    </h3>
                    <p className="day-reasoning" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {dayPlan.reasoning}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handlePrefillCaption(dayPlan.theme, dayPlan.reasoning)}
                    className="btn btn-primary btn-sm"
                  >
                    Tulis Caption <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Free watermark label */}
          {!isPro && (
            <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              ⚡ Rencana konten dibuat menggunakan versi Free Plan
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="card empty-state" style={{ padding: 'var(--space-16) var(--space-8)', textAlign: 'center', background: 'var(--surface-50)', border: '1px solid var(--glass-border)' }}>
          <div className="onboarding-icon-wrapper" style={{ margin: '0 auto var(--space-4)' }}>
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            Mulai Jadwal Konten Anda Dengan AI
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto var(--space-6)', lineHeight: 1.6 }}>
            Dapatkan rekomendasi ide dan tema konten mingguan yang spesifik dirancang sesuai dengan kategori produk jualan Anda.
          </p>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="spin" style={{ marginRight: '8px' }} />
                Sedang Membuat Rencana...
              </>
            ) : (
              <>
                <Sparkles size={16} style={{ marginRight: '8px' }} />
                Generate Rencana Konten Mingguan
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
