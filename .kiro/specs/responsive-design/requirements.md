# Requirements Document

## Introduction

Fitur ini bertujuan membuat website Respira.ID responsif di semua ukuran layar dan browser utama. Saat ini layout menggunakan Tailwind CSS dengan beberapa breakpoint `md:` namun belum dioptimasi secara menyeluruh — terutama untuk mobile (< 768px) dan tablet (768px–1024px). Cakupan meliputi seluruh halaman (Dashboard, Auth, Diagnosa, Chat, Konsultasi, Riwayat, Profil, Admin) beserta komponen layout (Sidebar, Header, AppShell), modal, widget, dan kartu. Target browser mencakup Chrome, Safari, Brave, Firefox, dan browser mobile berbasis WebKit/Blink.

## Glossary

- **App**: Aplikasi web Respira.ID secara keseluruhan
- **AppShell**: Komponen pembungkus layout utama (`AppShell.jsx`) yang menggabungkan Sidebar, Header, dan konten halaman
- **Sidebar**: Panel navigasi vertikal kiri yang saat ini hanya tampil di layar `md:` ke atas (`Sidebar.jsx`, `SidebarExpert.jsx`)
- **Header**: Bar navigasi atas yang berisi breadcrumb, notifikasi, dan profil pengguna (`Header.jsx`)
- **TopNav**: Komponen navigasi horizontal atas yang menggantikan Sidebar untuk semua role pengguna (`TopNav.jsx`)
- **BottomNav**: Komponen navigasi bawah layar yang akan ditampilkan pada perangkat mobile sebagai pengganti Sidebar
- **Dashboard**: Halaman utama pengguna (`DashboardUser.jsx`) dengan layout bento grid multi-kolom
- **DashboardExpert**: Halaman utama dokter/expert (`DashboardExpert.jsx`) dengan layout bento grid multi-kolom
- **BentoGrid**: Pola layout grid multi-kolom yang digunakan di halaman Dashboard
- **Modal**: Komponen overlay dialog seperti `BookingModal.jsx` dan `DailyTestModal.jsx`
- **Widget**: Komponen kartu fungsional seperti `BreathingWidget`, `ScoreCard`, `AQICard`
- **Chat**: Halaman pesan telemedicine (`Chat.jsx`) dengan layout dua panel (daftar kontak + area pesan)
- **ProfileExpert**: Halaman profil profesional dokter (`ProfileExpert.jsx`) dengan form kredensial
- **ConsultationHistory**: Halaman riwayat diagnosa pasien untuk dokter (`ConsultationHistory.jsx`) dengan tabel dan filter
- **ExpertResearch**: Halaman riset AI dan manajemen logika untuk dokter (`ExpertResearch.jsx`)
- **Breakpoint_Mobile**: Lebar layar < 768px (smartphone)
- **Breakpoint_Tablet**: Lebar layar 768px–1023px (tablet, iPad)
- **Breakpoint_Desktop**: Lebar layar ≥ 1024px (laptop, desktop)
- **Touch_Target**: Area yang dapat disentuh pada layar sentuh, minimal 44×44px sesuai standar aksesibilitas
- **Viewport**: Area tampilan browser yang terlihat oleh pengguna
- **Safe_Area**: Area layar yang tidak terhalang oleh notch, home indicator, atau UI sistem pada perangkat mobile

---

## Requirements

### Requirement 1: Navigasi Responsif

**User Story:** Sebagai pengguna mobile, saya ingin dapat mengakses semua menu navigasi dengan mudah di smartphone, sehingga saya tidak perlu melakukan zoom atau scroll horizontal untuk menemukan menu.

#### Acceptance Criteria

