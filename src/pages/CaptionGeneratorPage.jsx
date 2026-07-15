import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCredits } from '../context/CreditContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../utils/supabase';
import { Sparkles, Zap, Copy, RotateCcw } from 'lucide-react';
import './ProtectedPages.css';

const PLATFORMS = ['Instagram', 'Facebook', 'Twitter/X', 'TikTok', 'LinkedIn'];
const TONES = ['Professional', 'Casual', 'Funny', 'Inspirational', 'Urgent', 'Storytelling', 'Hard Selling'];
const PREMIUM_TONES = ['Luxury', 'Gen-Z', 'Poetic', 'Controversial'];

// Hook styles pool (Indonesian)
const HOOK_STYLE_POOL = [
  { name: 'Rhetorical Question', template: (desc) => `Udah nemu yang paling cocok belum buat masalah Anda? 🤔 Nah, ${desc} ini hadir buat Anda.` },
  { name: 'Mini-Storytelling', template: (desc) => `Ceritanya, banyak banget yang curhat butuh solusi praktis. Akhirnya lahirlah ${desc} ini untuk Anda! ✨` },
  { name: 'Fakta Menarik', template: (desc) => `Fakta unik hari ini: 9 dari 10 orang yang cobain ini langsung ketagihan! Kenalin, ${desc}. 🔥` },
  { name: 'Urgency FOMO', template: (desc) => `⚠️ PEMBERITAHUAN PENTING! Stok ${desc} makin menipis hari ini. Jangan sampai nyesel kehabisan ya!` },
  { name: 'Sapaan Personal', template: (desc) => `Halo bestie! Khusus buat kamu yang lagi pusing cari solusi, ${desc} adalah jawaban terbaikmu. 💕` },
  { name: 'Before After', template: (desc) => `Dulu ribet banget ngurusin hal ini, tapi sekarang tinggal pakai ${desc} semua langsung beres secara instan!` },
  { name: 'Benefit Hook', template: (desc) => `Nggak perlu buang waktu dan tenaga lagi! Dengan ${desc}, hari-hari kamu jadi jauh lebih mudah.` },
  { name: 'Emoji Hook', template: (desc) => `✨ JANGAN DI-SCROLL DULU ✨ Ada yang spesial dari ${desc} yang siap bikin kamu terpukau hari ini!` }
];

// Closing styles pool (Indonesian)
const CLOSING_STYLE_POOL = [
  { name: 'Soft CTA', template: 'Hubungi admin kami lewat DM atau WhatsApp buat konsultasi santai dulu ya~' },
  { name: 'Urgency CTA', template: 'Amankan milikmu sekarang juga sebelum promo hemat ini ditutup malam ini!' },
  { name: 'Question CTA', template: 'Kira-kira kamu tertarik coba varian yang mana nih? Yuk tulis di kolom komentar!' },
  { name: 'Playful CTA', template: 'Jangan cuma dilihatin dan dimasukkan keranjang ya, langsung checkout dong biar langsung dikirim! 😄' },
  { name: 'Direct CTA', template: 'Beli sekarang juga melalui link e-commerce resmi yang ada di bio profil kami.' }
];

