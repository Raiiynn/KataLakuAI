import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Briefcase, Camera, Save } from 'lucide-react';
import './ProtectedPages.css';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    businessName: user?.businessName || '',
    email: user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    updateProfile({
      fullName: formData.fullName,
      businessName: formData.businessName,
    });
    setIsLoading(false);
    toast.success('Profile updated successfully!');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <h1><User size={28} /> Profile</h1>
        <p>Manage your personal and business information.</p>
      </div>

      <div className="profile-layout">
        {/* Avatar Section */}
        <div className="profile-avatar-section card">
          <div className="avatar avatar-lg" style={{ width: '80px', height: '80px', fontSize: '1.5rem' }}>
            {getInitials(user?.fullName)}
          </div>
          <h3>{user?.fullName}</h3>
          <p className="profile-email">{user?.email}</p>
          <button className="btn btn-secondary btn-sm">
            <Camera size={14} /> Change Avatar
          </button>
          <div className="profile-meta">
            <span>Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Form Section */}
        <form className="profile-form card" onSubmit={handleSubmit}>
          <h3>Personal Information</h3>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Full Name</label>
            <div className="form-input-wrapper">
              <User size={18} className="form-input-icon" />
              <input
                id="profile-name"
                type="text"
                name="fullName"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-business">Business Name</label>
            <div className="form-input-wrapper">
              <Briefcase size={18} className="form-input-icon" />
              <input
                id="profile-business"
                type="text"
                name="businessName"
                className="form-input"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-email">Email</label>
            <div className="form-input-wrapper">
              <Mail size={18} className="form-input-icon" />
              <input
                id="profile-email"
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>
            <span className="form-hint">Email cannot be changed</span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? <div className="spinner" /> : <><Save size={16} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
