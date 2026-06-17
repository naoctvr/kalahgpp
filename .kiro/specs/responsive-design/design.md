# Design Document: Responsive Design

## Overview

Dokumen ini mendeskripsikan desain teknis untuk membuat Respira.ID responsif di semua ukuran layar (mobile, tablet, desktop) dan browser utama (Chrome, Safari, Firefox, Brave).

Saat ini aplikasi menggunakan Tailwind CSS dengan breakpoint `md:` yang belum konsisten — Sidebar hanya tersembunyi di mobile via `hidden md:flex`, namun tidak ada navigasi pengganti (BottomNav), modal belum dioptimasi untuk mobile, dan banyak layout menggunakan fixed height yang tidak fleksibel di layar kecil.

Pendekatan yang diambil adalah **mobile-first progressive enhancement**: mulai dari layout satu kolom di mobile, kemudian diperluas ke dua kolom di tablet, dan layout penuh di desktop. Perubahan dilakukan secara incremental pada komponen yang sudah ada tanpa mengganti arsitektur.

### Ringkasan Perubahan Utama

| Komponen | Perubahan |
|---|---|
| `AppShell.jsx` | Tambah state `isMobileSidebarOpen`, render `BottomNav`, kirim toggle ke `Header` |
| `Sidebar.jsx` | Tambah mode overlay untuk mobile dengan animasi slide |
| `Header.jsx` | Hamburger button fungsional, kirim callback ke AppShell |
| `BottomNav.jsx` | Komponen baru untuk navigasi mobile |
| `DashboardUser.jsx` | Perbaiki grid breakpoints, hapus fixed height di mobile |
| `Chat.jsx` | Tambah state `mobileView` untuk toggle panel |
| `BookingModal.jsx` / `DailyTestModal.jsx` | Tambah mode bottom sheet di mobile |
| `AuthPage.jsx` | Sembunyikan panel kiri di mobile |
| `Diagnosis.jsx` | Perbaiki grid dan ukuran tombol di mobile |
| `index.css` | Tambah safe-area utilities, backdrop-filter fallback |
| `DashboardExpert.jsx` | Responsive heading, mobile metrics strip, hapus fixed height, tabel overflow-x-auto |
| `ProfileExpert.jsx` | min-h-[44px] pada semua input, grid satu kolom di mobile, tombol w-full |
| `ConsultationHistory.jsx` | Search input w-full di mobile, header satu kolom di mobile |
| `ExpertResearch.jsx` | Heading responsif, tab buttons tidak overflow, tombol riset w-full |

---

## Architecture

### Breakpoint Strategy

Menggunakan breakpoint Tailwind CSS bawaan yang sudah ada di project:

```
Mobile:  < 768px   (default, no prefix)
Tablet:  768px–1023px  (md: prefix)
Desktop: ≥ 1024px  (lg: prefix)
```

Tailwind sudah dikonfigurasi dengan breakpoint default ini. Tidak perlu mengubah `tailwind.config.js`.

### Layout Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AppShell                             │
│  ┌──────────┐  ┌──────────────────────────────────────┐ │
│  │          │  │  Header (sticky top-0)               │ │
│  │ Sidebar  │  ├──────────────────────────────────────┤ │
│  │ (260px)  │  │                                      │ │
│  │ Desktop/ │  │  <main> (overflow-y-auto)            │ │
│  │ Tablet   │  │  Page Content                        │ │
│  │          │  │                                      │ │
│  │ Overlay  │  │                                      │ │
│  │ Mobile   │  │                                      │ │
│  └──────────┘  └──────────────────────────────────────┘ │
│                ┌──────────────────────────────────────┐  │
│                │  BottomNav (fixed bottom, mobile only)│  │
│                └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### State Management untuk Navigasi Mobile

State `isMobileSidebarOpen` dikelola di `AppShell` dan diteruskan ke `Header` (untuk hamburger button) dan `Sidebar` (untuk mode overlay). Ini menghindari prop drilling yang dalam karena hanya dua level.

```
AppShell
  ├── isMobileSidebarOpen (state)
  ├── Sidebar (props: isOpen, onClose)
  ├── Header (props: onMenuToggle)
  └── BottomNav (no props needed, reads from useLocation)
```

