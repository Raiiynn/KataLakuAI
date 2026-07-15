import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authIllustration from '../assets/auth-illustration.png';
import { Sparkles } from 'lucide-react';
import './AuthLayout.css';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner spinner-lg spinner-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-layout">
      {/* Left Panel — Illustration */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <Sparkles size={24} />
            </div>
            <span className="auth-brand-name">KataLaku AI</span>
          </div>

          <div className="auth-illustration-wrapper">
            <img
              src={authIllustration}
              alt="KataLaku AI — Generate stunning marketing captions with AI"
              className="auth-illustration"
            />
          </div>

          <div className="auth-tagline">
            <h2>Generate Stunning Marketing Captions</h2>
            <p>Powered by AI to help your business grow on social media</p>
          </div>

          {/* Floating decorative elements */}
          <div className="auth-float auth-float-1">
            <div className="auth-float-card">
              <span>🚀</span>
              <span>Boost engagement 3x</span>
            </div>
          </div>
          <div className="auth-float auth-float-2">
            <div className="auth-float-card">
              <span>✨</span>
              <span>AI-powered captions</span>
            </div>
          </div>
          <div className="auth-float auth-float-3">
            <div className="auth-float-card">
              <span>📈</span>
              <span>Grow your brand</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
