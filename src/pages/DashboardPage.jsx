import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCredits } from '../context/CreditContext';
import { supabase } from '../utils/supabase';
import { getNotificationPreferences } from '../services/authService';
import { Link } from 'react-router-dom';
import {
  Sparkles, Clock, CalendarDays, Zap, Crown,
  TrendingUp, MessageSquare, Target, FileBarChart
} from 'lucide-react';
import WeeklyReportModal from '../components/WeeklyReportModal';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { remainingCredits, isPro, openUpgradeModal, subscriptionPlan } = useCredits();

  const [captionsCount, setCaptionsCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [hasWeeklyPlan, setHasWeeklyPlan] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [weeklyReportEnabled, setWeeklyReportEnabled] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;
      try {
        const { count: capCount, error: capError } = await supabase
          .from('captions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (!capError) {
          setCaptionsCount(capCount || 0);
        }

        // Check if weekly content plan exists
        const weekStart = getMondayOfThisWeek();
        const { data: planData } = await supabase
          .from('content_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('week_start_date', weekStart)
          .maybeSingle();

        // Also check local storage fallback
        const hasLocal = localStorage.getItem(`local_plan_${weekStart}`);
        setHasWeeklyPlan(!!planData || !!hasLocal);

        const { count: plCount, error: plError } = await supabase
          .from('planner_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (!plError) {
          setPostsCount(plCount || 0);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    }
    fetchStats();

    // Check if weekly report notification is enabled
    if (user?.id) {
      const prefs = getNotificationPreferences(user.id);
      setWeeklyReportEnabled(prefs.weeklyReport);
    }
  }, [user]);

  // Helper: Get Monday of the current week (YYYY-MM-DD)
  function getMondayOfThisWeek() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  // Calculate simulated Engagement Rate based on product category & generation activity
  const getEstimatedEngagementRate = () => {
    if (captionsCount === 0) return '—';
    const baseRates = {
      fashion: 4.8,
      food: 5.5,
      beauty: 5.1,
      electronics: 3.8,
      home_living: 4.2,
      other: 4.5
    };
    const rate = baseRates[user?.productCategory] || baseRates.other;
    // Add small random variation based on captionsCount to make it feel alive
    const variation = Math.min(2.5, (captionsCount * 0.1));
    return `${(rate + variation).toFixed(1)}%`;
  };

  const totalPostsPlanned = postsCount + (hasWeeklyPlan ? 7 : 0);
  const creditsDisplay = remainingCredits;
  const greeting = getGreeting();

  return (
    <div className="dashboard animate-fade-in-up">
      {/* Welcome Section */}
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-text">
          <h1>{greeting}, {user?.fullName?.split(' ')[0] || 'there'}! 👋</h1>
          <p>Ready to create engaging captions for <strong>{user?.businessName || 'your business'}</strong>?</p>
        </div>
        <Link to="/caption-generator" className="btn btn-primary btn-lg">
          <Sparkles size={18} />
          Generate Caption
        </Link>
      </section>

      {/* Stats Grid */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon credits-icon">
            {isPro ? <Crown size={22} /> : <Zap size={22} />}
          </div>
          <div className="stat-info">
            <span className="stat-value">{creditsDisplay}</span>
            <span className="stat-label">
              {subscriptionPlan === 'business'
                ? 'Business Plan'
                : subscriptionPlan === 'pro'
                ? 'Pro Creator Plan'
                : 'Kredit Tersisa'}
            </span>
          </div>
          {subscriptionPlan !== 'business' && (
            <button className="stat-action" onClick={openUpgradeModal}>
              Upgrade
            </button>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon generate-icon">
            <MessageSquare size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{captionsCount}</span>
            <span className="stat-label">Captions Generated</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon trend-icon">
            <TrendingUp size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{getEstimatedEngagementRate()}</span>
            <span className="stat-label">{captionsCount > 0 ? 'Est. Niche Engagement' : 'Engagement Rate'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon target-icon">
            <Target size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalPostsPlanned}</span>
            <span className="stat-label">Posts Planned</span>
          </div>
        </div>
      </section>

      {/* Weekly Report Banner */}
      {weeklyReportEnabled && (
        <div className="weekly-report-banner" onClick={() => setShowWeeklyReport(true)}>
          <div className="wr-banner-left">
            <div className="wr-banner-icon">
              <FileBarChart size={20} />
            </div>
            <div className="wr-banner-text">
              <h4>📊 Laporan Mingguan Anda Sudah Siap!</h4>
              <p>Lihat performa konten dan rekomendasi AI untuk minggu ini.</p>
            </div>
          </div>
          <span className="wr-banner-action">Lihat Laporan</span>
        </div>
      )}

      {/* Weekly Report Modal */}
      {showWeeklyReport && (
        <WeeklyReportModal
          onClose={() => setShowWeeklyReport(false)}
          captionsCount={captionsCount}
          postsPlanned={totalPostsPlanned}
          engagementRate={getEstimatedEngagementRate()}
        />
      )}

      {/* Quick Actions */}
      <section className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/caption-generator" className="action-card">
            <div className="action-card-icon sparkle">
              <Sparkles size={24} />
            </div>
            <h3>AI Caption Generator</h3>
            <p>Create engaging captions powered by AI</p>
          </Link>

          <Link to="/history" className="action-card">
            <div className="action-card-icon history">
              <Clock size={24} />
            </div>
            <h3>View History</h3>
            <p>Browse your previously generated captions</p>
          </Link>

          <Link to="/content-planner" className="action-card">
            <div className="action-card-icon planner">
              <CalendarDays size={24} />
            </div>
            <h3>Content Planner</h3>
            <p>Plan and schedule your social media posts</p>
          </Link>
        </div>
      </section>

      {/* Pro Banner (for free/pro users) */}
      {subscriptionPlan !== 'business' && (
        <section className="dashboard-pro-banner" onClick={openUpgradeModal}>
          <div className="pro-banner-content">
            <Crown size={24} />
            <div>
              <h3>{subscriptionPlan === 'pro' ? 'Upgrade to Business Plan' : 'Upgrade to Pro Creator'}</h3>
              <p>
                {subscriptionPlan === 'pro'
                  ? 'Dapatkan 1000 kredit, prioritas kecepatan AI tanpa antre, dan kelola hingga 3 kategori produk!'
                  : 'Dapatkan 200 kredit pembuatan, AI lebih cepat, dan akses premium hanya dengan Rp99k/bulan'}
              </p>
            </div>
          </div>
          <button className="btn btn-primary">
            Upgrade Now
          </button>
        </section>
      )}
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
