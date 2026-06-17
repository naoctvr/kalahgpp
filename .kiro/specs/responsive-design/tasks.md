# Implementation Plan: Responsive Design

## Overview

Implementasi mobile-first responsive design untuk Respira.ID secara incremental. Dimulai dari fondasi (hook + CSS utilities), lalu komponen navigasi baru (BottomNav), kemudian modifikasi layout utama (AppShell, Sidebar, Header), diikuti halaman-halaman utama (Dashboard, Chat, Diagnosis, AuthPage), dan terakhir modal sebagai bottom sheet di mobile.

## Tasks

- [x] 1. Buat fondasi: custom hook dan CSS utilities
  - [x] 1.1 Buat `src/hooks/useIsMobile.js` dengan SSR-safe window check
    - Implementasi hook yang mengembalikan `boolean` berdasarkan `window.innerWidth < 768`
    - Tambahkan event listener `resize` dengan cleanup
    - Gunakan `typeof window !== 'undefined'` sebagai guard untuk SSR safety
    - _Requirements: 6.1, 6.2_
  - [x] 1.2 Tambahkan safe-area utilities dan backdrop-filter fallback ke `src/index.css`
    - Tambahkan `@layer utilities` dengan `.pb-safe` dan `.pt-safe` menggunakan `env(safe-area-inset-*)`
    - Tambahkan `@supports not (backdrop-filter: blur(1px))` fallback untuk Firefox
    - _Requirements: 1.8, 8.8_

- [x] 2. Buat komponen `BottomNav`
  - [x] 2.1 Buat `src/components/layout/BottomNav.jsx`
    - Buat komponen dengan `fixed bottom-0 left-0 right-0 z-30 md:hidden`
    - Tinggi minimum `min-h-[56px]`, padding bawah `pb-safe`
    - Filter nav items berdasarkan `user.role` (patient: 5 item, expert: 5 item) — maksimal 5 item
    - Setiap item navigasi: `min-w-[44px] min-h-[44px]`, tampilkan ikon + label teks
    - Highlight item aktif berdasarkan `useLocation()`
    - _Requirements: 1.1, 1.5, 1.6, 1.8_
  - [ ]* 2.2 Tulis property test untuk BottomNav — maksimal 5 item
    - **Property 1: BottomNav tidak melebihi 5 item**
    - **Validates: Requirements 1.5**
    - Gunakan `fast-check` dengan `fc.array(navItemArbitrary, { minLength: 0, maxLength: 20 })`
    - Verifikasi `getAllByRole('link').length <= 5`
  - [ ]* 2.3 Tulis property test untuk touch target BottomNav
    - **Property 2: Touch target minimum pada BottomNav**
    - **Validates: Requirements 1.6**
    - Render BottomNav dan periksa setiap elemen yang dapat diketuk memiliki `offsetWidth >= 44` dan `offsetHeight >= 44`

- [x] 3. Modifikasi `AppShell.jsx` untuk navigasi mobile
  - [x] 3.1 Tambahkan state `isMobileSidebarOpen` dan integrasikan BottomNav
    - Import `BottomNav` dan tambahkan ke render di bawah `<main>`
    - Tambahkan `useState(false)` untuk `isMobileSidebarOpen`
    - Teruskan `onMenuToggle` ke `Header` dan `isOpen`/`onClose` ke `Sidebar`/`SidebarExpert`
    - Tambahkan `useEffect` yang menutup sidebar saat `location.pathname` berubah
    - Tambahkan `pb-20 md:pb-0` pada `<main>` untuk menghindari overlap dengan BottomNav
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. Modifikasi `Header.jsx` untuk hamburger button fungsional
  - [x] 4.1 Tambahkan prop `onMenuToggle` dan hubungkan ke hamburger button
    - Tambahkan prop `onMenuToggle: () => void` ke komponen Header
    - Hubungkan `onClick={onMenuToggle}` ke button hamburger yang sudah ada (`md:hidden`)
    - Tambahkan `min-w-[44px] min-h-[44px]` dan `aria-label="Buka menu navigasi"` ke button
    - _Requirements: 1.3, 1.6_

- [x] 5. Modifikasi `Sidebar.jsx` (dan `SidebarExpert.jsx`) untuk mode overlay mobile
  - [x] 5.1 Tambahkan props `isOpen` dan `onClose` ke `Sidebar.jsx`
    - Tambahkan `AnimatePresence` dan `motion` dari Framer Motion
    - Render backdrop semi-transparan (`fixed inset-0 bg-slate-900/50 z-30 md:hidden`) saat `isOpen === true`
    - Render sidebar panel mobile (`fixed left-0 top-0 h-full w-[260px] z-40 md:hidden`) dengan animasi `x: -260 → 0`
    - Pertahankan sidebar desktop yang sudah ada (`hidden md:flex`) tanpa perubahan
    - Klik backdrop memanggil `onClose()`
    - _Requirements: 1.2, 1.3, 1.4_
  - [x] 5.2 Terapkan perubahan yang sama ke `SidebarExpert.jsx`
    - Duplikasi perubahan dari task 5.1 ke `SidebarExpert.jsx`
    - _Requirements: 1.2, 1.3, 1.4_

