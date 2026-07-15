import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail } from '../../services/authService';
import { Mail, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setIsSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <>
        <div className="auth-mobile-brand">
          <div className="auth-brand-icon">
            <Sparkles size={18} />
          </div>
          <span className="auth-brand-name">KataLaku AI</span>
        </div>

        <div className="auth-success-card">
          <div className="auth-success-icon">
            <CheckCircle size={36} />
          </div>
          <h2>Check your email</h2>
          <p>
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your inbox and follow the instructions.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Back to Sign In
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="auth-mobile-brand">
        <div className="auth-brand-icon">
          <Sparkles size={18} />
        </div>
        <span className="auth-brand-name">KataLaku AI</span>
      </div>

      <div className="auth-form-header">
        <h1>Forgot password?</h1>
        <p>No worries, we'll send you a reset link to your email address.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="forgot-email">Email</label>
          <div className="form-input-wrapper">
            <Mail size={18} className="form-input-icon" />
            <input
              id="forgot-email"
              type="email"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="you@business.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              autoComplete="email"
            />
          </div>
          {error && <span className="form-error">{error}</span>}
        </div>

        <button
          type="submit"
          className="btn btn-primary auth-form-submit"
          disabled={isLoading}
        >
          {isLoading ? <div className="spinner" /> : 'Send Reset Link'}
        </button>
      </form>

      <p className="auth-bottom-text" style={{ marginTop: 'var(--space-8)' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </p>
    </>
  );
}