// Fallback generator using randomized hooks & closings excluding recently used
function generateRandomizedCaption(description, platform, tone, excludeHooks = [], excludeClosings = []) {
  let cleanDesc = description.trim();
  let themeName = '';

  // Detect Content Planner prefilled structure
  if (cleanDesc.includes('Tema Konten:') && cleanDesc.includes('Konteks:')) {
    const themeMatch = cleanDesc.match(/Tema Konten:\s*(.*?)\.\s*Konteks:/);
    if (themeMatch) {
      themeName = themeMatch[1].trim();
    }
    const contextParts = cleanDesc.split('Konteks:');
    if (contextParts.length > 1) {
      cleanDesc = contextParts[1].trim();
    }
  }

  // Lowercase first letter if appropriate
  if (cleanDesc.length > 0 && cleanDesc[0] === cleanDesc[0].toUpperCase() && !/^[A-Z][A-Z\s]+$/.test(cleanDesc.slice(0, 3))) {
    cleanDesc = cleanDesc[0].toLowerCase() + cleanDesc.slice(1);
  }

  // Filter pools
  const availableHooks = HOOK_STYLE_POOL.filter(h => !excludeHooks.includes(h.name));
  const hookObj = availableHooks.length > 0 
    ? availableHooks[Math.floor(Math.random() * availableHooks.length)]
    : HOOK_STYLE_POOL[Math.floor(Math.random() * HOOK_STYLE_POOL.length)];

  const availableClosings = CLOSING_STYLE_POOL.filter(c => !excludeClosings.includes(c.name));
  const closingObj = availableClosings.length > 0
    ? availableClosings[Math.floor(Math.random() * availableClosings.length)]
    : CLOSING_STYLE_POOL[Math.floor(Math.random() * CLOSING_STYLE_POOL.length)];

  // Adapt hook text based on whether it is a theme or normal product description
  let hookText = '';
  if (themeName) {
    switch (hookObj.name) {
      case 'Rhetorical Question':
        hookText = `Pernah kepikiran nggak sih pentingnya ${cleanDesc}? 🤔 Biar jualan makin laris, yuk perhatikan hal ini!`;
        break;
      case 'Mini-Storytelling':
        hookText = `Sebagai seller, fokus kita nggak cuma jualan, tapi juga tentang bagaimana kita ${cleanDesc}. ✨`;
        break;
      case 'Fakta Menarik':
        hookText = `Tau nggak sih? Mayoritas pembeli memutuskan membeli setelah melihat cara seller ${cleanDesc}. 💡`;
        break;
      case 'Urgency FOMO':
        hookText = `⚠️ PENTING UNTUK DIINGAT! Kami selalu berkomitmen untuk ${cleanDesc} demi kepuasan Anda sebelum kehabisan promonya.`;
        break;
      case 'Sapaan Personal':
        hookText = `Halo bestie! Kali ini kita mau sharing pentingnya ${cleanDesc} khusus buat kamu. 💕`;
        break;
      case 'Before After':
        hookText = `Dengan mengutamakan proses ${cleanDesc}, pelanggan kami merasa jauh lebih tenang dan puas dengan hasilnya!`;
        break;
      case 'Benefit Hook':
        hookText = `Melalui komitmen ${cleanDesc}, kami menjamin pengalaman belanja yang luar biasa untuk Anda.`;
        break;
      case 'Emoji Hook':
        hookText = `✨ DETAIL DIBALIK LAYAR ✨ Yuk cari tahu bagaimana kami selalu berusaha ${cleanDesc} setiap harinya!`;
        break;
      default:
        hookText = `Hari ini kami ingin berbagi tentang pentingnya ${cleanDesc}.`;
    }
  } else {
    hookText = hookObj.template(cleanDesc);
  }

  const closingText = closingObj.template;
  const platformHashtag = platform.replace(/[^a-zA-Z0-9]/g, '');

  let bodyText = `Produk pilihan terbaik dengan kualitas terjamin. Sangat direkomendasikan untuk menunjang aktivitas keseharian Anda.`;
  if (tone === 'Funny') {
    bodyText = `Bebas pusing, bebas ribet, pokoknya paket lengkap anti-stres yang bakal bikin hari-harimu penuh tawa.`;
  } else if (tone === 'Urgent') {
    bodyText = `Promo diskon spesial ini hanya berlaku hari ini. Kelewatan dikit, harga kembali normal!`;
  } else if (tone === 'Professional') {
    bodyText = `Kami mengutamakan standar profesionalisme dan kualitas bahan terbaik demi kepuasan jangka panjang Anda.`;
  } else if (tone === 'Inspirational') {
    bodyText = `Percayalah bahwa setiap investasi kecil pada kualitas hidup Anda akan berbuah manis di masa depan.`;
  } else if (tone === 'Storytelling') {
    bodyText = `Kami merancang setiap detail dengan dedikasi tinggi agar produk ini bukan sekadar barang biasa, melainkan teman setia perjalanan Anda.`;
  } else if (tone === 'Hard Selling') {
    bodyText = `DAPATKAN DISKON BESAR-BESARAN HARI INI! Produk terbaik ini sedang promo super hemat khusus untuk Anda yang gerak cepat. Beli sekarang sebelum kehabisan!`;
  }

  return `${hookText}\n\n${bodyText}\n\n${closingText} ✨🚀\n\n#KataLakuAI #${platformHashtag} #BisnisLokal`;
}