- [x] 6. Checkpoint — Navigasi mobile berfungsi
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

- [x] 7. Modifikasi `DashboardUser.jsx` untuk layout responsif
  - [x] 7.1 Perbaiki grid breakpoints pada semua section dashboard
    - Row 2 (Metrics): ubah `md:col-span-4` menjadi `col-span-12 md:col-span-6 lg:col-span-4` untuk ScoreCard, AQICard, ProfileMiniCard
    - Row 3 Left (Breathing): ubah `md:col-span-4` menjadi `col-span-12 md:col-span-12 lg:col-span-4`
    - Row 3 Right (History): ubah `md:col-span-8` menjadi `col-span-12 lg:col-span-8`
    - Telemedicine row: hapus `h-[280px]` fixed height, ganti dengan `h-auto`
    - Hero heading: ubah `text-4xl md:text-5xl` menjadi `text-3xl md:text-4xl lg:text-5xl`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 7.4_

- [x] 8. Modifikasi `AuthPage.jsx` untuk layout responsif
  - [x] 8.1 Sembunyikan panel kiri di mobile dan perbaiki ukuran input
    - Tambahkan `hidden` ke panel kiri: `hidden md:flex w-full md:w-1/2 ...`
    - Panel kanan sudah `w-full md:w-1/2` — verifikasi tidak ada perubahan yang diperlukan
    - Tambahkan `min-h-[44px]` ke semua `<input>` fields (email, password, name, licenseCode)
    - Perbaiki padding panel kanan: `p-6 md:p-8 lg:p-12`
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  - [ ]* 8.2 Tulis property test untuk touch target form elements di AuthPage
    - **Property 4: Touch target minimum pada form elements**
    - **Validates: Requirements 3.3**
    - Render AuthPage dan periksa semua `input` memiliki computed height >= 44px

- [x] 9. Modifikasi `Chat.jsx` untuk layout mobile dua panel
  - [x] 9.1 Tambahkan state `mobileView` dan logika toggle panel
    - Tambahkan `const [mobileView, setMobileView] = useState('contacts')`
    - Buat fungsi `handleContactSelect(contact)` yang memanggil `setActiveChat` dan `setMobileView('messages')`
    - Buat fungsi `handleBackToContacts()` yang memanggil `setMobileView('contacts')`
    - Hubungkan `handleContactSelect` ke `onClick` di daftar kontak
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 9.2 Terapkan conditional visibility dan perbaiki ukuran elemen
    - Contact list: tambahkan class kondisional — tampil jika `mobileView === 'contacts'` di mobile, selalu tampil di `md:`
    - Message area: tambahkan class kondisional — tampil jika `mobileView === 'messages'` di mobile, selalu tampil di `md:`
    - Tambahkan tombol kembali di chat header (hanya mobile `md:hidden`) yang memanggil `handleBackToContacts`
    - Ubah max-width gelembung pesan: `max-w-[85%] md:max-w-[70%] lg:max-w-[60%]`
    - Tambahkan `min-h-[44px]` pada input pesan dan `min-w-[44px] min-h-[44px]` pada tombol kirim
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7_
  - [ ]* 9.3 Tulis property test untuk lebar gelembung pesan
    - **Property 6: Gelembung pesan tidak melebihi 85% lebar layar**
    - **Validates: Requirements 5.6**
    - Gunakan `fc.string({ minLength: 1, maxLength: 1000 })` sebagai arbitrary message content
    - Set `window.innerWidth = 375` dan verifikasi `bubble.offsetWidth <= 375 * 0.85`
  - [ ]* 9.4 Tulis property test untuk touch target Chat input
    - **Property 7: Touch target minimum pada Chat input**
    - **Validates: Requirements 5.7**
    - Verifikasi input area `offsetHeight >= 44` dan tombol kirim `offsetWidth >= 44` dan `offsetHeight >= 44`