1. WHILE layar berada pada Breakpoint_Mobile, THE AppShell SHALL menyembunyikan Sidebar dan menampilkan BottomNav di bagian bawah layar
2. WHILE layar berada pada Breakpoint_Tablet atau Breakpoint_Desktop, THE AppShell SHALL menampilkan Sidebar di sisi kiri dengan lebar tetap 260px
3. WHEN pengguna mengetuk tombol menu (hamburger) pada Header di Breakpoint_Mobile, THE Sidebar SHALL muncul sebagai overlay dengan animasi slide dari kiri
4. WHEN pengguna mengetuk area di luar Sidebar overlay, THE Sidebar SHALL menutup secara otomatis
5. THE BottomNav SHALL menampilkan maksimal 5 item navigasi utama dengan ikon dan label teks
6. THE BottomNav SHALL memiliki tinggi minimum 56px dan setiap Touch_Target SHALL memiliki ukuran minimum 44×44px
7. WHILE pengguna berada di halaman Chat, THE BottomNav SHALL tetap tampil di atas keyboard virtual pada perangkat mobile
8. IF perangkat memiliki Safe_Area (notch atau home indicator), THEN THE BottomNav SHALL menambahkan padding bawah sesuai `env(safe-area-inset-bottom)`

---

### Requirement 2: Layout Dashboard Responsif

**User Story:** Sebagai pengguna, saya ingin melihat semua widget dan informasi dashboard dengan nyaman di smartphone dan tablet, sehingga saya dapat memantau kesehatan paru-paru tanpa perlu scroll horizontal.

#### Acceptance Criteria

1. WHILE layar berada pada Breakpoint_Mobile, THE Dashboard SHALL menampilkan semua kolom BentoGrid dalam satu kolom penuh (single column)
2. WHILE layar berada pada Breakpoint_Tablet, THE Dashboard SHALL menampilkan BentoGrid dalam dua kolom
3. WHILE layar berada pada Breakpoint_Desktop, THE Dashboard SHALL menampilkan BentoGrid dalam layout 12-kolom seperti saat ini
4. THE Dashboard SHALL tidak menghasilkan horizontal scroll pada Breakpoint_Mobile maupun Breakpoint_Tablet
5. WHILE layar berada pada Breakpoint_Mobile, THE Dashboard SHALL menampilkan hero section dengan tinggi minimum 280px dan teks yang terbaca tanpa zoom
6. WHILE layar berada pada Breakpoint_Mobile, THE Dashboard SHALL menampilkan widget ScoreCard, AQICard, dan ProfileMiniCard secara vertikal berurutan
7. WHILE layar berada pada Breakpoint_Mobile, THE Dashboard SHALL menampilkan kartu telemedicine (NotificationCard dan ConsultationCard) secara vertikal berurutan dengan tinggi otomatis (bukan fixed height)
8. THE Dashboard SHALL memuat dan merender semua widget dalam waktu kurang dari 3 detik pada koneksi 4G

---

### Requirement 3: Halaman Autentikasi Responsif

**User Story:** Sebagai pengguna baru, saya ingin dapat mendaftar dan login dengan mudah di smartphone, sehingga saya dapat mengakses layanan Respira.ID dari perangkat apapun.

#### Acceptance Criteria

1. WHILE layar berada pada Breakpoint_Mobile, THE AuthPage SHALL menampilkan hanya panel form (panel kanan) secara penuh tanpa panel visual kiri
2. WHILE layar berada pada Breakpoint_Tablet atau Breakpoint_Desktop, THE AuthPage SHALL menampilkan layout dua panel (visual kiri + form kanan) secara berdampingan
3. THE AuthPage SHALL memastikan semua input field memiliki tinggi minimum 44px agar mudah diketuk pada layar sentuh
4. WHEN keyboard virtual muncul pada Breakpoint_Mobile, THE AuthPage SHALL memastikan tombol submit tetap dapat diakses dengan scroll
5. THE AuthPage SHALL tidak menghasilkan horizontal scroll pada resolusi 320px (iPhone SE generasi pertama)
6. IF pengguna mengisi form dengan data tidak valid, THEN THE AuthPage SHALL menampilkan pesan error yang terlihat tanpa tertutup keyboard virtual

---

### Requirement 4: Halaman Diagnosa Responsif

**User Story:** Sebagai pasien, saya ingin menyelesaikan proses diagnosa gejala dengan nyaman di smartphone, sehingga saya dapat menggunakan fitur utama Respira.ID kapan saja dan di mana saja.

#### Acceptance Criteria