### Chat Mobile State

`Chat.jsx` mengelola state `mobileView: 'contacts' | 'messages'` secara internal. Tidak perlu state global karena hanya relevan di halaman Chat.

---

## Components and Interfaces

### 1. BottomNav (Komponen Baru)

**Path:** `src/components/layout/BottomNav.jsx`

Komponen navigasi bawah layar yang hanya tampil di mobile. Menampilkan maksimal 5 item navigasi utama.

```jsx
// Props: tidak ada (membaca dari useAuth dan useLocation)
const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  // navItems filtered by role, max 5 items
  // ...
}
```

**Spesifikasi:**
- Tinggi: `min-h-[56px]`
- Padding bawah: `pb-[env(safe-area-inset-bottom)]`
- Posisi: `fixed bottom-0 left-0 right-0 z-30`
- Hanya tampil: `md:hidden`
- Setiap item: `min-w-[44px] min-h-[44px]`
- Maksimal 5 item navigasi

**Item navigasi untuk patient:**
1. Dashboard (`/`)
2. Diagnosa (`/diagnosa`)
3. Chat (`/chat`)
4. Konsultasi (`/konsultasi`)
5. Profil (`/profile`)

**Item navigasi untuk expert:**
1. Dashboard (`/`)
2. Chat (`/chat`)
3. Konsultasi (`/konsultasi`)
4. Riwayat (`/expert/history`)
5. Profil (`/expert/profile`)

### 2. AppShell (Modifikasi)

**Path:** `src/components/layout/AppShell.jsx`

Tambahan:
- State `isMobileSidebarOpen`
- Render `BottomNav` di bawah `<main>`
- Padding bawah konten di mobile untuk menghindari overlap dengan BottomNav: `pb-20 md:pb-0`
- Kirim `onMenuToggle` ke `Header`
- Kirim `isOpen` dan `onClose` ke `Sidebar`

```jsx
const AppShell = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // ...
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-[260px] transition-all duration-300">
        <Header onMenuToggle={() => setIsMobileSidebarOpen(true)} />
        <main className={...}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};
```

### 3. Sidebar (Modifikasi)

**Path:** `src/components/layout/Sidebar.jsx`

Tambahan props: `isOpen: boolean`, `onClose: () => void`

**Perilaku:**
- Desktop/Tablet (`md:`): tampil normal sebagai sidebar tetap, `hidden md:flex`
- Mobile: tampil sebagai overlay ketika `isOpen === true`
  - Backdrop semi-transparan di belakang sidebar
  - Animasi slide dari kiri menggunakan Framer Motion
  - Klik backdrop memanggil `onClose()`

```jsx
// Mobile overlay structure
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      {/* Sidebar panel */}
      <motion.aside
        className="fixed left-0 top-0 h-full w-[260px] bg-white z-40 md:hidden ..."
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        exit={{ x: -260 }}
        transition={{ type: 'tween', duration: 0.25 }}
      >
        {/* sidebar content */}
      </motion.aside>
    </>
  )}
</AnimatePresence>
{/* Desktop sidebar (always visible) */}
<aside className="w-[260px] ... hidden md:flex ...">
  {/* sidebar content */}
</aside>
```

### 4. Header (Modifikasi)

**Path:** `src/components/layout/Header.jsx`

Tambahan props: `onMenuToggle: () => void`

Hamburger button yang sudah ada (`<button className="md:hidden mr-4 ...">`) dihubungkan ke `onMenuToggle`:

```jsx
<button
  className="md:hidden mr-4 text-slate-500 p-2 hover:bg-slate-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
  onClick={onMenuToggle}
  aria-label="Buka menu navigasi"
>
  <Menu className="w-6 h-6" />
</button>
```

### 5. DashboardUser (Modifikasi)

**Path:** `src/pages/DashboardUser.jsx`

Perubahan grid breakpoints:

