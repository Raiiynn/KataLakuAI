import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCredits } from '../context/CreditContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../utils/supabase';
import { Sparkles, Zap, Copy, Heart, RotateCcw } from 'lucide-react';
import './ProtectedPages.css';

const PLATFORMS = ['Instagram', 'Facebook', 'Twitter/X', 'TikTok', 'LinkedIn'];
const TONES = ['Professional', 'Casual', 'Funny', 'Inspirational', 'Urgent', 'Storytelling'];
const PREMIUM_TONES = ['Luxury', 'Gen-Z', 'Poetic', 'Controversial'];

// Heuristic to detect if the text is in Indonesian
function isIndonesianText(text) {
  const idKeywords = [
    'yang', 'dan', 'di', 'dengan', 'untuk', 'pada', 'ke', 'dari', 'ini', 'itu',
    'bisa', 'buat', 'adalah', 'kami', 'saya', 'kamu', 'mereka', 'kita',
    'makanan', 'goreng', 'bumbu', 'khas', 'enak', 'murah', 'promo', 'beli', 'sekarang',
    'dapatkan', 'hari', 'ada', 'tidak', 'selamat', 'pagi', 'siang', 'malam',
    'rasa', 'terbaik', 'solusi', 'produk', 'jasa', 'layanan', 'ayam', 'madu', 'lucu', 'akrilik'
  ];
  
  const words = text.toLowerCase().split(/[^a-zA-Z0-9]+/);
  const matchCount = words.filter(w => idKeywords.includes(w)).length;
  
  // If we match 1 or more common Indonesian words, or if it doesn't look like common English start
  return matchCount > 0 || (words.length > 0 && !/^(the|and|of|to|is|in|it|you|that|was|for|on|are|as|with|his|they|i|at|be|this|have|from)$/i.test(words[0]));
}

