import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, Shirt, Utensils, Sparkle, Laptop, Home, Package } from 'lucide-react';
import './CategoryOnboardingModal.css';

const CATEGORIES = [
  { id: 'fashion', label: 'Fashion', icon: Shirt, desc: 'Pakaian, sepatu, aksesoris, & gaya hidup' },
  { id: 'food', label: 'Food & Beverage', icon: Utensils, desc: 'Makanan, minuman, camilan, & kuliner' },
  { id: 'beauty', label: 'Beauty & Skincare', icon: Sparkle, desc: 'Kosmetik, skincare, perawatan diri' },
  { id: 'electronics', label: 'Electronics', icon: Laptop, desc: 'Gadget, aksesoris HP, komputer, alat elektronik' },
  { id: 'home_living', label: 'Home & Living', icon: Home, desc: 'Dekorasi rumah, peralatan dapur, furniture' },
  { id: 'other', label: 'Lainnya', icon: Package, desc: 'Kategori produk umum lainnya' },
];

export default function CategoryOnboardingModal() {
  const { user, updateCategory } = useAuth();
  const toast = useToast();
  const [selected, setSelected] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger modal only if user is logged in but doesn't have productCategory set
  if (!user || user.productCategory) return null;

  const handleSubmit = async () => {
    if (!selected) {
      toast.warning('Silakan pilih salah satu kategori produk terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCategory(selected);
      toast.success('Kategori produk Anda berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan kategori. Silakan coba lagi.');
      console.error('Onboarding update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal animate-scale-in">
        <div className="onboarding-header">
          <div className="onboarding-icon-wrapper">
            <Sparkles size={28} />
          </div>
          <h2 className="onboarding-title">Selamat Datang di KataLaku AI!</h2>
          <p className="onboarding-subtitle">
            Bantu kami menyesuaikan saran konten mingguan & gaya bahasa caption AI dengan memilih kategori produk utama Anda.
          </p>
        </div>

        <div className="onboarding-grid">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selected === cat.id;
            return (
              <div
                key={cat.id}
                className={`onboarding-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelected(cat.id)}
              >
                <div className="onboarding-card-icon">
                  <Icon size={20} />
                </div>
                <div className="onboarding-card-info">
                  <h4>{cat.label}</h4>
                  <p>{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="onboarding-actions">
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handleSubmit}
            disabled={isSubmitting || !selected}
          >
            {isSubmitting ? 'Menyimpan...' : 'Mulai Strategi Konten Saya'}
          </button>
        </div>
      </div>
    </div>
  );
}