| Section | Sebelum | Sesudah |
|---|---|---|
| Hero | `col-span-12` | `col-span-12` (tidak berubah) |
| Metrics row | `md:col-span-4` | `col-span-12 md:col-span-6 lg:col-span-4` |
| Breathing widget | `md:col-span-4` | `col-span-12 md:col-span-12 lg:col-span-4` |
| History section | `md:col-span-8` | `col-span-12 lg:col-span-8` |
| Telemedicine cards | `grid-cols-1 md:grid-cols-2 h-[280px]` | `grid-cols-1 md:grid-cols-2` (hapus fixed height) |
| Hero heading | `text-4xl md:text-5xl` | `text-3xl md:text-4xl lg:text-5xl` |

### 6. Chat (Modifikasi)

**Path:** `src/pages/Chat.jsx`

Tambahan state `mobileView`:

```jsx
const [mobileView, setMobileView] = useState('contacts'); // 'contacts' | 'messages'

// Saat memilih kontak di mobile:
const handleContactSelect = (contact) => {
  setActiveChat(contact);
  setMobileView('messages');
};

// Tombol kembali di area pesan:
const handleBackToContacts = () => {
  setMobileView('contacts');
};
```

**Layout mobile:**
- Contact list: `block md:flex` — tampil ketika `mobileView === 'contacts'`
- Message area: `hidden md:flex` — tampil ketika `mobileView === 'messages'`
- Tombol kembali di chat header (hanya mobile): `md:hidden`

**Gelembung pesan:** Ubah `max-w-[70%] md:max-w-[60%]` menjadi `max-w-[85%] md:max-w-[70%] lg:max-w-[60%]`

**Input area:** Pastikan `min-h-[44px]` pada input, tombol kirim `min-w-[44px] min-h-[44px]`

### 7. Modal (Modifikasi)

**Path:** `src/components/modals/BookingModal.jsx`, `DailyTestModal.jsx`

Tambahan hook `useIsMobile`:

```jsx
// src/hooks/useIsMobile.js
import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};
```

**Mobile (bottom sheet):**
```jsx
// Mobile: bottom sheet
<motion.div
  className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[90vh] flex flex-col"
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  drag="y"
  dragConstraints={{ top: 0 }}
  onDragEnd={(_, info) => {
    if (info.offset.y > 100) onClose();
  }}
>
  {/* Drag handle */}
  <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-2 shrink-0" />
  {/* Content */}
  <div className="overflow-y-auto flex-1 p-6">
    {/* modal content */}
  </div>
</motion.div>
```

**Desktop (centered dialog):** Tidak berubah dari implementasi saat ini.

Semua form elements (input, select, textarea) ditambahkan `min-h-[44px]`.

### 8. AuthPage (Modifikasi)

**Path:** `src/pages/AuthPage.jsx`

Panel kiri disembunyikan di mobile:
```jsx
{/* Left Side - Visual */}
<div className="hidden md:flex w-full md:w-1/2 bg-slate-900 ...">
```

Panel kanan menjadi full width di mobile:
```jsx
{/* Right Side - Form */}
<div className="w-full md:w-1/2 p-6 md:p-8 lg:p-12 ...">
```

Input fields ditambahkan `min-h-[44px]`:
```jsx
<input className="w-full pl-10 pr-4 py-3 min-h-[44px] border ...">
```

### 9. Diagnosis (Modifikasi)

**Path:** `src/pages/Diagnosis.jsx`

Grid layout:
```jsx
// Sebelum:
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
  <div className="lg:col-span-8">...</div>
  <div className="lg:col-span-4">...</div>
</div>

// Sesudah: tidak berubah (sudah menggunakan lg: prefix yang benar)
// Hanya perlu memastikan urutan DOM: main content dulu, sidebar kedua
```

Tombol pilihan jawaban:
```jsx
// Sebelum:
<button className="w-full text-left p-5 rounded-xl ...">

// Sesudah:
<button className="w-full text-left p-4 md:p-5 min-h-[48px] rounded-xl ...">
```

Gambar visual aid:
```jsx
// Sebelum:
<div className="h-64 bg-slate-900 ...">

// Sesudah:
<div className="aspect-video bg-slate-900 ...">
  <img className="w-full h-full object-cover" />
</div>
```

### 10. DashboardExpert (Modifikasi)

