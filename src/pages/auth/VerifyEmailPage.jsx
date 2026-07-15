import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CheckCircle, Loader, Sparkles } from 'lucide-react';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const { verifyEmail } = useAuth();
  const toast = useToast();

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        toast.success('Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message);
        toast.error(err.message);
      }
    };

    verify();
  }, [token, verifyEmail, toast]);

  return (
    <>
      <div className="auth-mobile-brand">
        <div className="auth-brand-icon">
          <Sparkles size={18} />
        </div>
        <span className="auth-brand-name">KataLaku AI</span>
      </div>

      <div className="auth-success-card">
        {status === 'verifying' && (
          <>
            <div className="auth-success-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-400)' }}>
              <Loader size={36} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="auth-success-icon">
              <CheckCircle size={36} />
            </div>
            <h2>Email Verified!</h2>
            <p>Your email has been verified successfully. You're all set!</p>
            <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Continue to Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="auth-success-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
              <span style={{ fontSize: '2rem' }}>✕</span>
            </div>
            <h2>Verification Failed</h2>
            <p>{errorMessage || 'The verification link is invalid or has expired.'}</p>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </>
  );
}