// Generate contextually matched captions
function generateMockCaption(description, platform, tone) {
  const isId = isIndonesianText(description);
  
  // Clean description slightly for embedding
  let desc = description.trim();
  // Lowercase first letter if it doesn't look like a proper noun
  if (desc.length > 0 && desc[0] === desc[0].toUpperCase() && !/^[A-Z][A-Z\s]+$/.test(desc.slice(0, 3))) {
    desc = desc[0].toLowerCase() + desc.slice(1);
  }

  // Derive simple hashtag category
  const words = description.toLowerCase().split(/[^a-zA-Z]+/);
  const category = words.find(w => w.length > 4) || 'product';
  const hashtagCategory = category.charAt(0).toUpperCase() + category.slice(1);

  const platformHashtag = platform.replace(/[^a-zA-Z0-9]/g, '');

  if (isId) {
    // Indonesian Templates
    switch (tone) {
      case 'Professional':
        return `💼 Memperkenalkan ${desc}. Solusi berkualitas tinggi yang dirancang khusus untuk memenuhi kebutuhan Anda dengan hasil terbaik.\n\nDapatkan performa maksimal dan efisiensi optimal hari ini. Hubungi kami untuk informasi lebih lanjut atau kunjungi link di bio kami! ✨\n\n#${hashtagCategory} #Profesional #SolusiBisnis #${platformHashtag} #KataLakuAI`;
      
      case 'Casual':
        return `🙌 Siapa sih yang gak tergoda sama ${desc}? Rasanya yang khas atau kualitasnya emang selalu juara bikin nagih!\n\nCocok banget buat nemenin rutinitas santai kamu hari ini. Yuk, langsung diserbu sebelum kehabisan! 🤩✨\n\n#${hashtagCategory} #VibesSantai #RekomendasiHariIni #${platformHashtag}`;
      
      case 'Funny':
        return `🤪 Hidup itu banyak drama, tapi kalau urusan ${desc} sih udah jelas anti-ribet dan bikin happy! \n\nLebih setia nemenin hari-hari kamu dibanding dia yang cuma datang pas butuh doang. Buruan cobain biar senyum kamu makin lebar! 🍕✌️\n\n#${hashtagCategory} #NgakakKocak #HumorLokal #${platformHashtag} #AntiDrama`;
      
      case 'Inspirational':
        return `🌟 Setiap hal besar selalu dimulai dari langkah sederhana. Begitu juga dengan hadirnya ${desc} yang siap menemani setiap proses perjalanan suksesmu.\n\nMari mulai hari ini dengan energi positif dan tekad yang kuat! 💪✨\n\n#InspirasiPagi #MotivasiSukses #${hashtagCategory} #${platformHashtag} #TetapSemangat`;
      
      case 'Urgent':
        return `🚨 JANGAN SAMPAI MENYESAL! Penawaran spesial untuk ${desc} terbatas hanya untuk hari ini saja!\n\nStok sangat terbatas dan cepat habis. Klik link di bio untuk pesan sekarang sebelum kehabisan! 🛒⚠️\n\n#PromoTerbatas #BeliSekarang #${hashtagCategory} #DiskonHariIni #${platformHashtag}`;
      
      case 'Storytelling':
        return `📖 Dibuat dengan dedikasi penuh dan resep/cara yang otentik. Perjalanan menghadirkan ${desc} ini penuh dengan cerita dan cinta di setiap detailnya.\n\nKami percaya setiap usaha terbaik akan menghasilkan rasa/kualitas yang terbaik pula. Terima kasih sudah menjadi bagian dari perjalanan kami. ❤️\n\n#CeritaBrand #Otentik #${hashtagCategory} #KisahPerjalanan #${platformHashtag}`;
      
      case 'Luxury':
        return `💎 Kemewahan sejati terpancar dari detail yang sempurna. Rasakan keanggunan eksklusif dan pengalaman tiada tara dengan ${desc}.\n\nDibuat khusus untuk Anda yang menghargai cita rasa dan kualitas premium terbaik. ✨\n\n#LuxuryLifestyle #PremiumQuality #Eksklusif #${hashtagCategory} #GayaHidup`;
      
      case 'Gen-Z':
        return `🔥 Gak ada lawan! Vibes dari ${desc} ini beneran se-aesthetic dan se-worth itu. \n\nFix no debat, langsung check out sekarang biar gak kena FOMO parah ya gais! 💅✨\n\n#GenZStyle #KeceAbis #AestheticVibes #${hashtagCategory} #${platformHashtag}`;
      
      case 'Poetic':
        return `🌸 Bagaikan hembusan angin sore yang menenangkan jiwa, begitulah kelembutan ${desc} menyapa harimu.\n\nMenghadirkan keindahan rasa yang terukir abadi di setiap lembaran kenangan indah kita. ✍️✨\n\n#SajakIndah #Estetik #${hashtagCategory} #UntaianKata #${platformHashtag}`;
      
      case 'Controversial':
        return `🤔 Banyak yang bilang ${desc} itu cuma overrated aja. Tapi setelah dicobain langsung, ternyata hasilnya bikin takjub banget!\n\nKira-kira ini mitos atau fakta? Coba tulis pendapat jujur kalian di kolom komentar ya! 👇🔥\n\n#DebatSehat #ReviewJujur #${hashtagCategory} #MitosAtauFakta #${platformHashtag}`;
      
      default:
        return `✨ Nikmati keunikan ${desc} yang dirancang khusus untuk kenyamanan dan kebahagiaan Anda sehari-hari.\n\nDapatkan sekarang dan rasakan perbedaannya! 🚀\n\n#${hashtagCategory} #${platformHashtag}`;
    }
  } else {
    // English Templates
    switch (tone) {
      case 'Professional':
        return `💼 Introducing ${desc}. A high-quality solution engineered specifically to meet your demands with precision and excellence.\n\nAchieve peak performance and operational efficiency starting today. Contact us for inquiries or click the link in our bio! ✨\n\n#${hashtagCategory} #Professional #BusinessSolutions #${platformHashtag} #KataLakuAI`;
      
      case 'Casual':
        return `🙌 Who is ready for some ${desc}? It's the perfect match to elevate your daily routine and keep things fresh!\n\nSimple, effective, and always hits the spot. Grab yours today and enjoy! 🤩✨\n\n#${hashtagCategory} #CasualVibes #DailyEssential #${platformHashtag}`;
      
      case 'Funny':
        return `🤪 Life is full of complicated questions, but choosing ${desc} is definitely the easiest answer you'll make today!\n\nIt's reliable, satisfying, and won't leave you on read. Treat yourself right now! 🍕✌️\n\n#${hashtagCategory} #HumorModeOn #JustForFun #${platformHashtag}`;
      
      case 'Inspirational':
        return `🌟 Great things never come from comfort zones. Let ${desc} be the catalyst that powers your growth and inspires your daily journey.\n\nBelieve in the process and make every single day count! 💪✨\n\n#Inspiration #Motivation #${hashtagCategory} #${platformHashtag} #KeepGrowing`;
      
      case 'Urgent':
        return `🚨 DON'T MISS OUT! Special offer on ${desc} is available for a very limited time only!\n\nStocks are running extremely low. Head over to our link in bio and secure yours before it is gone! 🛒⚠️\n\n#LimitedTimeOffer #ShopNow #${hashtagCategory} #DealOfTheDay #${platformHashtag}`;
      
      case 'Storytelling':
        return `📖 It all started with a simple vision to bring authentic value to your life. Crafting ${desc} has been a journey filled with passion, dedication, and care in every single step.\n\nWe believe in creating products that make a difference. Thank you for walking this path with us. ❤️\n\n#BrandStory #BehindTheScenes #${hashtagCategory} #OurJourney #${platformHashtag}`;
      
      case 'Luxury':
        return `💎 True elegance lies in the details. Elevate your lifestyle and experience unmatched sophistication with ${desc}.\n\nDesigned exclusively for those who demand nothing but the absolute finest quality. ✨\n\n#LuxuryLifestyle #PremiumQuality #Excellence #${hashtagCategory} #Sophisticated`;
      
      case 'Gen-Z':
        return `🔥 No cap! This ${desc} is literally giving everything it needs to give. Aesthetics are unmatched.\n\nDon't sleep on this, run to the link in bio and upgrade your setup now! 💅✨\n\n#Aesthetic #VibeCheck #MustHave #${hashtagCategory} #${platformHashtag}`;
      
      case 'Poetic':
        return `🌸 Like a soft whisper of wind on a quiet morning, the beauty of ${desc} gently inspires your day.\n\nCrafting moments of pure peace that linger beautifully in your memory forever. ✍️✨\n\n#PoeticVibes #Aesthetic #ArtOfLiving #${hashtagCategory} #${platformHashtag}`;
      
      case 'Controversial':
        return `🤔 Hot take: Is ${desc} actually overrated or are people just missing out on how game-changing it really is?\n\nLet's settle this debate in the comments. Drop your honest thoughts below! 👇🔥\n\n#HotTake #LetUsDebate #${hashtagCategory} #HonestReview #${platformHashtag}`;
      
      default:
        return `✨ Experience the unique qualities of ${desc}, designed to bring convenience and joy to your daily life.\n\nGet yours now! 🚀\n\n#${hashtagCategory} #${platformHashtag}`;
    }
  }
}