1. WHILE layar berada pada Breakpoint_Mobile, THE Diagnosis SHALL menampilkan konten utama dan sidebar secara vertikal berurutan (konten utama di atas, sidebar di bawah)
2. WHILE layar berada pada Breakpoint_Desktop, THE Diagnosis SHALL menampilkan layout dua kolom (8/12 konten + 4/12 sidebar) seperti saat ini
3. THE Diagnosis SHALL memastikan setiap tombol pilihan jawaban memiliki tinggi minimum 48px dan lebar penuh pada Breakpoint_Mobile
4. WHEN pengguna memilih jawaban pada Breakpoint_Mobile, THE Diagnosis SHALL menampilkan tombol "Lanjut" yang selalu terlihat tanpa perlu scroll
5. WHILE layar berada pada Breakpoint_Mobile, THE Diagnosis SHALL menampilkan gambar visual aid dengan rasio aspek 16:9 dan lebar penuh
6. THE Diagnosis SHALL memastikan progress bar terlihat dan terbaca pada semua breakpoint
7. WHILE layar berada pada Breakpoint_Mobile, THE Diagnosis SHALL menampilkan hasil diagnosa (DiagnosisHeaderCard dan ClinicalAnalysis) dalam satu kolom penuh

---

### Requirement 5: Halaman Chat Responsif

**User Story:** Sebagai pengguna, saya ingin dapat berkonsultasi melalui chat dengan nyaman di smartphone, sehingga saya dapat berkomunikasi dengan dokter kapan saja.

#### Acceptance Criteria

1. WHILE layar berada pada Breakpoint_Mobile dan tidak ada chat aktif, THE Chat SHALL menampilkan hanya daftar kontak secara penuh
2. WHEN pengguna memilih kontak pada Breakpoint_Mobile, THE Chat SHALL menampilkan area pesan secara penuh dan menyembunyikan daftar kontak
3. WHEN pengguna menekan tombol kembali pada area pesan di Breakpoint_Mobile, THE Chat SHALL kembali menampilkan daftar kontak
4. WHILE layar berada pada Breakpoint_Tablet atau Breakpoint_Desktop, THE Chat SHALL menampilkan layout dua panel (daftar kontak + area pesan) secara berdampingan
5. WHEN keyboard virtual muncul pada Breakpoint_Mobile, THE Chat SHALL memastikan input pesan dan tombol kirim tetap terlihat di atas keyboard
6. THE Chat SHALL memastikan gelembung pesan tidak melebihi 85% lebar layar pada Breakpoint_Mobile
7. THE Chat SHALL memastikan area input pesan memiliki tinggi minimum 44px dan Touch_Target tombol kirim minimum 44×44px

---

### Requirement 6: Modal Responsif

**User Story:** Sebagai pengguna, saya ingin dapat menggunakan semua modal (booking, tes harian) dengan nyaman di smartphone, sehingga saya tidak perlu scroll horizontal atau mengalami konten yang terpotong.

#### Acceptance Criteria

1. WHILE layar berada pada Breakpoint_Mobile, THE Modal SHALL menampilkan diri sebagai bottom sheet yang muncul dari bawah layar dengan tinggi maksimum 90% Viewport
2. WHILE layar berada pada Breakpoint_Tablet atau Breakpoint_Desktop, THE Modal SHALL menampilkan diri sebagai dialog terpusat seperti saat ini
3. THE Modal SHALL memiliki area konten yang dapat di-scroll secara vertikal jika konten melebihi tinggi yang tersedia
4. THE Modal SHALL memastikan tombol tutup (X) selalu terlihat dan dapat diakses dengan Touch_Target minimum 44×44px
5. WHEN keyboard virtual muncul saat mengisi form dalam Modal, THE Modal SHALL menyesuaikan posisi agar field yang aktif tetap terlihat
6. IF pengguna menggeser Modal ke bawah (swipe down) pada Breakpoint_Mobile, THEN THE Modal SHALL menutup secara otomatis
7. THE Modal SHALL memastikan semua elemen form (select, input, textarea) memiliki tinggi minimum 44px

---

### Requirement 7: Tipografi dan Keterbacaan Responsif

**User Story:** Sebagai pengguna, saya ingin dapat membaca semua teks di website dengan nyaman tanpa perlu zoom, sehingga pengalaman membaca tetap nyaman di semua ukuran layar.

#### Acceptance Criteria