**Path:** `src/pages/DashboardExpert.jsx`

Perubahan untuk menyamakan dengan DashboardUser:

| Section | Sebelum | Sesudah |
|---|---|---|
| Hero heading | `text-4xl md:text-5xl` | `text-2xl md:text-4xl lg:text-5xl` |
| Hero min-height | `min-h-[350px]` | `min-h-[200px] md:min-h-[350px]` |
| Hero padding | `p-10` | `p-6 md:p-10` |
| Hero description | selalu tampil | `hidden md:block` untuk versi panjang, tambah versi compact mobile |
| Metrics grid | `grid-cols-1 md:grid-cols-3` | `hidden md:grid md:grid-cols-3` (desktop) + mobile strip |
| Mobile metrics | tidak ada | horizontal scroll strip dengan compact cards (sama seperti DashboardUser) |
| Widget fixed height | `h-[200px]`, `h-[250px]` | `h-auto` di mobile |
| Tabel riwayat | `overflow-x-auto` sudah ada | verifikasi wrapper benar |
| Bottom padding | `pb-24` sudah ada | verifikasi konsisten |

**Mobile metrics strip** (sama persis dengan DashboardUser):
```jsx
{/* MOBILE: Horizontal scroll metrics strip */}
<div className="md:hidden -mx-4 px-4">
  <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
       style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
    {/* Pasien Kritis compact */}
    <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <p className="text-xs text-slate-400 mb-1">Pasien Kritis</p>
      <p className="text-3xl font-bold text-red-600">{stats.emergency_count || 0}</p>
      <p className="text-xs text-red-500 font-medium mt-1">Butuh penanganan</p>
    </div>
    {/* Total Diagnosa compact */}
    <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <p className="text-xs text-slate-400 mb-1">Total Diagnosa</p>
      <p className="text-3xl font-bold text-slate-800">{stats.total_diagnoses}</p>
      <p className="text-xs text-emerald-600 font-medium mt-1">+8% minggu ini</p>
    </div>
    {/* Permintaan Masuk compact */}
    <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <p className="text-xs text-slate-400 mb-1">Permintaan</p>
      <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
      <p className="text-xs text-amber-600 font-medium mt-1">Menunggu respons</p>
    </div>
    {/* Jadwal Terdekat compact */}
    <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <p className="text-xs text-slate-400 mb-1">Jadwal</p>
      {nextAppointment ? (
        <>
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {new Date(nextAppointment.requested_date.replace(' ', 'T')).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{nextAppointment.patient_name}</p>
        </>
      ) : (
        <p className="text-xs text-slate-400 mt-1">Tidak ada jadwal</p>
      )}
    </div>
  </div>
</div>
```

### 11. ProfileExpert (Modifikasi)

**Path:** `src/pages/ProfileExpert.jsx`

Perubahan:
- Tambahkan `min-h-[44px]` ke semua `<input>` fields (Nama, Email, Gelar, Instansi, SIP)
- Ubah padding container: `p-6 md:p-8`
- Tombol submit: tambahkan `w-full md:w-auto min-h-[44px]` dan ubah `justify-end` menjadi `justify-end`

```jsx
// Input fields — tambahkan min-h-[44px]
<input className="w-full pl-10 pr-4 py-2 min-h-[44px] bg-slate-50 border ..." />

// Tombol submit — tambahkan w-full md:w-auto min-h-[44px]
<button className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 min-h-[44px] rounded-lg ...">
```

### 12. ConsultationHistory (Modifikasi)

**Path:** `src/pages/ConsultationHistory.jsx`

Perubahan:
- Search input: ubah `w-64` menjadi `w-full md:w-64`
- Search + filter container: ubah `flex items-center space-x-3` menjadi `flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto`
- Padding halaman: ubah `p-6` menjadi `p-4 md:p-6`

```jsx
// Sebelum:
<div className="flex items-center space-x-3">
  <input className="... w-64 ..." />

// Sesudah:
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
  <input className="... w-full md:w-64 ..." />
```

### 13. ExpertResearch (Modifikasi)

**Path:** `src/pages/ExpertResearch.jsx`

