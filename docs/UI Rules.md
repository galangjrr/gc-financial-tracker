Ini prompt aturan UI/UX Consistency & Isolation Guardrails yang siap kamu copy-paste langsung ke Agent AI kamu (Cursor, Claude Code, Windsurf, dll.).

Prompt ini mengunci aturan isolasi komponen, token warna, layout shell, dan state agar Agent AI tidak pernah melenceng saat membuat atau mengedit view menu apa pun.

Terapkan Aturan Isolasi & Konsistensi UI/UX (UI Consistency Guardrails) berikut secara ketat untuk seluruh pembuatan dan modifikasi view menu/halaman di dalam proyek ini:

Wajib Menggunakan Reusable Layout Shell:

Dilarang membuat wrapper/container layout halaman sendiri secara acak.

Semua view menu di app/(dashboard)/*/page.tsx WAJIB dibungkus menggunakan PageShell dari @/components/shared/page-shell.

Struktur halaman harus konsisten: Header (Judul & Subjudul) -> Rangkuman Metric Cards -> Filter Bar -> Main Content/Table.

Conditional UI (Personal vs Keluarga): Jika tenant (`family`) memiliki `account_type = 'personal'`, maka hilangkan segala referensi kata "Keluarga" (misal: "Total Kekayaan Keluarga" menjadi "Total Kekayaan") dan sembunyikan fitur manajemen anggota keluarga.

Isolasi Token Warna & Tipografi (Anti-AI-Slop):

Dilarang keras menggunakan warna hex manual (misal: #123456) atau warna arbitrari Tailwind tanpa token (misal: bg-blue-600, text-red-500).

Identitas Aplikasi & Aksi Utama: WAJIB brand-700 (#15803D) atau brand-900.

Pengeluaran / Liabilitas: WAJIB financial-expense (#E11D48).

Pemasukan: WAJIB financial-income (#10B981).

Tabungan: WAJIB financial-savings (#0284C7).

Tagihan: WAJIB financial-bill (#D97706).

Background Surface: WAJIB bg-surface-light (#F8FAFC) dan Card bg-surface-card (#FFFFFF).

Teks Nominal Uang WAJIB diformat Rupiah (Rp 1.500.000) dan menggunakan font-bold.

Standarisasi Tampilan State (Mandatory View States):
Setiap view menu WAJIB menangani 3 state berikut menggunakan komponen terisolasi:

Loading State: Dilarang menggunakan spinner bulat polos. Gunakan <Skeleton/> dari @/components/ui/skeleton yang bentuknya persis menyerupai tata letak komponen aslinya.

Empty State: Gunakan komponen <EmptyState/> dari @/components/shared/empty-state dengan ikon muted, pesan Bahasa Indonesia, dan 1 tombol Call-to-Action utama.

Error State: Tampilkan banner alert merah transparan dengan tombol "Coba Lagi" (Retry).

Penegakan The 3-Clicks Rule & Responsive Modals:

Seluruh form input atau aksi modal harus bisa diselesaikan maksimal dalam 3 klik/interaksi dari halaman utama.

Form/Modal WAJIB bersifat responsif: Tampil sebagai Dialog melayang di Desktop (sm:max-w-[425px]), dan otomatis menjadi Bottom Sheet (Drawer) pada layar mobile.

Aturan Refactoring & Ukuran File:

Batas Maksimum File UI: Maksimal 250 baris kode per file.

Jika file menu melebihi 250 baris, Agent AI WAJIB memecah komponen menjadi sub-komponen kecil di dalam folder features/<feature_name>/components/.

Patuhi aturan isolasi UI/UX ini tanpa pengecualian pada setiap perubahan kode tampilan visual.