- [x] 10. Modifikasi `Diagnosis.jsx` untuk layout responsif
  - [x] 10.1 Perbaiki tombol pilihan jawaban dan gambar visual aid
    - Tambahkan `min-h-[48px]` ke setiap tombol pilihan jawaban (`.map(opt => <button ...>`)
    - Ubah padding tombol: `p-4 md:p-5`
    - Ubah container gambar visual aid dari `h-64` menjadi `aspect-video` dengan `<img className="w-full h-full object-cover" />`
    - Verifikasi grid sudah menggunakan `lg:col-span-8` dan `lg:col-span-4` (sudah benar, tidak perlu diubah)
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  - [ ]* 10.2 Tulis property test untuk touch target tombol pilihan Diagnosis
    - **Property 5: Tombol pilihan jawaban Diagnosis memenuhi touch target**
    - **Validates: Requirements 4.3**
    - Render daftar pilihan jawaban dan verifikasi setiap tombol `offsetHeight >= 48` dan `offsetWidth === containerWidth`

- [x] 11. Modifikasi `BookingModal.jsx` sebagai bottom sheet di mobile
  - [x] 11.1 Implementasi mode bottom sheet menggunakan `useIsMobile` hook
    - Import `useIsMobile` dari `src/hooks/useIsMobile.js`
    - Jika `isMobile`: render sebagai `fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[90vh]`
    - Tambahkan animasi Framer Motion: `initial={{ y: '100%' }}`, `animate={{ y: 0 }}`, `exit={{ y: '100%' }}`
    - Tambahkan drag handle (bar abu-abu di atas) dan `drag="y"` dengan `onDragEnd` untuk swipe-to-close (offset > 100px)
    - Tambahkan `min-h-[44px]` ke semua `select`, `input`, `textarea` dalam form
    - Jika bukan mobile: pertahankan dialog terpusat yang sudah ada
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.7_
  - [ ]* 11.2 Tulis property test untuk scrollability modal
    - **Property 8: Modal dapat di-scroll ketika konten panjang**
    - **Validates: Requirements 6.3**
    - Render modal dengan konten yang melebihi tinggi tersedia dan verifikasi area konten memiliki `overflow-y: auto` atau `overflow-y: scroll`
  - [ ]* 11.3 Tulis property test untuk aksesibilitas tombol tutup modal
    - **Property 9: Tombol tutup Modal selalu accessible**
    - **Validates: Requirements 6.4**
    - Render modal dalam keadaan terbuka dan verifikasi tombol X tidak ter-clip dan memiliki touch target >= 44×44px

- [x] 12. Modifikasi `DailyTestModal.jsx` sebagai bottom sheet di mobile
  - [x] 12.1 Terapkan mode bottom sheet yang sama seperti BookingModal
    - Import `useIsMobile` dan terapkan logika bottom sheet yang sama
    - Tambahkan drag handle dan swipe-to-close
    - Tambahkan `min-h-[44px]` ke tombol-tombol dalam modal
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.7_

- [x] 13. Checkpoint — Semua komponen utama responsif
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

- [x] 14. Perbaiki halaman-halaman lain untuk responsivitas dasar
  - [x] 14.1 Audit dan perbaiki `src/pages/Riwayat.jsx` untuk single column di mobile
    - Pastikan daftar riwayat menggunakan `grid-cols-1` di mobile
    - Pastikan kartu memiliki `w-full`
    - _Requirements: 10.1_
  - [x] 14.2 Audit dan perbaiki `src/pages/Profile.jsx` untuk single column di mobile
    - Pastikan form profil menggunakan layout satu kolom di mobile
    - Pastikan semua input field memiliki `w-full` dan `min-h-[44px]`
    - _Requirements: 10.2_
  - [x] 14.3 Audit dan perbaiki `src/pages/Konsultasi.jsx` untuk single column di mobile
    - Pastikan daftar jadwal konsultasi tidak menghasilkan horizontal scroll
    - _Requirements: 10.3_
  - [x] 14.4 Audit dan perbaiki `src/pages/News.jsx` untuk single column di mobile
    - Pastikan daftar berita menggunakan `grid-cols-1` di mobile dengan gambar thumbnail proporsional
    - _Requirements: 10.4_

- [x] 15. Verifikasi tidak ada horizontal scroll di semua halaman
  - [x] 15.1 Audit semua halaman untuk overflow horizontal
    - Periksa semua halaman tidak menggunakan fixed width yang melebihi viewport 320px
    - Pastikan tidak ada elemen dengan `min-w` yang melebihi viewport
    - Tambahkan `overflow-x: hidden` pada `<body>` atau root container jika diperlukan sebagai safety net
    - _Requirements: 2.4, 3.5, 10.5_
  - [ ]* 15.2 Tulis property test untuk tidak ada horizontal scroll
    - **Property 3: Tidak ada horizontal scroll pada halaman manapun**
    - **Validates: Requirements 2.4, 3.5, 10.5**
    - Set viewport 320px dan verifikasi `container.scrollWidth <= container.clientWidth` untuk setiap halaman