Perubahan:
- Heading: ubah `text-3xl` menjadi `text-xl md:text-2xl lg:text-3xl`
- Deskripsi: ubah `text-lg` menjadi `text-sm md:text-lg`
- Tab container: tambahkan `w-full overflow-x-auto` pada wrapper, tab buttons `flex-1 md:flex-none`
- Tombol riset: tambahkan `w-full md:w-auto` dan `min-h-[44px]`
- Padding halaman: tambahkan `px-4 md:px-0` pada container

```jsx
// Heading responsif
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">Expert Knowledge Center</h1>

// Tab buttons — tidak overflow di mobile
<div className="bg-slate-100 p-1 rounded-xl flex w-full md:w-auto overflow-x-auto">
  <button className="flex-1 md:flex-none px-4 md:px-6 py-2.5 ...">Autonomous Research</button>
  <button className="flex-1 md:flex-none px-4 md:px-6 py-2.5 ...">Logic Management</button>
</div>

// Tombol riset — w-full di mobile
<button className="w-full md:w-auto min-h-[44px] px-8 py-4 ...">
```

---

## Data Models

Tidak ada perubahan pada data model backend. Semua perubahan bersifat presentasi (UI/CSS).

### State Baru di Komponen

```typescript
// AppShell
interface AppShellState {
  isMobileSidebarOpen: boolean;
}

// Chat
type MobileView = 'contacts' | 'messages';
interface ChatState {
  mobileView: MobileView;
  // ... existing state
}

// Modal (BookingModal, DailyTestModal)
// Tidak ada state baru — menggunakan useIsMobile hook
```

### Custom Hook

