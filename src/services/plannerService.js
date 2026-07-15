/* ========================================
   KataLaku AI — Planner Service
   ======================================== */

import { supabase } from '../utils/supabase';

// Helper: Get Monday of the current week (YYYY-MM-DD)
export function getMondayOfThisWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// Highly tailored backup planner presets in case Gemini API is not connected or offline
const PLANNER_PRESETS = {
  fashion: [
    { day: 'Monday', theme: 'OOTD Starter Pack', reasoning: 'Meningkatkan engagement visual di awal minggu saat orang mencari inspirasi pakaian kerja/kampus.' },
    { day: 'Tuesday', theme: 'Trend Watch / Mix & Match', reasoning: 'Menunjukkan keahlian memadupadankan koleksi Anda dengan tren fesyen terkini.' },
    { day: 'Wednesday', theme: 'Product Showcase & Detail Zoom', reasoning: 'Fokus pada detail bahan dan kualitas jahitan untuk membangun kepercayaan kualitas produk.' },
    { day: 'Thursday', theme: 'Behind The Brand / Storytelling', reasoning: 'Menceritakan proses kurasi atau di balik layar pembuatan produk untuk kedekatan emosional.' },
    { day: 'Friday', theme: 'Weekend Prep / Promo Kilat', reasoning: 'Mendorong pembelian impulsif menjelang akhir pekan saat masa gajian atau waktu santai.' },
    { day: 'Saturday', theme: 'Testimoni & Review Pelanggan', reasoning: 'Menyajikan social proof berupa ulasan positif pelanggan untuk meyakinkan calon pembeli.' },
    { day: 'Sunday', theme: 'Interactive Q&A / Polls', reasoning: 'Meningkatkan interaksi santai hari libur melalui jajak pendapat atau tips perawatan baju.' },
  ],
  food: [
    { day: 'Monday', theme: 'Monday Energy Booster', reasoning: 'Menawarkan menu makanan/minuman segar sebagai penyemangat memulai rutinitas kerja.' },
    { day: 'Tuesday', theme: 'Behind The Kitchen / Kebersihan', reasoning: 'Menunjukkan kebersihan dapur dan kualitas bahan masakan untuk jaminan rasa.' },
    { day: 'Wednesday', theme: 'Menu Favorit Spotlight', reasoning: 'Mengulas detail rasa dan keunikan menu paling laris di toko Anda.' },
    { day: 'Thursday', theme: 'Customer Reaction / Mukbang', reasoning: 'Menampilkan video/foto ekspresi pelanggan menikmati makanan Anda sebagai bukti kelezatan.' },
    { day: 'Friday', theme: 'Paket Keluarga / Promo Jumat Berkah', reasoning: 'Menawarkan promo bundle menjelang akhir pekan untuk konsumsi bersama.' },
    { day: 'Saturday', theme: 'Fun Food Facts / Edukasi Kuliner', reasoning: 'Membagikan fakta menarik tentang asal-usul menu atau bahan unik masakan Anda.' },
    { day: 'Sunday', theme: 'Review & Testimoni Pelanggan', reasoning: 'Mengunggah ulang ulasan positif/rating bintang 5 dari aplikasi ojek online/sosial media.' },
  ],
  beauty: [
    { day: 'Monday', theme: 'Skincare/Makeup Tutorial', reasoning: 'Memberikan tips praktis langkah-langkah penggunaan produk di awal minggu.' },
    { day: 'Tuesday', theme: 'Edukasi Kandungan Bahan (Ingredients)', reasoning: 'Menjelaskan manfaat ilmiah dari kandungan aktif produk (misal: Niacinamide).' },
    { day: 'Wednesday', theme: 'Before vs After Challenge', reasoning: 'Menampilkan transformasi nyata sebelum dan sesudah pemakaian produk secara konsisten.' },
    { day: 'Thursday', theme: 'Mitos vs Fakta Kecantikan', reasoning: 'Membahas kesalahpahaman umum seputar perawatan kulit untuk membangun otoritas edukasi.' },
    { day: 'Friday', theme: 'Weekend Self-Care Routine', reasoning: 'Mengajak audiens memanjakan diri akhir pekan dengan produk masker atau spa Anda.' },
    { day: 'Saturday', theme: 'Review Jujur Influencer / Pembeli', reasoning: 'Menampilkan testimonial tepercaya dari pengguna yang kulitnya membaik.' },
    { day: 'Sunday', theme: 'Q&A Kulit Sensitif / Tips Sehat', reasoning: 'Membuka sesi tanya jawab interaktif seputar keluhan kulit audiens.' },
  ],
  electronics: [
    { day: 'Monday', theme: 'Product Feature Breakdown', reasoning: 'Mengupas tuntas satu fitur canggih utama dari gadget/elektronik jualan Anda.' },
    { day: 'Tuesday', theme: 'Unboxing & First Impression', reasoning: 'Video atau foto estetik saat membuka kemasan baru produk untuk rasa penasaran.' },
    { day: 'Wednesday', theme: 'Perbandingan Produk (A vs B)', reasoning: 'Membantu calon pembeli menentukan pilihan produk yang sesuai kebutuhan mereka.' },
    { day: 'Thursday', theme: 'Tips & Trik Pemakaian Efisien', reasoning: 'Membagikan cara rahasia memaksimalkan fungsi barang elektronik tersebut.' },
    { day: 'Friday', theme: 'Solusi Masalah Harian', reasoning: 'Menjelaskan bagaimana produk Anda memecahkan masalah spesifik audiens.' },
    { day: 'Saturday', theme: 'Garansi & Layanan Purna Jual', reasoning: 'Menjelaskan kebijakan garansi dan jaminan kualitas untuk keamanan belanja.' },
    { day: 'Sunday', theme: 'Promo Bundle & Diskon Spesial', reasoning: 'Penawaran paket bundling menarik untuk checkout di akhir pekan.' },
  ],
  home_living: [
    { day: 'Monday', theme: 'Home Inspo / Room Makeover', reasoning: 'Inspirasi dekorasi ruangan estetik untuk memulai awal minggu dengan segar.' },
    { day: 'Tuesday', theme: 'Tips Merapikan Rumah (Decluttering)', reasoning: 'Tips praktis menata barang di rumah agar terlihat lebih luas dan rapi.' },
    { day: 'Wednesday', theme: 'Product Spotlight & Functionality', reasoning: 'Menyoroti keunikan fungsi barang rumah tangga/dapur jualan Anda.' },
    { day: 'Thursday', theme: 'Behind the Scenes / Packaging', reasoning: 'Proses pengemasan barang pecah belah dengan bubble wrap tebal agar aman.' },
    { day: 'Friday', theme: 'Weekend Cleaning Prep', reasoning: 'Tips bersih-bersih rumah menyambut akhir pekan yang produktif.' },
    { day: 'Saturday', theme: 'Review Estetik Pelanggan', reasoning: 'Menampilkan sudut ruangan rumah pembeli yang dihiasi produk Anda.' },
    { day: 'Sunday', theme: 'DIY/Life Hacks Rumahan', reasoning: 'Trik sederhana memanfaatkan barang di rumah untuk mempermudah hidup.' },
  ],
  other: [
    { day: 'Monday', theme: 'Product Introduction', reasoning: 'Mengenalkan kembali lini produk utama atau jasa yang Anda tawarkan.' },
    { day: 'Tuesday', theme: 'Edukasi Manfaat Utama', reasoning: 'Menjelaskan mengapa produk/jasa Anda adalah solusi terbaik untuk audiens.' },
    { day: 'Wednesday', theme: 'Tips Harian Relevan', reasoning: 'Berbagi tips berguna yang berhubungan erat dengan industri jualan Anda.' },
    { day: 'Thursday', theme: 'Behind the Scenes / Tim Kami', reasoning: 'Menunjukkan proses kerja atau perkenalan tim untuk membangun kepercayaan.' },
    { day: 'Friday', theme: 'Weekend Flash Sale / Special Offer', reasoning: 'Mendorong keputusan transaksi cepat lewat diskon akhir pekan.' },
    { day: 'Saturday', theme: 'Ulasan / Testimoni Bintang 5', reasoning: 'Menampilkan review pembeli puas sebagai bukti kredibilitas toko.' },
    { day: 'Sunday', theme: 'Interaksi & Kuis Santai', reasoning: 'Meningkatkan kedekatan audiens lewat games, tebakan, atau Q&A.' },
  ]
};

