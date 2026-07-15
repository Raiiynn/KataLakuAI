import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCredits } from '../context/CreditContext';
import { supabase } from '../utils/supabase';
import { Link } from 'react-router-dom';
import {
  Sparkles, Clock, CalendarDays, Zap, Crown,
  TrendingUp, MessageSquare, Target
} from 'lucide-react';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { remainingCredits, isPro, openUpgradeModal } = useCredits();

  const [captionsCount, setCaptionsCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

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
  }, [user]);

  const creditsDisplay = isPro ? '∞' : remainingCredits;
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
            <span className="stat-label">{isPro ? 'Unlimited Plan' : 'Credits Remaining'}</span>
          </div>
          {!isPro && (
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
            <span className="stat-value">—</span>
            <span className="stat-label">Engagement Rate</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon target-icon">
            <Target size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{postsCount}</span>
            <span className="stat-label">Posts Planned</span>
          </div>
        </div>
      </section>

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

      {/* Pro Banner (for free users) */}
      {!isPro && (
        <section className="dashboard-pro-banner" onClick={openUpgradeModal}>
          <div className="pro-banner-content">
            <Crown size={24} />
            <div>
              <h3>Upgrade to Pro</h3>
              <p>Get unlimited captions, premium tones, and more for just Rp19.000/month</p>
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
