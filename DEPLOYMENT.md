# Panduan Deployment: Netlify + Railway + Supabase

Arsitektur:
- **Frontend** → Netlify (React/Vite)
- **Backend** → Railway (Node.js/Express)
- **Database** → Supabase (PostgreSQL)

---

## 1. Supabase (Database)

### Buat Project
1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Isi nama project, password database (simpan baik-baik!), pilih region **Southeast Asia (Singapore)**
3. Tunggu project selesai dibuat (~2 menit)

### Setup Schema
1. Di Supabase Dashboard → buka **SQL Editor**
2. Copy isi file `database_postgres.sql` dari root project ini
3. Paste dan klik **Run**

### Ambil Connection String
1. Buka **Project Settings** → **Database**
2. Scroll ke bagian **Connection string** → pilih tab **URI**
3. Copy string-nya, ganti `[YOUR-PASSWORD]` dengan password kamu
4. String ini akan dipakai sebagai `DATABASE_URL` di Railway

---

## 2. Railway (Backend)

### Deploy
1. Buka [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Pilih repo ini
3. Railway akan otomatis detect `server/railway.toml`

   > **Penting:** Atur **Root Directory** ke `server` di pengaturan service Railway

4. Setelah deploy, Railway akan memberi URL seperti `https://your-app.up.railway.app`

### Environment Variables
Di Railway → Service → **Variables**, tambahkan semua variabel berikut:

| Variable | Nilai |
|---|---|
| `DATABASE_URL` | Connection string dari Supabase (langkah 1) |
| `JWT_SECRET` | String acak minimal 32 karakter |
| `GEMINI_API_KEY` | API key dari Google AI Studio |
| `OPENWEATHER_API_KEY` | API key dari OpenWeatherMap |
| `TELEGRAM_BOT_TOKEN` | Token dari @BotFather (jika pakai Telegram) |
| `PORT` | `5001` |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://your-app.netlify.app,http://localhost:5173` |

> Ganti `https://your-app.netlify.app` dengan URL Netlify kamu nanti (lihat langkah 3)

---

## 3. Netlify (Frontend)

### Deploy
1. Buka [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Pilih repo GitHub kamu
3. Konfigurasi build:
   - **Base directory**: *(kosongkan)*
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Environment Variables
Di Netlify → Site → **Site configuration** → **Environment variables**, tambahkan:

| Variable | Nilai |
|---|---|
| `VITE_API_URL` | URL Railway kamu + `/api`, contoh: `https://your-app.up.railway.app/api` |

4. Klik **Deploy site**
5. Setelah dapat URL Netlify, **kembali ke Railway** dan update `ALLOWED_ORIGINS` dengan URL Netlify tersebut

---

## 4. Setelah Deploy: Update CORS

1. Di Railway → Variables → ubah `ALLOWED_ORIGINS`:
   ```
   https://nama-app-kamu.netlify.app,http://localhost:5173
   ```
2. Redeploy Railway (otomatis setelah save variable)

---

## Checklist

- [ ] Supabase: project dibuat, schema SQL dijalankan
- [ ] Railway: root directory diset ke `server`, semua env variable diisi
- [ ] Netlify: `VITE_API_URL` diisi dengan URL Railway
- [ ] Railway: `ALLOWED_ORIGINS` diupdate dengan URL Netlify final
- [ ] Test login/register berjalan
- [ ] Test diagnosis berjalan

---

## Development Lokal

```bash
# Terminal 1 - Backend
cd server
cp .env.example .env   # isi DATABASE_URL dengan Supabase connection string
npm install
npm run dev

# Terminal 2 - Frontend
cp .env.example .env   # isi VITE_API_URL=http://localhost:5001/api
npm install
npm run dev
```