1. THE App SHALL memastikan tidak ada teks yang berukuran lebih kecil dari 12px pada semua breakpoint
2. WHILE layar berada pada Breakpoint_Mobile, THE App SHALL memastikan teks heading utama tidak melebihi lebar Viewport
3. THE App SHALL memastikan line-height minimum 1.5 untuk teks paragraf pada semua breakpoint
4. WHILE layar berada pada Breakpoint_Mobile, THE Dashboard SHALL mengurangi ukuran font heading hero dari `text-5xl` menjadi `text-3xl`
5. THE App SHALL memastikan kontras warna teks terhadap latar belakang memenuhi rasio minimum 4.5:1 sesuai WCAG 2.1 AA pada semua breakpoint
6. WHERE fitur dark mode diaktifkan, THE App SHALL mempertahankan keterbacaan yang sama pada semua breakpoint

---

### Requirement 8: Kompatibilitas Browser

**User Story:** Sebagai pengguna, saya ingin website Respira.ID berfungsi dengan baik di browser yang saya gunakan (Safari, Brave, Chrome, Firefox), sehingga saya tidak perlu mengganti browser untuk mengakses layanan.

#### Acceptance Criteria

1. THE App SHALL merender layout dan fungsionalitas inti dengan benar pada Chrome versi 110 ke atas
2. THE App SHALL merender layout dan fungsionalitas inti dengan benar pada Safari versi 15 ke atas (termasuk Safari iOS)
3. THE App SHALL merender layout dan fungsionalitas inti dengan benar pada Firefox versi 110 ke atas
4. THE App SHALL merender layout dan fungsionalitas inti dengan benar pada Brave (berbasis Chromium terbaru)
5. WHEN pengguna mengakses App menggunakan Safari iOS, THE App SHALL memastikan `position: fixed` pada Header dan BottomNav berfungsi dengan benar tanpa lompatan saat scroll
6. WHEN pengguna mengakses App menggunakan Safari iOS, THE App SHALL menggunakan `env(safe-area-inset-*)` untuk menghindari konten tertutup notch atau home indicator
7. THE App SHALL memastikan animasi Framer Motion berjalan dengan benar pada semua browser target tanpa fallback yang rusak
8. IF browser tidak mendukung `backdrop-filter`, THEN THE App SHALL menampilkan latar belakang solid sebagai fallback untuk komponen yang menggunakan efek blur

---

### Requirement 9: Performa pada Perangkat Mobile

**User Story:** Sebagai pengguna smartphone, saya ingin website Respira.ID memuat dengan cepat dan responsif terhadap sentuhan, sehingga pengalaman penggunaan terasa lancar meskipun di perangkat dengan spesifikasi menengah.

#### Acceptance Criteria

1. THE App SHALL mencapai skor Lighthouse Performance minimum 70 pada simulasi perangkat mobile
2. THE App SHALL memastikan First Contentful Paint (FCP) kurang dari 2.5 detik pada koneksi 4G simulasi
3. THE App SHALL memastikan tidak ada layout shift yang signifikan (Cumulative Layout Shift < 0.1) saat halaman dimuat
4. WHILE layar berada pada Breakpoint_Mobile, THE App SHALL menonaktifkan atau menyederhanakan animasi berat seperti BioNetwork canvas jika `prefers-reduced-motion` diaktifkan
5. THE App SHALL memastikan semua gambar memiliki atribut `width` dan `height` yang eksplisit untuk mencegah layout shift
6. WHEN pengguna melakukan scroll pada Breakpoint_Mobile, THE App SHALL memastikan scroll berjalan pada 60fps tanpa jank yang terasa

---

### Requirement 10: Halaman-Halaman Lain Responsif

**User Story:** Sebagai pengguna, saya ingin semua halaman Respira.ID (Riwayat, Profil, Berita, Konsultasi, Kamus) dapat digunakan dengan nyaman di smartphone dan tablet, sehingga seluruh fitur dapat diakses dari perangkat apapun.

#### Acceptance Criteria