```typescript
// src/hooks/useIsMobile.ts
// Returns: boolean — true jika viewport width < 768px
// Updates on window resize
const useIsMobile: () => boolean;
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: BottomNav tidak melebihi 5 item

*For any* konfigurasi pengguna (role patient atau expert) dan daftar nav items yang diberikan, komponen BottomNav SHALL merender paling banyak 5 item navigasi.

**Validates: Requirements 1.5**

### Property 2: Touch target minimum pada BottomNav

*For any* konfigurasi BottomNav yang dirender, setiap elemen yang dapat diketuk SHALL memiliki luas area sentuh minimal 44×44px (width ≥ 44px dan height ≥ 44px).

**Validates: Requirements 1.6**

### Property 3: Tidak ada horizontal scroll pada halaman manapun

*For any* halaman aplikasi dan konten yang dirender pada viewport dengan lebar 320px, `document.documentElement.scrollWidth` SHALL sama dengan `document.documentElement.clientWidth` (tidak ada overflow horizontal).

**Validates: Requirements 2.4, 3.5, 10.5**

### Property 4: Touch target minimum pada form elements

*For any* form element (input, select, textarea) yang dirender di dalam Modal atau AuthPage, computed height SHALL lebih besar atau sama dengan 44px.

**Validates: Requirements 3.3, 6.7**

### Property 5: Tombol pilihan jawaban Diagnosis memenuhi touch target

*For any* set pilihan jawaban yang dirender di halaman Diagnosis pada viewport mobile, setiap tombol pilihan SHALL memiliki height ≥ 48px dan width = 100% dari container-nya.

**Validates: Requirements 4.3**

### Property 6: Gelembung pesan tidak melebihi 85% lebar layar

*For any* pesan dengan konten teks apapun yang dirender di halaman Chat pada viewport mobile (< 768px), lebar gelembung pesan SHALL tidak melebihi 85% dari lebar viewport.

**Validates: Requirements 5.6**

### Property 7: Touch target minimum pada Chat input

*For any* konfigurasi Chat yang dirender, area input pesan SHALL memiliki height ≥ 44px dan tombol kirim SHALL memiliki width ≥ 44px dan height ≥ 44px.

**Validates: Requirements 5.7**

### Property 8: Modal dapat di-scroll ketika konten panjang

*For any* Modal yang dirender dengan konten yang melebihi tinggi yang tersedia, area konten modal SHALL memiliki `overflow-y: auto` atau `overflow-y: scroll` sehingga konten dapat di-scroll secara vertikal.

**Validates: Requirements 6.3**

### Property 9: Tombol tutup Modal selalu accessible

*For any* Modal yang dirender dalam keadaan terbuka, tombol tutup (X) SHALL selalu terlihat (tidak ter-clip atau tersembunyi) dan memiliki touch target ≥ 44×44px.

**Validates: Requirements 6.4**

### Property 10: Ukuran font minimum 12px

*For any* elemen teks yang dirender di aplikasi pada breakpoint manapun, computed `font-size` SHALL lebih besar atau sama dengan 12px.

**Validates: Requirements 7.1**

### Property 11: Heading tidak overflow viewport

*For any* elemen heading (h1–h6) yang dirender pada viewport mobile (< 768px), `offsetWidth` elemen tersebut SHALL tidak melebihi `window.innerWidth`.

**Validates: Requirements 7.2**

### Property 12: Kontras warna teks memenuhi WCAG AA

*For any* kombinasi warna teks dan latar belakang yang digunakan di aplikasi, rasio kontras SHALL lebih besar atau sama dengan 4.5:1 sesuai standar WCAG 2.1 AA.

**Validates: Requirements 7.5**

---

**Property Reflection:**

Setelah review, Properties 3 (no horizontal scroll) menggabungkan requirements 2.4, 3.5, dan 10.5 menjadi satu property universal — ini lebih efisien daripada tiga property terpisah. Properties 4 dan 5 tidak redundan karena 4 menguji form elements di Modal/AuthPage (min 44px) sementara 5 menguji tombol pilihan di Diagnosis (min 48px, berbeda threshold). Properties 2 dan 7 tidak redundan karena menguji komponen berbeda (BottomNav vs Chat input). Semua 12 properties memberikan nilai validasi yang unik.

---

## Error Handling

### Resize Event Handling

`useIsMobile` hook menggunakan debounce implisit melalui event listener `resize`. Tidak perlu debounce eksplisit karena Tailwind CSS menangani breakpoint melalui CSS media queries, bukan JavaScript.

Jika `window` tidak tersedia (SSR), hook mengembalikan `false` sebagai default:
```jsx
const [isMobile, setIsMobile] = useState(
  typeof window !== 'undefined' ? window.innerWidth < 768 : false
);
```

### Sidebar Overlay

Jika pengguna menavigasi ke halaman lain saat sidebar overlay terbuka, `AppShell` harus menutup sidebar. Ini ditangani dengan `useEffect` yang mendengarkan perubahan `location.pathname`:

```jsx
useEffect(() => {
  setIsMobileSidebarOpen(false);
}, [location.pathname]);
```

### Modal Swipe-to-Close

Gesture swipe-to-close menggunakan Framer Motion `drag` prop. Jika drag offset Y > 100px, modal ditutup. Ini mencegah penutupan tidak sengaja saat scroll konten modal.

### Backdrop-filter Fallback

Untuk browser yang tidak mendukung `backdrop-filter` (Firefox < 103):

```css
/* index.css */
@supports not (backdrop-filter: blur(1px)) {
  .backdrop-blur-md {
    background-color: rgba(255, 255, 255, 0.95) !important;
  }
  .bg-slate-900\/80 {
    background-color: rgba(15, 23, 42, 0.95) !important;
  }
}
```

### Safe Area Insets

Untuk perangkat dengan notch atau home indicator (iPhone X ke atas):

```css
/* index.css */
@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .pt-safe {
    padding-top: env(safe-area-inset-top);
  }
}
```

BottomNav menggunakan `pb-safe` untuk menghindari konten tertutup home indicator.

---

## Testing Strategy

### Pendekatan Dual Testing

Fitur responsive design menggunakan dua pendekatan testing yang saling melengkapi:

1. **Unit/Component Tests** — untuk perilaku spesifik dan interaksi UI
2. **Property-Based Tests** — untuk properti universal yang harus berlaku di semua input

### Library yang Digunakan

- **Unit Tests:** Vitest + React Testing Library
- **Property-Based Tests:** `fast-check` (library PBT untuk JavaScript/TypeScript)
  - Install: `npm install --save-dev fast-check`
  - Minimum 100 iterasi per property test

### Unit Tests (Contoh Spesifik)

```javascript
// AppShell: Sidebar tersembunyi di mobile, BottomNav tampil
test('mobile: sidebar hidden, BottomNav visible', () => {
  // Set viewport to 375px
  // Render AppShell
  // Assert: Sidebar tidak ada di DOM atau hidden
  // Assert: BottomNav ada di DOM
});

