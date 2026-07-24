import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  MessageSquare, 
  Calendar, 
  Hash, 
  Check, 
  ChevronDown, 
  ArrowRight, 
  Menu, 
  X,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const faqs = [
    {
      question: "Apa itu KataLaku AI?",
      answer: "KataLaku AI adalah platform asisten penulisan marketing bertenaga AI yang dirancang khusus untuk membantu pemilik bisnis, content creator, dan marketer dalam membuat caption media sosial (Instagram, TikTok, Facebook) yang menarik serta merencanakan jadwal konten (Content Planner) secara efisien."
    },
    {
      question: "Bagaimana cara kerja sistem Kredit?",
      answer: "Setiap pembuatan caption atau perencanaan konten menggunakan sejumlah kredit. Akun Free mendapatkan 10 kredit gratis setiap bulannya. Jika Anda membutuhkan lebih banyak, Anda dapat melakukan upgrade ke paket Pro Creator untuk mendapatkan isi ulang kredit bulanan."
    },
    {
      question: "Apakah saya bisa membatalkan langganan kapan saja?",
      answer: "Tentu saja. Anda dapat membatalkan, menaikkan, atau menurunkan paket langganan Anda kapan saja langsung dari pengaturan profil akun Anda tanpa biaya tambahan tambahan."
    },
    {
      question: "Apakah hasil caption AI aman dan orisinal?",
      answer: "Ya, AI kami menghasilkan konten unik secara real-time berdasarkan input produk dan audiens target yang Anda masukkan. Konten tersebut 100% milik Anda dan bebas digunakan untuk media sosial Anda."
    }
  ];

  return (
    <div className="landing-page">
      {/* Background Decorative Glows */}
      <div className="landing-glow glow-1" />
      <div className="landing-glow glow-2" />

      {/* Header / Navbar */}
      <header className={`landing-header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="header-container">
          <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-icon">
              <Sparkles size={22} />
            </div>
            <span className="brand-name">KataLaku AI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <a href="#features">Fitur</a>
            <a href="#pricing">Harga</a>
            <a href="#faq">FAQ</a>
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm">
                Ke Dashboard <ArrowRight size={16} style={{ marginLeft: '6px' }} />
              </button>
            ) : (
              <div className="nav-auth-buttons">
                <button onClick={() => navigate('/login')} className="btn btn-ghost btn-sm">Masuk</button>
                <button onClick={() => navigate('/register')} className="btn btn-primary btn-sm">Daftar Gratis</button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Fitur</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Harga</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            {isAuthenticated ? (
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }} 
                className="btn btn-primary btn-block"
              >
                Ke Dashboard
              </button>
            ) : (
              <div className="mobile-nav-buttons">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }} 
                  className="btn btn-ghost"
                >
                  Masuk
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }} 
                  className="btn btn-primary"
                >
                  Daftar Gratis
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge animate-fade-in">
            <span className="badge-tag">NEW</span>
            <span className="badge-text">Generasi baru asisten marketing AI</span>
          </div>

          <h1 className="hero-title animate-fade-in-up">
            Tulis Caption & Kelola Konten Jualan Anda <br />
            <span className="gradient-text">10x Lebih Cepat</span> Dengan AI
          </h1>

          <p className="hero-subtitle animate-fade-in-up delay-100">
            Hasilkan caption instagram, tiktok, dan facebook yang persuasif, relevan, serta teroptimasi SEO. Dilengkapi dengan Content Planner interaktif untuk mempermudah strategi branding bisnis Anda.
          </p>

          <div className="hero-actions animate-fade-in-up delay-200">
            <button onClick={handleCtaClick} className="btn btn-primary btn-lg">
              {isAuthenticated ? 'Ke Dashboard' : 'Mulai Coba Sekarang — Gratis'}
            </button>
            <a href="#features" className="btn btn-secondary btn-lg">
              Pelajari Fitur
            </a>
          </div>

          {/* Interactive Mockup Container */}
          <div className="hero-mockup animate-scale-in">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
              <div className="mockup-tab">katalaku-ai.com/dashboard</div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-logo">✨ KataLaku AI</div>
                <div className="mockup-menu">
                  <div className="mockup-menu-item active">📝 Caption Generator</div>
                  <div className="mockup-menu-item">📅 Content Planner</div>
                  <div className="mockup-menu-item">🕒 Riwayat</div>
                  <div className="mockup-menu-item">👤 Profil</div>
                </div>
              </div>
              <div className="mockup-content">
                <div className="mockup-panel">
                  <h4>Product Details</h4>
                  <div className="mockup-field">Sepatu Sneakers Olahraga Pria Breathable</div>
                  <h4>Tone & Target</h4>
                  <div className="mockup-chips">
                    <span className="mockup-chip active">Casual</span>
                    <span className="mockup-chip">Professional</span>
                    <span className="mockup-chip">Persuasive</span>
                  </div>
                  <div className="mockup-btn">Generate Captions</div>
                </div>
                <div className="mockup-result">
                  <div className="result-header">✨ AI Generated Caption</div>
                  <p>
                    "Langkah lebih ringan, performa lebih maksimal! 👟 Olahraga pagi jadi lebih berenergi dengan Sneaker Pria Breathable. Didesain khusus agar kaki tetap sejuk walau beraktivitas seharian. Yuk dapatkan diskon 20% khusus hari ini! Klik link di bio ya! #sepatupria #sneakersolahraga #sportstyle"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Fitur Unggulan Untuk Bisnis Anda</h2>
            <p className="section-subtitle">Semua alat yang Anda butuhkan untuk meroketkan engagement media sosial dalam satu dashboard.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper color-indigo">
                <MessageSquare size={24} />
              </div>
              <h3>AI Caption Generator</h3>
              <p>Tulis caption jualan, edukasi, maupun cerita yang persuasif dan sesuai dengan kepribadian brand Anda dengan AI canggih kami.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper color-purple">
                <Calendar size={24} />
              </div>
              <h3>Interactive Content Planner</h3>
              <p>Susun jadwal rilis postingan Anda secara mingguan. Visualisasikan feed dan tema mingguan agar konten konsisten terus berjalan.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper color-pink">
                <Hash size={24} />
              </div>
              <h3>Smart Hashtags & Call to Action</h3>
              <p>Dapatkan rekomendasi tagar terpopuler dan tombol call to action yang mendorong pembeli untuk langsung bertindak.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Pilih Paket Sesuai Kebutuhan</h2>
            <p className="section-subtitle">Mulai secara gratis dan tingkatkan paket Anda seiring dengan pertumbuhan akun bisnis Anda.</p>
          </div>

          <div className="pricing-grid">
            {/* Free Plan */}
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3>Starter</h3>
                <p className="plan-description">Untuk mencoba dan bereksperimen</p>
                <div className="price-container">
                  <span className="price-currency">Rp</span>
                  <span className="price-amount">0</span>
                  <span className="price-period">/selamanya</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li><Check size={16} /> 10 Kredit Pembuatan / Bulan</li>
                <li><Check size={16} /> AI Caption Generator Standard</li>
                <li><Check size={16} /> Akses Content Planner</li>
                <li><Check size={16} /> Riwayat 7 Hari Terakhir</li>
              </ul>
              <button onClick={handleCtaClick} className="btn btn-secondary btn-block">Mulai Sekarang</button>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card pricing-popular">
              <div className="popular-badge">Paling Populer</div>
              <div className="pricing-card-header">
                <h3>Pro Creator</h3>
                <p className="plan-description">Untuk pertumbuhan cepat media sosial</p>
                <div className="price-container">
                  <span className="price-currency">Rp</span>
                  <span className="price-amount">19k</span>
                  <span className="price-period">/bulan</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li><Check size={16} /> 200 Kredit Pembuatan / Bulan</li>
                <li><Check size={16} /> AI Engine Prioritas (Lebih Cepat)</li>
                <li><Check size={16} /> Akses Content Planner Penuh</li>
                <li><Check size={16} /> Riwayat Selamanya</li>
                <li><Check size={16} /> Akses Fitur Premium Baru</li>
                <li><Check size={16} /> Dukungan Email Prioritas</li>
              </ul>
              <button onClick={handleCtaClick} className="btn btn-primary btn-block">Upgrade ke Pro</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Pertanyaan yang Sering Diajukan</h2>
            <p className="section-subtitle">Punya pertanyaan seputar KataLaku AI? Temukan jawabannya di bawah ini.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${activeFaq === index ? 'faq-active' : ''}`} onClick={() => toggleFaq(index)}>
                <div className="faq-question">
                  <h3>{faq.question}</h3>
                  <ChevronDown size={20} className="faq-chevron" />
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="cta-banner-section">
        <div className="cta-banner-container">
          <div className="cta-banner-content">
            <h2>Siap Mengubah Feed Media Sosial Anda?</h2>
            <p>Dapatkan caption yang relevan, tingkatkan engagement, dan rencanakan konten Anda dengan mudah menggunakan asisten AI.</p>
            <button onClick={handleCtaClick} className="btn btn-primary btn-lg">
              {isAuthenticated ? 'Ke Dashboard' : 'Mulai Coba Sekarang secara Gratis'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand-section">
            <div className="landing-brand">
              <div className="brand-icon">
                <Sparkles size={20} />
              </div>
              <span className="brand-name">KataLaku AI</span>
            </div>
            <p className="footer-tagline">Solusi asisten marketing berbasis kecerdasan buatan terlengkap untuk brand Anda.</p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-link-group">
              <h4>Navigasi</h4>
              <a href="#features">Fitur</a>
              <a href="#pricing">Harga</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer-link-group">
              <h4>Aplikasi</h4>
              <button onClick={() => navigate('/login')} className="footer-text-btn">Login</button>
              <button onClick={() => navigate('/register')} className="footer-text-btn">Register</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} KataLaku AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
