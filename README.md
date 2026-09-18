# PROPERTY MANAGEMENT

Integrated Property Sales & Marketing System — scaffold Fase 2–6 dari roadmap
(arsitektur, skema database, auth & RBAC, dashboard dengan dummy data, unit
management dasar). Modul CRM/pipeline/booking/KPR lainnya sudah punya skema
database & RBAC lengkap, UI-nya menyusul di fase berikutnya (lihat placeholder
di tiap halaman sidebar).

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL ·
Auth.js (NextAuth, credentials + JWT) · Recharts · Zod · React Hook Form.

## Setup lokal

```bash
npm install
cp .env.example .env   # isi DATABASE_URL & NEXTAUTH_SECRET
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

`NEXTAUTH_SECRET` bisa digenerate dengan `openssl rand -base64 32`.

## Akun demo (setelah `npm run db:seed`)

Semua akun memakai password **`password123`**.

| Role | Email |
| --- | --- |
| Super Admin | superadmin@propertymanagement.local |
| Owner / Direksi | owner@propertymanagement.local |
| Sales Manager | salesmanager@propertymanagement.local |
| Admin | admin@propertymanagement.local |
| Digital Marketing | marketing@propertymanagement.local |
| Sales (10 akun) | sales1@propertymanagement.local … sales10@propertymanagement.local |

Data dummy: 1 project (130 unit di 5 block), 100 leads, 20 survey, ~30 booking
(15 murni booking + 10 KPR + 5 di antaranya sudah AKAD), 5 campaign, 30
content — mengikuti skala di dokumen requirement.

## Struktur

```
prisma/schema.prisma   Skema database (lihat ERD di dokumen requirement §9)
prisma/seed.ts         Dummy data generator
src/lib/auth.ts        Konfigurasi Auth.js (credentials provider)
src/lib/rbac.ts        Peta modul -> role yang boleh akses
src/middleware.ts       Proteksi route /dashboard/* berdasarkan role
src/app/dashboard/      Dashboard shell (sidebar, topbar) + tiap modul
```

RBAC ditegakkan dua kali: di `middleware.ts` (blokir navigasi ke modul yang
tidak diizinkan) dan di level query (contoh: `src/app/dashboard/leads/page.tsx`
memfilter `salesId` untuk role SALES) — jadi sales tidak bisa melihat lead
sales lain lewat cara apa pun.

## Deploy

**Database (Railway):** service Postgres sudah disiapkan di project Railway
`courteous-encouragement` (service `Postgres`, TCP proxy aktif di
`sakura.proxy.rlwy.net:38642` untuk akses dari luar Railway). Ambil
`DATABASE_URL` lengkap dari tab **Variables** service tersebut di dashboard
Railway (nilainya di-redact lewat API demi keamanan), lalu jalankan:

```bash
DATABASE_URL="<connection string dari Railway>" npx prisma migrate deploy
DATABASE_URL="<connection string dari Railway>" npm run db:seed
```

**App (Vercel):** setelah repo ini di GitHub, buat project baru di Vercel dari
repo ini, lalu set environment variables:

- `DATABASE_URL` — connection string Railway Postgres di atas
- `NEXTAUTH_URL` — URL produksi Vercel-nya
- `NEXTAUTH_SECRET` — hasil `openssl rand -base64 32`

Build command default (`prisma generate && next build`) sudah benar lewat
`package.json`.