// Check local storage plan as fallback
function getLocalPlan(weekStart) {
  const stored = localStorage.getItem(`local_plan_${weekStart}`);
  return stored ? JSON.parse(stored) : null;
}

function saveLocalPlan(weekStart, plan) {
  localStorage.setItem(`local_plan_${weekStart}`, JSON.stringify(plan));
}

// Fetch content plan from Supabase (or fallback localstorage)
export async function fetchWeeklyPlan(userId, weekStart) {
  try {
    const { data, error } = await supabase
      .from('content_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStart)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('DB error, using local fallback:', error);
      return getLocalPlan(weekStart);
    }

    if (data) {
      return data.plan_data;
    }
  } catch (e) {
    console.error('Fetch plan error:', e);
  }
  return getLocalPlan(weekStart);
}

// Check generation quota (Free is limited to 1x per week, Pro is unlimited)
export async function checkPlanQuota(userId, isPro) {
  if (isPro) return { allowed: true };

  const weekStart = getMondayOfThisWeek();
  try {
    const { data, error } = await supabase
      .from('plan_generation_quota')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('DB quota check error, using local storage fallback:', error);
      const lastGen = localStorage.getItem(`quota_last_gen`);
      if (lastGen === weekStart) {
        return { allowed: false, limitReached: true };
      }
      return { allowed: true };
    }

    if (data) {
      // If generated this week
      if (data.generations_this_week >= 1) {
        // Double check date
        const lastGenDate = new Date(data.last_generated_at).toISOString().split('T')[0];
        // If last generation was within this week starting monday
        if (lastGenDate >= weekStart) {
          return { allowed: false, limitReached: true };
        }
      }
    }
  } catch (e) {
    console.error('Quota check exception:', e);
  }

  // Check local fallback
  const lastGen = localStorage.getItem(`quota_last_gen`);
  if (lastGen === weekStart) {
    return { allowed: false, limitReached: true };
  }
  return { allowed: true };
}