1. WHILE layar berada pada Breakpoint_Mobile, THE Riwayat SHALL menampilkan daftar riwayat diagnosa dalam satu kolom dengan kartu yang memiliki lebar penuh
2. WHILE layar berada pada Breakpoint_Mobile, THE Profile SHALL menampilkan form profil dalam satu kolom dengan semua input field memiliki lebar penuh
3. WHILE layar berada pada Breakpoint_Mobile, THE Konsultasi SHALL menampilkan daftar jadwal konsultasi dalam satu kolom tanpa horizontal scroll
4. WHILE layar berada pada Breakpoint_Mobile, THE News SHALL menampilkan daftar berita dalam satu kolom dengan gambar thumbnail yang proporsional
5. THE App SHALL memastikan semua halaman tidak menghasilkan horizontal scroll pada Breakpoint_Mobile dengan lebar minimum 320px
6. WHILE layar berada pada Breakpoint_Tablet, THE App SHALL menampilkan konten halaman dalam dua kolom jika konten mendukung layout grid
7. THE App SHALL memastikan semua tabel data (jika ada) dapat di-scroll secara horizontal dalam container-nya sendiri, bukan seluruh halaman

---

### Requirement 11: Dashboard Expert Responsif

**User Story:** Sebagai dokter (expert), saya ingin melihat dashboard saya dengan nyaman di smartphone, sehingga saya dapat memantau pasien, permintaan konsultasi, dan kasus kritis kapan saja dari perangkat apapun.

#### Acceptance Criteria

1. WHILE layar berada pada Breakpoint_Mobile, THE DashboardExpert SHALL menampilkan hero section dengan heading berukuran `text-2xl` yang meningkat ke `text-4xl` di Breakpoint_Tablet dan `text-5xl` di Breakpoint_Desktop
2. WHILE layar berada pada Breakpoint_Mobile, THE DashboardExpert SHALL menampilkan metrics (Pasien Kritis, Total Diagnosa, Permintaan Masuk) sebagai horizontal scroll strip dengan kartu berukuran tetap (compact cards), bukan grid tiga kolom
3. WHILE layar berada pada Breakpoint_Tablet atau Breakpoint_Desktop, THE DashboardExpert SHALL menampilkan metrics dalam grid tiga kolom seperti saat ini
4. THE DashboardExpert SHALL memastikan widget dengan fixed height (`h-[200px]`, `h-[250px]`) diganti dengan tinggi otomatis (`h-auto`) pada Breakpoint_Mobile agar konten tidak terpotong
5. THE DashboardExpert SHALL memastikan tabel riwayat diagnosa dapat di-scroll secara horizontal dalam container-nya sendiri pada Breakpoint_Mobile, bukan seluruh halaman
6. WHILE layar berada pada Breakpoint_Mobile, THE DashboardExpert SHALL menambahkan padding bawah minimum `pb-24` agar konten tidak tertutup BottomNav
7. WHILE layar berada pada Breakpoint_Mobile, THE DashboardExpert SHALL menampilkan hero section dengan tinggi minimum 200px (bukan fixed 350px) agar tidak mendominasi layar kecil
8. WHILE layar berada pada Breakpoint_Mobile, THE DashboardExpert SHALL menampilkan deskripsi hero yang dipersingkat (versi compact) agar terbaca tanpa scroll berlebihan

---

### Requirement 12: Profil Expert Responsif

**User Story:** Sebagai dokter (expert), saya ingin dapat mengisi dan memperbarui profil profesional saya dengan nyaman di smartphone, sehingga saya dapat mengelola informasi kredensial dari perangkat apapun.

#### Acceptance Criteria

1. THE ProfileExpert SHALL memastikan semua input field (Nama, Email, Gelar, Instansi, Nomor SIP) memiliki tinggi minimum 44px agar mudah diketuk pada layar sentuh
2. WHILE layar berada pada Breakpoint_Mobile, THE ProfileExpert SHALL menampilkan grid dua kolom (Nama + Email) dalam satu kolom penuh secara vertikal
3. THE ProfileExpert SHALL memastikan tombol "Simpan Perubahan" memiliki tinggi minimum 44px dan lebar penuh pada Breakpoint_Mobile
4. WHILE layar berada pada Breakpoint_Mobile, THE ProfileExpert SHALL menambahkan padding konten yang cukup (`p-4` atau `p-5`) agar teks tidak terlalu rapat dengan tepi layar
5. THE ProfileExpert SHALL tidak menghasilkan horizontal scroll pada Breakpoint_Mobile dengan lebar minimum 320px

