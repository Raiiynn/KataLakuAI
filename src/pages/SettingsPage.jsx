import { Settings as SettingsIcon, Bell, Shield, Palette, Globe } from 'lucide-react';
import './ProtectedPages.css';

export default function SettingsPage() {
  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <h1><SettingsIcon size={28} /> Settings</h1>
        <p>Configure your app preferences and account settings.</p>
      </div>

      <div className="settings-grid">
        <div className="settings-section card">
          <div className="settings-section-header">
            <Bell size={20} />
            <h3>Notifications</h3>
          </div>
          <div className="settings-item">
            <div>
              <p className="settings-item-title">Email Notifications</p>
              <p className="settings-item-desc">Get notified about new features and tips</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="settings-item">
            <div>
              <p className="settings-item-title">Weekly Report</p>
              <p className="settings-item-desc">Receive weekly performance summaries</p>
            </div>
            <label className="toggle">
              <input type="checkbox" />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <div className="settings-section card">
          <div className="settings-section-header">
            <Palette size={20} />
            <h3>Appearance</h3>
          </div>
          <div className="settings-item">
            <div>
              <p className="settings-item-title">Dark Mode</p>
              <p className="settings-item-desc">Use dark theme for the interface</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <div className="settings-section card">
          <div className="settings-section-header">
            <Globe size={20} />
            <h3>Language</h3>
          </div>
          <div className="settings-item">
            <div>
              <p className="settings-item-title">Interface Language</p>
              <p className="settings-item-desc">Choose your preferred language</p>
            </div>
            <select className="form-input" style={{ width: 'auto', minWidth: '120px' }}>
              <option>English</option>
              <option>Bahasa Indonesia</option>
            </select>
          </div>
        </div>

        <div className="settings-section card">
          <div className="settings-section-header">
            <Shield size={20} />
            <h3>Security</h3>
          </div>
          <div className="settings-item">
            <div>
              <p className="settings-item-title">Change Password</p>
              <p className="settings-item-desc">Update your account password</p>
            </div>
            <button className="btn btn-secondary btn-sm">Change</button>
          </div>
          <div className="settings-item">
            <div>
              <p className="settings-item-title">Delete Account</p>
              <p className="settings-item-desc">Permanently remove your account and data</p>
            </div>
            <button className="btn btn-danger btn-sm">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