// Update generation quota after success
async function incrementPlanQuota(userId) {
  const weekStart = getMondayOfThisWeek();
  const now = new Date().toISOString();

  try {
    const { data: existing } = await supabase
      .from('plan_generation_quota')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const lastGenDate = new Date(existing.last_generated_at).toISOString().split('T')[0];
      const count = lastGenDate >= weekStart ? existing.generations_this_week + 1 : 1;
      
      await supabase
        .from('plan_generation_quota')
        .upsert({
          user_id: userId,
          last_generated_at: now,
          generations_this_week: count
        });
    } else {
      await supabase
        .from('plan_generation_quota')
        .insert({
          user_id: userId,
          last_generated_at: now,
          generations_this_week: 1
        });
    }
  } catch (e) {
    console.warn('DB increment quota failed, using local storage:', e);
  }

  localStorage.setItem(`quota_last_gen`, weekStart);
}

// Generate weekly plan using Gemini or local preset fallback
export async function generateWeeklyPlan(userId, category, isPro) {
  const weekStart = getMondayOfThisWeek();

  // 1. Quota Check
  const quota = await checkPlanQuota(userId, isPro);
  if (!quota.allowed) {
    return { error: 'QUOTA_EXCEEDED', limitReached: true };
  }

  // 2. Generate Plan Data
  // We'll prepare a structured content plan matching the selected category.
  // In a production environment with a configured VITE_GEMINI_API_KEY, we could run a real fetch:
  let planData = {
    category: category,
    week_plan: PLANNER_PRESETS[category] || PLANNER_PRESETS.other
  };

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `Kamu adalah social media content strategist untuk UMKM Indonesia.
Fokus: reseller/seller kategori ${category}.

Tugasmu: generate 7 ide konten tema harian yang SPESIFIK untuk kategori ${category}.

STRATEGI PER KATEGORI:
- fashion: fokus visual/styling, OOTD, trend tips, social proof
- food: fokus appetite appeal, resep, behind-the-scenes, promo flash sale
- beauty: fokus tutorial/tips, before-after, edukasi bahan, testimonial
- electronics: fokus feature comparison, unboxing, review pengguna, promo
- home_living: fokus interior inspo, DIY tips, lifestyle content, tema musiman
- other: fokus umum — edukasi produk, promo, testimoni, behind-the-scenes

INSTRUKSI:
1. Generate 7 tema unik, satu per hari (Senin–Minggu)
2. Setiap tema harus actionable — user bisa langsung generate caption dari tema ini
3. Sesuaikan dengan pola engagement khas Indonesia (weekday vs weekend)
4. Sertakan reasoning singkat per tema (maks 1 kalimat)
5. Jawab HANYA dalam format JSON, tanpa teks tambahan

OUTPUT FORMAT (JSON):
{
  "category": "${category}",
  "week_plan": [
    { "day": "Monday", "theme": "...", "reasoning": "..." },
    { "day": "Tuesday", "theme": "...", "reasoning": "..." },
    { "day": "Wednesday", "theme": "...", "reasoning": "..." },
    { "day": "Thursday", "theme": "...", "reasoning": "..." },
    { "day": "Friday", "theme": "...", "reasoning": "..." },
    { "day": "Saturday", "theme": "...", "reasoning": "..." },
    { "day": "Sunday", "theme": "...", "reasoning": "..." }
  ]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.8
          }
        })
      });

      if (response.ok) {
        const rawJson = await response.json();
        const responseText = rawJson.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(responseText.trim());
        if (parsed.week_plan && parsed.week_plan.length === 7) {
          planData = parsed;
        }
      }
    } catch (apiError) {
      console.warn('Real Gemini Call failed, falling back to preset:', apiError);
    }
  }

  // 3. Save to Supabase (resilient fallback)
  try {
    await supabase.from('content_plans').insert({
      user_id: userId,
      week_start_date: weekStart,
      product_category: category,
      plan_data: planData,
      is_pro_generation: isPro,
      generated_at: new Date().toISOString()
    });
  } catch (dbInsertError) {
    console.warn('Failed to insert into content_plans table in DB, saving locally:', dbInsertError);
  }

  // Save to local storage as fallback
  saveLocalPlan(weekStart, planData);

  // 4. Update Quota
  await incrementPlanQuota(userId);

  return { planData };
}
