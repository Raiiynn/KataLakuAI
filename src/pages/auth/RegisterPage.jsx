import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail } from '../../services/authService';
import PasswordStrength from '../../components/PasswordStrength';
import { User, Briefcase, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
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
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        businessName: formData.businessName,
        email: formData.email,
        password: formData.password,
      });
      toast.success('Account created successfully! Welcome to KataLaku AI.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message);
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="auth-mobile-brand">
        <div className="auth-brand-icon">
          <Sparkles size={18} />
        </div>
        <span className="auth-brand-name">KataLaku AI</span>
      </div>

      <div className="auth-form-header">
        <h1>Create account</h1>
        <p>Start generating AI-powered captions for your business</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {/* Full Name & Business Name */}
        <div className="auth-form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-fullname">Full Name</label>
            <div className="form-input-wrapper">
              <User size={18} className="form-input-icon" />
              <input
                id="reg-fullname"
                type="text"
                name="fullName"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            {errors.fullName && <span className="form-error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-business">Business Name</label>
            <div className="form-input-wrapper">
              <Briefcase size={18} className="form-input-icon" />
              <input
                id="reg-business"
                type="text"
                name="businessName"
                className={`form-input ${errors.businessName ? 'error' : ''}`}
                placeholder="My Business"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>
            {errors.businessName && <span className="form-error">{errors.businessName}</span>}
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email</label>
          <div className="form-input-wrapper">
            <Mail size={18} className="form-input-icon" />
            <input
              id="reg-email"
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@business.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Password</label>
          <div className="form-input-wrapper">
            <Lock size={18} className="form-input-icon" />
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a strong password"
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

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
          <div className="form-input-wrapper">
            <Lock size={18} className="form-input-icon" />
            <input
              id="reg-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
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

        {/* Terms */}
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
          />
          <span className="checkbox-label">
            I agree to the <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a> and <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
          </span>
        </label>
        {errors.agreeTerms && <span className="form-error">{errors.agreeTerms}</span>}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary auth-form-submit"
          disabled={isLoading}
        >
          {isLoading ? <div className="spinner" /> : 'Create Account'}
        </button>
      </form>

      <p className="auth-bottom-text">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </>
  );
}
