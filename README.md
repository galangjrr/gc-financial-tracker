# GC Financial Tracker

> "Biar nggak pusing mikirin uang sisa berapa, biar kita yang bantu catat."

Halo! Selamat datang di GC Financial Tracker, aplikasi pencatat keuangan yang dibuat khusus supaya kamu bisa lebih gampang ngatur uang jajan, tabungan, sampai pengeluaran bulanan.

Dibuat supaya kamu nggak perlu lagi repot buka kalkulator tiap akhir bulan, dan uang tetap aman sampai gajian selanjutnya.

---

## Fitur Utama

- Beranda & Pantau Uang: Dashboard visual yang rapi menggunakan Recharts. Pantau arus kas kamu tanpa repot.
- Dompet Multi-Wallet: Pisahkan uang jajan, tabungan, dan dompet darurat supaya nggak campur aduk.
- Budgeting: Atur batas pengeluaran bulanan biar kamu nggak kebablasan jajan.
- Catat Utang: Biar kamu nggak lupa kalau ada yang pinjam uang atau sebaliknya.
- Nabung: Punya target beli barang impian? Catat dan pantau progress-nya di sini.
- Fitur Keluarga: Kelola dompet bareng pasangan atau keluarga biar makin transparan.
- AI Assistant: Didukung oleh Google Gemini AI untuk kasih kamu rekomendasi finansial.

---

## Teknologi yang Dipakai

- Framework: Next.js 16 + React 19
- Backend & Database: Supabase (Postgres, Realtime, RLS)
- Styling: Tailwind CSS + Radix UI + Vaul
- State & Form: React Hook Form + Zod
- Intelligence: Google Generative AI (Gemini SDK)

---

## Cara Menjalankan di Lokal

1. Clone repositori ini ke komputer kamu:
   ```bash
   git clone https://github.com/galangjrr/gc-financial-tracker.git
   cd gc-financial-tracker
   ```

2. Install semua dependencies:
   ```bash
   npm install
   ```

3. Atur Environment Variable (.env.local):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000` dan aplikasi siap digunakan.

---

## Kontribusi

Punya ide fitur seru atau nemu bug? Silakan buat Pull Request atau tinggalkan pesan di bagian Issue. Mari kita kembangkan aplikasi ini bareng-bareng.

---

Dibuat oleh [galangjrr](https://github.com/galangjrr)
