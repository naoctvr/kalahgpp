# 🫁 RESPIRA.ID — Sistem Pakar Kesehatan Pernapasan Berbasis AI

<div align="center">

![RESPIRA.ID](https://img.shields.io/badge/RESPIRA.ID-Expert%20System-teal?style=for-the-badge&logo=heart&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Railway-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

**Platform telemedicine cerdas untuk deteksi dini penyakit pernapasan dengan teknologi AI**

[🌐 Live Demo](https://respiraa-id.netlify.app) • [📖 Dokumentasi](#dokumentasi) • [🚀 Instalasi](#instalasi)

</div>

---

## 📋 Deskripsi

**RESPIRA.ID** adalah sistem pakar berbasis kecerdasan buatan yang dirancang untuk membantu masyarakat Indonesia mendeteksi dini penyakit pernapasan seperti Asma, TBC, ISPA, dan Pneumonia. Platform ini menggabungkan diagnosis AI, konsultasi telemedicine dengan dokter spesialis paru, serta monitoring kesehatan real-time.

### 🎯 Permasalahan yang Diselesaikan

- Tingginya angka penyakit pernapasan di Indonesia (ISPA masuk 10 besar penyebab kematian)
- Keterbatasan akses masyarakat ke dokter spesialis paru
- Kurangnya kesadaran deteksi dini penyakit pernapasan
- Minimnya sistem monitoring kualitas udara terintegrasi dengan kesehatan personal

---

## ✨ Fitur Unggulan

### 🤖 Diagnosis AI (Sistem Pakar)
- Pohon keputusan berbasis gejala klinis
- Tingkat akurasi 98% berdasarkan dataset diagnosis
- Mendukung deteksi 15+ penyakit pernapasan
- Penjelasan klinis dan rekomendasi tindakan

### 👨‍⚕️ Telemedicine
- Chat real-time dengan dokter spesialis paru
- Booking konsultasi tatap muka
- Sistem antrian prioritas untuk pasien Pro
- Video konsultasi berbasis jadwal

### 📊 Dashboard Kesehatan
- Skor kesehatan paru harian
- Monitoring kualitas udara (AQI) real-time berbasis lokasi
- Riwayat diagnosis tersimpan
- Analisis tren kesehatan bertenaga AI

### 🔔 Notifikasi Telegram
- Pengingat minum obat otomatis
- Alert kualitas udara buruk
- Laporan harian kesehatan
- Notifikasi jadwal konsultasi

### 👨‍💼 Panel Manajemen (CRM)
- Dashboard admin dengan statistik real-time
- Manajemen pengguna dan dokter
- Knowledge base sistem pakar yang dapat diperbarui oleh dokter
- Review dan approval riset medis berbasis AI

---

## 🛠️ Teknologi

### Frontend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| React | 19 | UI Framework |
| Vite | 7 | Build Tool |
| Tailwind CSS | 3 | Styling |
| Framer Motion | 11 | Animasi |
| React Router | 6 | Routing |
| Recharts | 3 | Visualisasi Data |
| Lucide React | 0.469 | Ikon |

### Backend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Node.js | 20 | Runtime |
| Express | 4 | Web Framework |
| PostgreSQL | 17 | Database |
| JWT | 9 | Autentikasi |
| Google Gemini AI | 2.5 Flash | AI Diagnosis & Research |
| Telegram Bot API | - | Notifikasi |
| node-cron | 4 | Scheduler |

### Infrastructure
| Platform | Kegunaan |
|----------|----------|
| Netlify | Frontend Hosting & CDN |
| Railway | Backend & Database Hosting |
| Supabase | Database Backup |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Browser/Mobile)             │
│              React + Vite + Tailwind CSS             │
│              Deployed: Netlify                       │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS REST API
┌──────────────────────▼──────────────────────────────┐
│                BACKEND (Node.js + Express)           │
│     Auth │ Diagnosis │ Chat │ Booking │ Telegram     │
│              Deployed: Railway                       │
└──────────────────────┬──────────────────────────────┘
                       │ TCP/IP (Internal Network)
┌──────────────────────▼──────────────────────────────┐
│              DATABASE (PostgreSQL)                   │
│   Users │ Diagnosis Logs │ Consultations │ Messages  │
│              Deployed: Railway PostgreSQL            │
└─────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              EXTERNAL SERVICES                       │
│  Google Gemini AI │ OpenWeatherMap │ Telegram Bot    │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Instalasi

### Prasyarat
- Node.js 20+
- PostgreSQL 14+
- npm atau yarn

### 1. Clone Repository
```bash
git clone https://github.com/cattlevya/kalahgpp.git
cd kalahgpp
```

### 2. Setup Frontend
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env
VITE_API_URL=http://localhost:5001/api

# Jalankan development server
npm run dev
```

### 3. Setup Backend
```bash
cd server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

Edit `server/.env`:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
GEMINI_API_KEY=your_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=your_jwt_secret_min_32_chars
PORT=5001
NODE_ENV=development
```

### 4. Setup Database
```bash
# Jalankan schema SQL
psql -U postgres -d your_database -f database_postgres.sql
```

### 5. Jalankan Backend
```bash
cd server
npm run dev
```

---

## 📁 Struktur Project

```
respira-id/
├── src/
│   ├── components/
│   │   ├── layout/          # AppShell, TopNav, BottomNav, Sidebar
│   │   ├── dashboard/       # Widget-widget dashboard
│   │   ├── modals/          # BookingModal, UpgradeModal, dll
│   │   └── ui/              # Komponen UI reusable
│   ├── pages/
│   │   ├── Dashboard.jsx    # Halaman utama
│   │   ├── Diagnosa.jsx     # Sistem pakar diagnosis
│   │   ├── Konsultasi.jsx   # Booking & manajemen konsultasi
│   │   ├── Chat.jsx         # Chat telemedicine
│   │   ├── Riwayat.jsx      # Riwayat diagnosis
│   │   ├── Pricing.jsx      # Halaman paket premium
│   │   └── Profile.jsx      # Profil & pengaturan
│   ├── context/             # AuthContext
│   └── services/            # API service layer
├── server/
│   ├── config/              # Konfigurasi database
│   ├── routes/              # Route handlers (Telegram, dll)
│   ├── services/            # Business logic services
│   ├── workers/             # Cron job scheduler
│   └── index.js             # Entry point Express
├── public/
│   └── audio/               # Auskultasi suara paru
├── database_postgres.sql    # Schema database
└── netlify.toml             # Konfigurasi deployment
```

---

## 👥 Peran Pengguna

| Peran | Akses | Deskripsi |
|-------|-------|-----------|
| **Patient** | Diagnosis, Chat, Booking | Pengguna umum yang ingin memantau kesehatan paru |
| **Expert** | Konsultasi, Knowledge Base | Dokter spesialis paru yang memberikan layanan |
| **Admin** | CRM Dashboard, User Management | Administrator sistem |

### Akun Demo
| Email | Password | Peran |
|-------|----------|-------|
| `user@gmail.com` | `user123` | Patient |
| `admin@respira.id` | `admin` | Expert/Doctor |

---

## 🔒 Keamanan

- Autentikasi berbasis JWT (30 hari expiry)
- Password tidak dienkripsi di demo (perlu bcrypt untuk production)
- CORS dikonfigurasi hanya untuk domain yang diizinkan
- Rate limiting pada endpoint kritis
- SSL/TLS pada semua koneksi production

---

## 📸 Screenshots

### Dashboard Utama
Monitoring skor kesehatan, kualitas udara, dan riwayat diagnosis terkini.

### Sistem Diagnosis AI
Pohon keputusan interaktif dengan 15+ penyakit pernapasan yang terdeteksi.

### Telemedicine Chat
Chat real-time dengan dokter spesialis dengan sistem booking jadwal.

### Panel Admin CRM
Dashboard analitik dengan visualisasi distribusi penyakit dan aktivitas pengguna.

---

## 🌐 Deployment

| Platform | URL | Keterangan |
|----------|-----|------------|
| Frontend | https://respiraa-id.netlify.app | Production |
| Backend | https://respira-backend-production.up.railway.app | API Server |

---

## 📄 Lisensi

Project ini dibuat untuk keperluan kompetisi dan riset akademis.

---

## 👨‍💻 Tim Pengembang

Dikembangkan dengan ❤️ untuk meningkatkan akses layanan kesehatan pernapasan di Indonesia.

---

<div align="center">

**RESPIRA.ID** — *Breathe Better, Live Better*

[🌐 Demo](https://respiraa-id.netlify.app) | [📧 Kontak](mailto:naylaoctavia6996@gmail.com)

</div>