// Chat: Toggle panel di mobile
test('mobile: selecting contact shows message area', () => {
  // Render Chat on mobile viewport
  // Assert: contact list visible, message area hidden
  // Simulate contact click
  // Assert: message area visible, contact list hidden
});

// Modal: Bottom sheet di mobile
test('mobile: modal renders as bottom sheet', () => {
  // Render BookingModal on mobile viewport
  // Assert: modal has rounded-t-3xl class (bottom sheet style)
  // Assert: modal positioned at bottom
});

// AuthPage: Panel kiri tersembunyi di mobile
test('mobile: auth left panel hidden', () => {
  // Render AuthPage on mobile viewport
  // Assert: left visual panel has 'hidden' class
  // Assert: form panel has full width
});
```

### Property-Based Tests

Setiap property test harus:
- Menggunakan `fast-check` dengan minimum 100 iterasi
- Diberi tag komentar referensi ke property di design document
- Menguji satu property universal

```javascript
import fc from 'fast-check';

// Feature: responsive-design, Property 1: BottomNav tidak melebihi 5 item
test('BottomNav renders at most 5 items for any nav config', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        label: fc.string(),
        path: fc.string(),
        icon: fc.constant(SomeIcon),
      }), { minLength: 0, maxLength: 20 }),
      (navItems) => {
        const { getAllByRole } = render(<BottomNav navItems={navItems} />);
        const items = getAllByRole('link');
        return items.length <= 5;
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: responsive-design, Property 3: Tidak ada horizontal scroll
test('no horizontal scroll at 320px for any page content', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 0, maxLength: 500 }), // arbitrary content
      (content) => {
        // Set viewport to 320px
        Object.defineProperty(window, 'innerWidth', { value: 320 });
        const { container } = render(<TestPage content={content} />);
        return container.scrollWidth <= container.clientWidth;
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: responsive-design, Property 6: Gelembung pesan <= 85% lebar layar
test('message bubble width <= 85% of viewport on mobile', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 1000 }), // arbitrary message content
      (messageContent) => {
        Object.defineProperty(window, 'innerWidth', { value: 375 });
        const { getByTestId } = render(
          <MessageBubble content={messageContent} isMe={false} />
        );
        const bubble = getByTestId('message-bubble');
        return bubble.offsetWidth <= 375 * 0.85;
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: responsive-design, Property 10: Font size minimum 12px
test('all text elements have font-size >= 12px', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 200 }),
      (textContent) => {
        const { container } = render(<TextComponent>{textContent}</TextComponent>);
        const textElements = container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, label, button');
        return Array.from(textElements).every(el => {
          const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
          return fontSize >= 12;
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration / Manual Tests

Beberapa requirement tidak bisa diuji secara otomatis dan memerlukan pengujian manual:

| Test | Metode | Target |
|---|---|---|
| Safari iOS `position: fixed` | Manual di Safari iOS 15+ | Req 8.5 |
| Keyboard virtual tidak menutupi input | Manual di iOS/Android | Req 3.4, 5.5, 6.5 |
| Lighthouse Performance ≥ 70 | `npx lighthouse` | Req 9.1 |
| Cross-browser layout | BrowserStack / manual | Req 8.1–8.4 |
| Scroll 60fps di mobile | Chrome DevTools Performance | Req 9.6 |
| `prefers-reduced-motion` | Browser setting + manual | Req 9.4 |

### Test Coverage Target

- Unit tests: semua komponen yang dimodifikasi (AppShell, Sidebar, Header, BottomNav, Chat, Modal, AuthPage, Diagnosis)
- Property tests: 12 properties dari design document
- Manual tests: semua requirement yang bergantung pada hardware/browser nyata