- [x] 16. Verifikasi tipografi responsif
  - [x] 16.1 Audit ukuran font minimum di seluruh aplikasi
    - Pastikan tidak ada class Tailwind yang menghasilkan font-size < 12px (hindari `text-[10px]` atau lebih kecil pada teks konten penting)
    - Verifikasi `line-height` paragraf menggunakan `leading-relaxed` (1.625) atau minimal `leading-normal` (1.5)
    - _Requirements: 7.1, 7.3_
  - [ ]* 16.2 Tulis property test untuk ukuran font minimum
    - **Property 10: Ukuran font minimum 12px**
    - **Validates: Requirements 7.1**
    - Render komponen dengan arbitrary text content dan verifikasi semua elemen teks memiliki computed `font-size >= 12px`

- [x] 17. Final checkpoint — Semua tests pass
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

- [x] 18. Modifikasi `DashboardExpert.jsx` untuk layout responsif
  - [x] 18.1 Perbaiki hero section dan heading responsif
    - Ubah `min-h-[350px]` menjadi `min-h-[200px] md:min-h-[350px]`
    - Ubah padding hero: `p-10` menjadi `p-6 md:p-10`
    - Ubah heading: `text-4xl md:text-5xl` menjadi `text-2xl md:text-4xl lg:text-5xl`
    - Tambahkan versi compact deskripsi untuk mobile (`md:hidden`) dan sembunyikan versi panjang di mobile (`hidden md:block`)
    - _Requirements: 11.1, 11.7, 11.8, 15.1_
  - [x] 18.2 Tambahkan mobile metrics strip dan sembunyikan grid desktop di mobile
    - Tambahkan `hidden md:grid` pada grid metrics desktop (`grid-cols-1 md:grid-cols-3`)
    - Tambahkan section `md:hidden` dengan horizontal scroll strip berisi 4 compact cards: Pasien Kritis, Total Diagnosa, Permintaan Masuk, Jadwal Terdekat
    - Setiap compact card: `snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100`
    - _Requirements: 11.2, 11.3, 15.2_
  - [x] 18.3 Perbaiki fixed height widget dan tabel
    - Widget "Permintaan Masuk": ubah `h-[200px]` menjadi `h-auto md:h-[200px]`
    - Widget "Inbox" (NotificationCard wrapper): ubah `h-[250px]` menjadi `h-auto md:h-[250px]`
    - Verifikasi tabel riwayat diagnosa sudah terbungkus `overflow-x-auto` dengan benar
    - _Requirements: 11.4, 11.5_

- [x] 19. Modifikasi `ProfileExpert.jsx` untuk layout responsif
  - [x] 19.1 Perbaiki input fields dan tombol untuk touch target
    - Tambahkan `min-h-[44px]` ke semua `<input>` fields (Nama, Email, Gelar, Instansi, SIP)
    - Ubah padding container form: `p-6 md:p-8`
    - Ubah tombol submit: tambahkan `w-full md:w-auto min-h-[44px]`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 20. Modifikasi `ConsultationHistory.jsx` untuk layout responsif
  - [x] 20.1 Perbaiki search input dan header section untuk mobile
    - Ubah padding halaman: `p-6` menjadi `p-4 md:p-6`
    - Ubah search input: `w-64` menjadi `w-full md:w-64`
    - Ubah container search+filter: `flex items-center space-x-3` menjadi `flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 21. Modifikasi `ExpertResearch.jsx` untuk layout responsif
  - [x] 21.1 Perbaiki heading, tab buttons, dan tombol riset untuk mobile
    - Ubah heading: `text-3xl` menjadi `text-xl md:text-2xl lg:text-3xl`
    - Ubah deskripsi: `text-lg` menjadi `text-sm md:text-lg`
    - Ubah tab container: tambahkan `w-full md:w-auto overflow-x-auto` pada wrapper
    - Ubah tab buttons: tambahkan `flex-1 md:flex-none px-4 md:px-6`
    - Ubah tombol riset: tambahkan `w-full md:w-auto min-h-[44px]`
    - Tambahkan `px-4 md:px-0` pada container utama
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 22. Final checkpoint expert — Semua halaman dokter responsif
  - Verifikasi DashboardExpert, ProfileExpert, ConsultationHistory, ExpertResearch tampil konsisten dengan tampilan pasien
  - Verifikasi tidak ada horizontal scroll di semua halaman expert pada viewport 320px
  - Verifikasi `pb-24` konsisten di semua halaman expert di mobile

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoint memastikan validasi incremental sebelum melanjutkan ke fase berikutnya
- Property tests menggunakan `fast-check` — install dengan `npm install --save-dev fast-check`
- Unit tests menggunakan Vitest + React Testing Library yang sudah ada di project
- Pengujian manual tetap diperlukan untuk: Safari iOS `position: fixed`, keyboard virtual, Lighthouse score, dan cross-browser layout