---

### Requirement 13: Riwayat Konsultasi Expert Responsif

**User Story:** Sebagai dokter (expert), saya ingin dapat mencari dan melihat riwayat diagnosa pasien dengan nyaman di smartphone, sehingga saya dapat mengakses arsip medis kapan saja.

#### Acceptance Criteria

1. WHILE layar berada pada Breakpoint_Mobile, THE ConsultationHistory SHALL menampilkan search input dengan lebar penuh (`w-full`) menggantikan lebar tetap `w-64` yang dapat overflow
2. WHILE layar berada pada Breakpoint_Mobile, THE ConsultationHistory SHALL menampilkan header section (judul + search + filter) dalam layout satu kolom secara vertikal
3. THE ConsultationHistory SHALL memastikan tabel riwayat diagnosa dapat di-scroll secara horizontal dalam container-nya sendiri pada Breakpoint_Mobile
4. WHILE layar berada pada Breakpoint_Tablet atau Breakpoint_Desktop, THE ConsultationHistory SHALL menampilkan header section dalam layout baris (judul di kiri, search + filter di kanan) seperti saat ini
5. THE ConsultationHistory SHALL tidak menghasilkan horizontal scroll pada level halaman pada Breakpoint_Mobile dengan lebar minimum 320px

---

### Requirement 14: Expert Research Responsif

**User Story:** Sebagai dokter (expert), saya ingin dapat menggunakan fitur riset AI dan manajemen logika dengan nyaman di smartphone, sehingga saya dapat mengelola pengetahuan medis dari perangkat apapun.

#### Acceptance Criteria

1. WHILE layar berada pada Breakpoint_Mobile, THE ExpertResearch SHALL menampilkan heading utama dengan ukuran `text-xl` yang meningkat ke `text-2xl` di Breakpoint_Tablet dan `text-3xl` di Breakpoint_Desktop
2. WHILE layar berada pada Breakpoint_Mobile, THE ExpertResearch SHALL menampilkan tab buttons (Autonomous Research / Logic Management) dengan lebar penuh atau menggunakan scroll horizontal agar tidak overflow pada layar kecil
3. WHILE layar berada pada Breakpoint_Mobile, THE ExpertResearch SHALL menampilkan tombol "Mulai Riset Otomatis" dengan lebar penuh (`w-full`) agar mudah diketuk
4. WHILE layar berada pada Breakpoint_Mobile, THE ExpertResearch SHALL menampilkan kartu hasil temuan (draft cards) dalam satu kolom penuh, dengan tombol Tolak dan Setujui yang memiliki Touch_Target minimum 44px
5. THE ExpertResearch SHALL tidak menghasilkan horizontal scroll pada Breakpoint_Mobile dengan lebar minimum 320px

---

### Requirement 15: Konsistensi Visual Expert dan Pasien

**User Story:** Sebagai pengguna sistem (baik pasien maupun dokter), saya ingin tampilan antarmuka yang konsisten antara halaman pasien dan dokter, sehingga pengalaman penggunaan terasa terpadu dan profesional di semua perangkat.

#### Acceptance Criteria

1. THE DashboardExpert SHALL menggunakan pola responsive heading yang sama dengan DashboardUser: `text-2xl md:text-4xl lg:text-5xl`
2. THE DashboardExpert SHALL menggunakan pola mobile horizontal scroll strip untuk metrics yang sama dengan DashboardUser, dengan kartu compact berukuran tetap (`w-[140px]` atau serupa)
3. THE AppShell SHALL menerapkan TopNav (bukan Sidebar desktop) untuk semua role pengguna (patient dan expert) secara konsisten
4. THE BottomNav SHALL menampilkan item navigasi yang sesuai dengan role expert ketika pengguna login sebagai dokter
5. WHILE layar berada pada Breakpoint_Mobile, THE DashboardExpert SHALL menampilkan konten dalam urutan prioritas: hero section → metrics strip → tabel riwayat → widget jadwal → widget pesan
6. THE App SHALL memastikan padding bawah `pb-24` diterapkan secara konsisten pada semua halaman expert di Breakpoint_Mobile untuk menghindari overlap dengan BottomNav
