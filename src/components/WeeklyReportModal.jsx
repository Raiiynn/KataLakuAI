import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import {
  X, BarChart3, Sparkles, Trophy,
  TrendingUp, MessageSquare, CalendarCheck, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './WeeklyReportModal.css';

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const BEST_DAY_BY_NICHE = {
  fashion:     { day: 'Jumat',  reason: 'Audiens fashion paling aktif menjelang akhir pekan untuk inspirasi OOTD.' },
  food:        { day: 'Sabtu',  reason: 'Pengguna cenderung mencari resep & kuliner baru di akhir pekan.' },
  beauty:      { day: 'Rabu',   reason: 'Mid-week self-care content mendapat engagement tertinggi untuk niche beauty.' },
  electronics: { day: 'Kamis',  reason: 'Tech enthusiast aktif browsing gadget baru menjelang weekend deal.' },
  home_living: { day: 'Minggu', reason: 'Waktu santai di rumah membuat konten home & living sering di-save.' },
  other:       { day: 'Jumat',  reason: 'Secara umum, engagement rate cenderung meningkat pada akhir pekan.' },
};

const RECOMMENDATIONS = {
  fashion: 'Coba buat konten behind-the-scenes proses desain atau mix & match outfit. Format Reels/Carousel terbukti mendapat reach 2.5× lebih tinggi di niche fashion.',
  food: 'Eksperimen dengan video pendek proses memasak close-up. Konten "before & after" plating sering viral di niche F&B.',
  beauty: 'Tutorial singkat 30 detik dengan before-after transformation terbukti efektif. Sertakan juga review jujur produk untuk membangun trust.',
  electronics: 'Unboxing dan tech comparison side-by-side mendapat engagement tinggi. Coba juga format "5 alasan kenapa" untuk produk Anda.',
  home_living: 'Konten room makeover timelapse dan tips organisasi sedang trending. Tambahkan juga "shop the look" carousel.',
  other: 'Variasikan format konten Anda — coba mix antara carousel edukatif, video pendek, dan single image storytelling untuk meningkatkan reach.',
};

export default function WeeklyReportModal({ onClose, captionsCount = 0, postsPlanned = 0, engagementRate = '—' }) {
  const { user } = useAuth();
  const category = user?.productCategory || 'other';

  // Generate pseudo-random daily activity bars based on captionsCount for visual consistency
  const dailyBars = useMemo(() => {
    const today = new Date().getDay(); // 0=Sun
    const todayIdx = today === 0 ? 6 : today - 1; // 0=Mon
    const seed = captionsCount + 3;
    return DAY_LABELS.map((label, i) => {
      const base = Math.max(8, ((seed * (i + 2) * 17) % 80) + 15);
      const value = i <= todayIdx ? base : Math.max(5, base * 0.2);
      return { label, value, isToday: i === todayIdx };
    });
  }, [captionsCount]);

  const maxBar = Math.max(...dailyBars.map(b => b.value), 1);

  const bestDay = BEST_DAY_BY_NICHE[category] || BEST_DAY_BY_NICHE.other;
  const recommendation = RECOMMENDATIONS[category] || RECOMMENDATIONS.other;

  // Derive week range string
  const weekRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return `${fmt(monday)} – ${fmt(sunday)} ${now.getFullYear()}`;
  }, []);

  return createPortal(
    <div className="weekly-report-overlay" onClick={onClose}>
      <div className="weekly-report-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wr-header">
          <div className="wr-header-info">
            <div className="wr-header-icon">
              <BarChart3 size={22} />
            </div>
            <div className="wr-header-text">
              <h2>Laporan Mingguan</h2>
              <p>{weekRange}</p>
            </div>
          </div>
          <button className="wr-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="wr-body">
          {/* Metric Cards */}
          <div className="wr-metrics">
            <div className="wr-metric-card">
              <span className="wr-metric-label">Caption Dibuat</span>
              <span className="wr-metric-value">{captionsCount}</span>
              <span className={`wr-metric-sub ${captionsCount > 0 ? 'positive' : 'neutral'}`}>
                {captionsCount > 0 && <ArrowUpRight size={12} />}
                {captionsCount > 0 ? 'Aktif minggu ini' : 'Belum ada aktivitas'}
              </span>
            </div>
            <div className="wr-metric-card">
              <span className="wr-metric-label">Post Direncanakan</span>
              <span className="wr-metric-value">{postsPlanned}</span>
              <span className={`wr-metric-sub ${postsPlanned > 0 ? 'positive' : 'neutral'}`}>
                {postsPlanned > 0 && <ArrowUpRight size={12} />}
                {postsPlanned > 0 ? 'Jadwal terisi' : 'Belum ada rencana'}
              </span>
            </div>
            <div className="wr-metric-card">
              <span className="wr-metric-label">Est. Engagement</span>
              <span className="wr-metric-value">{engagementRate}</span>
              <span className={`wr-metric-sub ${engagementRate !== '—' ? 'positive' : 'neutral'}`}>
                {engagementRate !== '—' && <TrendingUp size={12} />}
                {engagementRate !== '—' ? 'Berdasarkan niche Anda' : 'Buat caption untuk melihat'}
              </span>
            </div>
            <div className="wr-metric-card">
              <span className="wr-metric-label">Niche</span>
              <span className="wr-metric-value" style={{ fontSize: 'var(--text-lg)', textTransform: 'capitalize' }}>
                {category.replace('_', ' ')}
              </span>
              <span className="wr-metric-sub neutral">Kategori produk Anda</span>
            </div>
          </div>

          {/* Bar Chart — Activity This Week */}
          <div className="wr-chart-section">
            <p className="wr-chart-title">📊 Aktivitas Minggu Ini</p>
            <div className="wr-bar-chart">
              {dailyBars.map((bar, i) => (
                <div className="wr-bar-group" key={i}>
                  <div
                    className={`wr-bar ${bar.isToday ? 'today' : ''}`}
                    style={{ height: `${(bar.value / maxBar) * 85}%` }}
                  />
                  <span className="wr-bar-label">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Best Day */}
          <div className="wr-best-day">
            <div className="wr-best-day-icon">
              <Trophy size={18} />
            </div>
            <div className="wr-best-day-text">
              <h4>Hari Terbaik Posting: {bestDay.day}</h4>
              <p>{bestDay.reason}</p>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="wr-recommendation">
            <div className="wr-recommendation-header">
              <Sparkles size={16} />
              <span>Rekomendasi AI untuk Minggu Depan</span>
            </div>
            <p>{recommendation}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="wr-footer">
          <Link to="/content-planner" className="btn btn-primary" onClick={onClose}>
            <CalendarCheck size={16} />
            Buat Rencana Konten
          </Link>
          <Link to="/caption-generator" className="btn btn-secondary" onClick={onClose}>
            <MessageSquare size={16} />
            Buat Caption
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