export default function CaptionGeneratorPage() {
  const { user } = useAuth();
  const { consumeCredit, isPro, remainingCredits } = useCredits();
  const toast = useToast();
  const location = useLocation();

  // Retrieve prefilled values if redirected from content planner
  const initialProduct = location.state?.prefilledDescription || '';
  const initialTheme = location.state?.prefilledTheme || '';

  const [product, setProduct] = useState(initialProduct);
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [recentHooksUsed, setRecentHooksUsed] = useState([]);
  const [recentClosingsUsed, setRecentClosingsUsed] = useState([]);

  useEffect(() => {
    if (location.state?.prefilledDescription) {
      setProduct(location.state.prefilledDescription);
      toast.info(`Prefilled tema konten: ${location.state.prefilledTheme}`);
    }
  }, [location.state]);

  const handleGenerate = async () => {
    if (!product.trim()) {
      toast.warning('Deskripsikan produk atau layanan Anda terlebih dahulu.');
      return;
    }

    if (!isPro && remainingCredits <= 0) {
      toast.error('Kredit habis. Upgrade ke Pro untuk melanjutkan!');
      return;
    }

    setIsGenerating(true);
    setGeneratedCaption('');

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = await consumeCredit();
    if (result?.needsUpgrade) {
      setIsGenerating(false);
      return;
    }

    // Anti-repetitive check: fetch last 3 caption opening hooks
    let excludeHooks = [...recentHooksUsed];
    let excludeClosings = [...recentClosingsUsed];

    if (user?.id) {
      try {
        const { data } = await supabase
          .from('captions')
          .select('content')
          .eq('user_id', user.id)
          .eq('tone', tone)
          .order('created_at', { ascending: false })
          .limit(3);

        if (data && data.length > 0) {
          // simple heuristic to find matching hook names or first sentences
          const firstSentences = data.map(d => d.content.split('\n')[0]);
          HOOK_STYLE_POOL.forEach(h => {
            firstSentences.forEach(s => {
              if (s.toLowerCase().includes(h.name.toLowerCase().replace(' ', ''))) {
                excludeHooks.push(h.name);
              }
            });
          });
        }
      } catch (dbErr) {
        console.warn('Could not query captions history, using local state:', dbErr);
      }
    }

    let caption = '';
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      try {
        let cleanProductInput = product.trim();
        let themeContextText = "";
        if (cleanProductInput.includes('Tema Konten:') && cleanProductInput.includes('Konteks:')) {
          const themeMatch = cleanProductInput.match(/Tema Konten:\s*(.*?)\.\s*Konteks:/);
          const themeName = themeMatch ? themeMatch[1].trim() : "";
          const contextParts = cleanProductInput.split('Konteks:');
          const cleanDesc = contextParts.length > 1 ? contextParts[1].trim() : cleanProductInput;
          themeContextText = `Tema Konten jualan "${themeName}" dengan detail aktivitas/fokus: "${cleanDesc}"`;
        } else {
          themeContextText = `informasi produk: "${cleanProductInput}"`;
        }

        const prompt = `Kamu adalah copywriting AI specialist untuk UMKM Indonesia.
Tugasmu: generate teks jualan persuasif berdasarkan ${themeContextText}.

INSTRUKSI:
- Tulis dalam Bahasa Indonesia yang casual dan engaging untuk platform: ${platform}
- Sesuaikan gaya dengan tone: ${tone}
- Pastikan struktur rapi dengan emoji yang relevan
- Jangan lebih dari 150 kata
- Hindari menulis teks meta seperti "Tema Konten" atau "Konteks" di dalam hasil caption. Tulis langsung caption jualan yang siap diposting.
- Hindari repetisi kata pembuka yang membosankan

OUTPUT FORMAT:
[Satu draf caption terbaik]`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.95,
              topP: 0.9
            }
          })
        });

        if (response.ok) {
          const rawJson = await response.json();
          caption = rawJson.candidates[0].content.parts[0].text.trim();
        }
      } catch (apiErr) {
        console.warn('Gemini API call failed, falling back to randomized generator:', apiErr);
      }
    }

    if (!caption) {
      // Pick random styles & generate
      const availableHooks = HOOK_STYLE_POOL.filter(h => !excludeHooks.includes(h.name));
      const hookPicked = availableHooks[Math.floor(Math.random() * availableHooks.length)] || HOOK_STYLE_POOL[0];
      const availableClosings = CLOSING_STYLE_POOL.filter(c => !excludeClosings.includes(c.name));
      const closingPicked = availableClosings[Math.floor(Math.random() * availableClosings.length)] || CLOSING_STYLE_POOL[0];

      caption = generateRandomizedCaption(product, platform, tone, excludeHooks, excludeClosings);

      // Rotate local state tracking
      setRecentHooksUsed(prev => [...prev.slice(-2), hookPicked.name]);
      setRecentClosingsUsed(prev => [...prev.slice(-2), closingPicked.name]);
    }

    // Save to Supabase DB if user session exists
    if (user?.id) {
      try {
        await supabase.from('captions').insert({
          user_id: user.id,
          description: product,
          platform,
          tone,
          content: caption,
          created_at: new Date().toISOString()
        });
      } catch (dbInsertErr) {
        console.warn('Failed to insert into captions table in DB:', dbInsertErr);
      }
    }

    setGeneratedCaption(caption);
    setIsGenerating(false);
    toast.success('Caption berhasil dibuat!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCaption);
    toast.success('Caption disalin ke papan klip!');
  };

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <h1><Sparkles size={28} /> AI Caption Generator</h1>
        <p>Tulis caption kreatif & persuasif untuk media sosial Anda dalam hitungan detik.</p>
      </div>

      <div className="generator-layout">
        {/* Input Side */}
        <div className="generator-input card">
          <div className="form-group">
            <label className="form-label">Deskripsi Produk / Layanan</label>
            <textarea
              className="form-input generator-textarea"
              placeholder="Contoh: Sepatu sneakers olahraga pria bahan breathable, cocok buat lari pagi..."
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Platform Sosial Media</label>
            <div className="chip-group">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  className={`chip ${platform === p ? 'active' : ''}`}
                  onClick={() => setPlatform(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nada Bicara (Tone)</label>
            <div className="chip-group">
              {TONES.map(t => (
                <button
                  key={t}
                  className={`chip ${tone === t ? 'active' : ''}`}
                  onClick={() => setTone(t)}
                >
                  {t}
                </button>
              ))}
              {PREMIUM_TONES.map(t => (
                <button
                  key={t}
                  className={`chip premium ${tone === t ? 'active' : ''}`}
                  onClick={() => {
                    if (!isPro) {
                      toast.info('Nada bicara premium hanya tersedia untuk anggota Pro.');
                      return;
                    }
                    setTone(t);
                  }}
                >
                  👑 {t}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ marginTop: 'var(--space-2)' }}
          >
            {isGenerating ? (
              <>
                <RotateCcw className="spin" size={18} style={{ marginRight: '8px' }} />
                Sedang Menulis...
              </>
            ) : (
              <>
                <Sparkles size={18} style={{ marginRight: '8px' }} />
                Buat Caption Sekarang
              </>
            )}
          </button>
        </div>

        {/* Output Side */}
        <div className="generator-output">
          <div className="card" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: generatedCaption ? 'space-between' : 'center' }}>
            {generatedCaption ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--primary-400)' }}>
                    ✨ AI GENERATED CAPTION ({platform})
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={handleCopy} title="Copy to clipboard">
                    <Copy size={16} />
                  </button>
                </div>
                <p className="generated-text-content" style={{ flex: 1, whiteSpace: 'pre-wrap', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.6, textAlign: 'left' }}>
                  {generatedCaption}
                </p>
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                    Salin Teks
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <Sparkles size={40} style={{ marginBottom: 'var(--space-3)', opacity: 0.3 }} />
                <p style={{ fontSize: 'var(--text-sm)' }}>Caption hasil tulisan AI akan muncul di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
