# DESIGN.md - GC Financial Tracker Design System

Cetak biru antarmuka pengguna untuk GC Financial Tracker. Seluruh komponen dan halaman wajib patuh pada spesifikasi di dokumen ini.

## Karakter Desain & Filosofi
* Personal Financial Management bertema Warm Editorial Pinterest dengan sentuhan native iOS HIG.
* Mengutamakan kecepatan input transaksi keluarga dalam 3 detik.
* PWA friendly dengan optimasi iPhone 14 Pro dan iPhone 14 Pro Max termasuk safe area inset dan dynamic island padding.
* Anti AI Slop: Tanpa gradien ungu biru generik, tanpa bayangan berlebihan, tanpa card simetris kaku.

## Palet Warna

### Brand & Aksen Utama
* Primary Red: `#e60023`
* Primary Foreground: `#ffffff`
* Primary Pressed / Active: `#cc001f`

### Surface & Background
* Canvas Light: `#ffffff`
* Surface Soft: `#fbfbf9`
* Surface Card: `#f6f6f3`
* Surface Secondary: `#e5e5e0`
* Surface Dark: `#262622`
* Border Hairline: `#dadad3`
* Border Hairline Soft: `#e5e5e0`

### Tipografi & Tinta
* Ink Pure: `#000000`
* Ink Soft: `#211922`
* Ink Body: `#33332e`
* Ink Charcoal: `#262622`
* Ink Mute: `#62625b`
* Ink Ash: `#91918c`
* Ink Stone: `#c8c8c1`

### Status Finansial Semantik
* Expense: `#e60023`
* Income: `#10b981`
* Savings & Transfer: `#3b82f6`
* Debt & Bill: `#f59e0b`
* Success Deep: `#103c25`
* Success Pale: `#c7f0da`
* Error Deep: `#cc001f`
* Error Pale: `#fee2e2`

## Tipografi
* Font Family: Outfit, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif
* Ukuran Skala:
  - Display KPI: 2rem hingga 2.5rem, font-bold, tracking-tight, tabular-nums
  - Heading 1: 1.5rem, font-bold, tracking-tight
  - Heading 2: 1.25rem, font-semibold
  - Heading 3: 1.125rem, font-semibold
  - Body Base: 1rem, font-normal
  - Body Small: 0.875rem, font-normal
  - Caption / Micro: 0.75rem, font-medium
* Aturan Angka Finansial: Wajib menggunakan utilitas `tabular-nums` agar digit angka sejajar rapi saat rendering nominal uang.

## Radius Sudut
* Radius Small: 8px `rounded-lg` untuk tombol kecil dan badge
* Radius Medium: 16px `rounded-2xl` untuk card, popover, dan panel
* Radius Large: 24px hingga 32px `rounded-3xl` untuk modal drawer dan floating action button
* Radius Full: 9999px `rounded-full` untuk pill chips, avatar, dan circular action

## Spasi & Ukuran Sentuh
* Target Sentuh Minimum: 44px x 44px untuk semua elemen interaktif mobile touch target
* Padding Kontainer Mobile: 16px horizontal `px-4`
* Padding Kontainer Tablet / Desktop: 24px hingga 32px `px-6 md:px-8`
* Safe Area:
  - Header: `pt-safe`
  - Bottom Bar / Floating Action: `pb-safe` dengan tambahan ruang 16px
  - Viewport Height: `min-h-dvh` atau `h-dvh`, dilarang memakai `h-screen` kaku

## Standar Empat Status UI
Setiap halaman atau modul wajib memiliki empat status:
1. Status Loading: Skeleton struktural yang menyerupai bentuk konten asli
2. Status Kosong: Ilustrasi minimal atau ikon bersih dengan teks panduan dan satu tombol aksi jelas
3. Status Error: Pesan error informatif dekat lokasi masalah dengan tombol coba lagi
4. Status Sukses: Konten utama dengan visual feedback halus maksimal 200ms
