import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Tag } from 'lucide-react';
import './ProtectedPages.css';

export default function SettingsPage() {
  const { user, updateCategory } = useAuth();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCategoryChange = async (e) => {
    const newCategory = e.target.value;
    setIsUpdating(true);
    try {
      await updateCategory(newCategory);
      toast.success('Kategori produk berhasil diperbarui!');
    } catch (err) {
      toast.error('Gagal memperbarui kategori produk.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <h1><SettingsIcon size={28} /> Settings</h1>
        <p>Configure your app preferences and account settings.</p>
      </div>

      <div className="settings-grid">
        {/* Product Category Settings */}
        <div className="settings-section card">
          <div className="settings-section-header">
            <Tag size={20} />
            <h3>Kategori Produk Bisnis</h3>
          </div>
          <div className="settings-item">
            <div>
              <p className="settings-item-title">Kategori Utama</p>
              <p className="settings-item-desc">Mempengaruhi ide Content Planner & Caption Generator Anda</p>
            </div>
            <select
              className="form-input"
              style={{ width: 'auto', minWidth: '180px' }}
              value={user?.productCategory || ''}
              onChange={handleCategoryChange}
              disabled={isUpdating}
            >
              <option value="" disabled>Pilih Kategori...</option>
              <option value="fashion">Fashion</option>
              <option value="food">Food & Beverage</option>
              <option value="beauty">Beauty & Skincare</option>
              <option value="electronics">Electronics</option>
              <option value="home_living">Home & Living</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
        </div>

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
