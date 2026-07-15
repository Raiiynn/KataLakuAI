import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PasswordStrength from '../../components/PasswordStrength';
import { Lock, Eye, EyeOff, CheckCircle, Sparkles } from 'lucide-react';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await resetPassword({ token, newPassword: formData.password });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      toast.error(err.message);
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
          <h2>Password Reset!</h2>
          <p>
            Your password has been reset successfully. Redirecting you to login...
          </p>
          <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Go to Sign In
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
        <h1>Reset password</h1>
        <p>Create a new strong password for your account.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="reset-password">New Password</label>
          <div className="form-input-wrapper">
            <Lock size={18} className="form-input-icon" />
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a new password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="form-input-action"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrength password={formData.password} />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reset-confirm">Confirm New Password</label>
          <div className="form-input-wrapper">
            <Lock size={18} className="form-input-icon" />
            <input
              id="reset-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="form-input-action"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
        </div>

        {errors.general && (
          <div className="form-error" style={{ textAlign: 'center' }}>
            {errors.general}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary auth-form-submit"
          disabled={isLoading}
        >
          {isLoading ? <div className="spinner" /> : 'Reset Password'}
        </button>
      </form>
    </>
  );
}