export default function CaptionGeneratorPage() {
  const { user } = useAuth();
  const { consumeCredit, isPro, remainingCredits } = useCredits();
  const toast = useToast();

  const [product, setProduct] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');

  const handleGenerate = async () => {
    if (!product.trim()) {
      toast.warning('Please describe your product or service first.');
      return;
    }

    if (!isPro && remainingCredits <= 0) {
      toast.error('No credits remaining. Upgrade to Pro!');
      return;
    }

    setIsGenerating(true);
    setGeneratedCaption('');

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = await consumeCredit();
    if (result?.needsUpgrade) {
      setIsGenerating(false);
      return;
    }

    // Generate dynamic custom caption matching context and language
    const caption = generateMockCaption(product, platform, tone);

    // Save to Supabase DB if user session exists
    if (user?.id) {
      const { error } = await supabase.from('captions').insert({
        user_id: user.id,
        description: product,
        platform,
        tone,
        content: caption,
        created_at: new Date().toISOString()
      });
      if (error) console.error('Error saving caption to Supabase:', error);
    }

    setGeneratedCaption(caption);
    setIsGenerating(false);
    toast.success('Caption generated successfully!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCaption);
    toast.success('Caption copied to clipboard!');
  };

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <h1><Sparkles size={28} /> AI Caption Generator</h1>
        <p>Describe your product, pick a platform and tone, and let AI craft the perfect caption.</p>
      </div>

      <div className="generator-layout">
        {/* Input Side */}
        <div className="generator-input card">
          <div className="form-group">
            <label className="form-label">Product / Service Description</label>
            <textarea
              className="form-input generator-textarea"
              placeholder="e.g. Handmade organic soap with lavender scent, perfect for sensitive skin..."
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Platform</label>
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
            <label className="form-label">Tone</label>
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
                      toast.info('Premium tones are available for Pro users.');
                      return;
                    }
                    setTone(t);
                  }}
                  disabled={!isPro}
                >
                  {t}
                  <span className="chip-badge">PRO</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            {isGenerating ? (
              <>
                <div className="spinner" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Caption
                {!isPro && <span className="btn-credit-cost"><Zap size={12} /> 1 credit</span>}
              </>
            )}
          </button>
        </div>

        {/* Output Side */}
        <div className="generator-output card">
          <h3>Generated Caption</h3>
          {generatedCaption ? (
            <>
              <div className="caption-result">
                <p>{generatedCaption}</p>
              </div>
              <div className="caption-actions">
                <button className="btn btn-secondary" onClick={handleCopy}>
                  <Copy size={16} /> Copy
                </button>
                <button className="btn btn-ghost">
                  <Heart size={16} /> Save
                </button>
                <button className="btn btn-ghost" onClick={handleGenerate}>
                  <RotateCcw size={16} /> Regenerate
                </button>
              </div>
            </>
          ) : (
            <div className="caption-empty">
              <Sparkles size={40} />
              <p>Your AI-generated caption will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
