import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCredits } from '../context/CreditContext';
import UpgradeModal from '../components/UpgradeModal';
import {
  LayoutDashboard,
  Sparkles,
  Clock,
  CalendarDays,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Zap,
  Crown,
} from 'lucide-react';
import './AppLayout.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/caption-generator', label: 'AI Caption Generator', icon: Sparkles },
  { path: '/history', label: 'History', icon: Clock },
  { path: '/content-planner', label: 'Content Planner', icon: CalendarDays },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { remainingCredits, isPro } = useCredits();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const creditsDisplay = isPro ? '∞' : remainingCredits;

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Sparkles size={20} />
            </div>
            {!sidebarCollapsed && <span className="sidebar-brand-name">KataLaku AI</span>}
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Credits card */}
        <div className="sidebar-credits">
          {!sidebarCollapsed ? (
            <div className="credits-card">
              <div className="credits-card-header">
                {isPro ? <Crown size={16} /> : <Zap size={16} />}
                <span>{isPro ? 'Pro Plan' : 'Free Plan'}</span>
              </div>
              <div className="credits-card-value">
                <span className="credits-number">{creditsDisplay}</span>
                {!isPro && <span className="credits-label">credits left</span>}
                {isPro && <span className="credits-label">unlimited</span>}
              </div>
              {!isPro && (
                <div className="credits-bar">
                  <div
                    className="credits-bar-fill"
                    style={{ width: `${(remainingCredits / 10) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="credits-mini" title={`${creditsDisplay} credits`}>
              <Zap size={16} />
              <span>{creditsDisplay}</span>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={logout}>
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main content area */}
      <div className="app-main">
        {/* Top bar */}
        <header className="topbar">
          <button
            className="topbar-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="topbar-spacer" />

          <div className="topbar-right">
            <div className={`topbar-credits ${isPro ? 'pro' : ''}`}>
              {isPro ? <Crown size={14} /> : <Zap size={14} />}
              <span>{creditsDisplay} {isPro ? '' : 'credits'}</span>
            </div>

            <div className="topbar-user">
              <div className="avatar avatar-sm">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName} />
                ) : (
                  getInitials(user?.fullName)
                )}
              </div>
              {user?.fullName && (
                <span className="topbar-username">{user.fullName}</span>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <UpgradeModal />
    </div>
  );
}
