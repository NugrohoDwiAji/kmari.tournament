# 🏆 Esports Tournament — Klasemen & Bracket

Platform klasemen turnamen esports berbasis **Next.js 15 App Router**, **TypeScript**, **Prisma ORM**, dan **MySQL** dengan desain modern dark-mode.

---

## 📦 Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict) |
| ORM | **Prisma 7** + MySQL (via `@prisma/adapter-mariadb`) |
| Styling | Tailwind CSS v3 + shadcn/ui patterns |
| Icons | Lucide React |
| Toast | Sonner |
| Validation | Zod |

---

## 🗂️ Struktur Folder

```
src/
├── actions/
│   └── match-actions.ts        # Server Actions (submit result, recalc standings, etc.)
├── app/
│   ├── layout.tsx              # Root layout (Navbar, Toaster, background)
│   ├── page.tsx                # Halaman klasemen utama (Server Component)
│   ├── loading.tsx             # Skeleton loading
│   ├── not-found.tsx           # 404 page
│   ├── bracket/
│   │   ├── page.tsx            # Halaman bracket QF (Server Component)
│   │   └── loading.tsx
│   └── admin/
│       └── matches/
│           ├── page.tsx        # Halaman admin input skor
│           └── loading.tsx
├── components/
│   ├── layout/
│   │   └── navbar.tsx          # Sticky navbar dengan mobile menu
│   ├── standings/
│   │   ├── standings-table.tsx # Tabel klasemen responsif
│   │   ├── group-tabs-client.tsx # Tab grup (Client Component)
│   │   └── skeleton.tsx        # Loading skeleton
│   ├── bracket/
│   │   └── bracket-view.tsx    # Tampilan bracket QF
│   └── admin/
│       └── admin-matches-client.tsx # Form input skor match
├── lib/
│   ├── prisma.ts               # Singleton Prisma client
│   └── utils.ts                # cn(), toSlug()
└── types/
    └── tournament.ts           # TypeScript interfaces
```
prisma/
├── schema.prisma               # Database schema
└── seed.ts                     # Seed data (18 tim, 4 grup)
prisma.config.ts                # Konfigurasi Prisma v7 (datasource URL, migrations, seed)
src/generated/prisma/           # Prisma Client yang di-generate (gitignored, auto-generate saat build)
```

---

## 🆕 Prisma v7 — Perubahan Utama

| Aspek | Sebelum (v5) | Sekarang (v7) |
|---|---|---|
| Import client | `from "@prisma/client"` | `from "@/generated/prisma"` |
| Output client | `node_modules/@prisma/client` | `src/generated/prisma/` |
| Konfigurasi | `datasource { url = env(...) }` | `prisma.config.ts` |
| Driver | Rust binary engine | `@prisma/adapter-mariadb` (WASM) |
| `dotenv` | Auto-load oleh CLI | Wajib `import "dotenv/config"` eksplisit |
| `"type": "module"` | Tidak diperlukan | **Wajib** di `package.json` |
| Seed otomatis | Saat `migrate dev` | Manual: `prisma db seed` |

```prisma
// prisma/schema.prisma — Prisma v7
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"  // wajib di v7
}

datasource db {
  provider = "mysql"  // url pindah ke prisma.config.ts
}
```

```ts
// prisma.config.ts — File konfigurasi baru di v7
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: env("DATABASE_URL") },
});
```

```ts
// src/lib/prisma.ts — Wajib pakai driver adapter di v7
import { PrismaClient } from "@/generated/prisma";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
export const prisma = new PrismaClient({ adapter });
```

---

## 🚀 Setup & Instalasi

### 1. Clone & Install

```bash
git clone <repo-url>
cd esports-tournament
npm install
```

### 2. Konfigurasi Database

Buat file `.env` (salin dari `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:

```env
# MySQL lokal
DATABASE_URL="mysql://root:password@localhost:3306/esports_tournament"

# Atau PlanetScale
# DATABASE_URL="mysql://USER:PASSWORD@aws.connect.psdb.cloud/esports_tournament?sslaccept=strict"
```

### 3. Setup Database & Seed

```bash
# Buat tabel di database
npx prisma db push

# Isi data awal (grup, tim, jadwal match)
npm run db:seed

# Atau: prisma migrate dev (untuk environment development dengan tracking migration)
npx prisma migrate dev --name init
```

### 4. Jalankan Dev Server

```bash
npm run dev
# Buka http://localhost:3000
```

---

## 📋 Script NPM

| Command | Fungsi |
|---|---|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build production |
| `npm run start` | Jalankan production server |
| `npm run db:push` | Push schema ke database (tanpa migration) |
| `npm run db:migrate` | Buat & jalankan migration |
| `npm run db:seed` | Seed data (grup, tim, jadwal) |
| `npm run db:studio` | Buka Prisma Studio (GUI database) |
| `npm run db:generate` | Regenerate Prisma Client |

---

## 🎮 Fitur

### Fase Grup
- 4 Grup (A, B, C, D)
- **Grup A:** about you, lash hope, petarunk69, over, hoki budeh
- **Grup B:** after rain, Bain zeus, medana, qolamnavictus, red bull
- **Grup C:** miadiban, fire fux, loyalityx, no name
- **Grup D:** backpack-1, enyyous, cosmic, bruk
- Sistem poin: Menang=3, Seri=1, Kalah=0
- Generator jadwal Round Robin otomatis
- Klasemen real-time setelah setiap match selesai

### Sorting Klasemen
Urutan prioritas:
1. Poin tertinggi
2. Goal Difference (GD) tertinggi
3. Goals For (GF) terbanyak
4. Head-to-head (tiebreaker manual)

### Highlight Posisi
- 🟡 **Emas** — Juara Grup (lolos QF)
- 🟢 **Hijau** — Runner-up (lolos QF)
- 🔴 **Merah** — Posisi 3+ (eliminasi)

### Quarter Final Bracket
Bracket otomatis berdasarkan posisi akhir fase grup:

| Match | Tim 1 | Tim 2 |
|---|---|---|
| QF 1 | Juara Grup A | Runner-up Grup B |
| QF 2 | Juara Grup B | Runner-up Grup C |
| QF 3 | Juara Grup C | Runner-up Grup D |
| QF 4 | Juara Grup D | Runner-up Grup A |

### Admin Panel (`/admin/matches`)
- Input skor per match
- Edit skor yang sudah ada
- Progress bar per grup
- Match dikelompokkan per round
- Toast notification sukses/gagal
- Klasemen auto-recalculate setelah save

---

## 🗄️ Database Schema

```
Group (A, B, C, D)
  └── Team (nama, slug, groupId)
       └── Match (homeTeam, awayTeam, round, status)
            └── MatchResult (homeScore, awayScore, notes)
  └── Standing (played, won, drawn, lost, gf, ga, gd, points, position)

BracketMatch (round: QF/SF/Final, team1, team2, scores, winner)
```

---

## 🔍 Contoh Query MySQL Langsung

```sql
-- Klasemen Grup A diurutkan
SELECT
  t.name AS tim,
  s.played AS M,
  s.won AS W,
  s.drawn AS D,
  s.lost AS L,
  s.goalsFor AS GF,
  s.goalsAgainst AS GA,
  s.goalDiff AS GD,
  s.points AS PTS
FROM standings s
JOIN teams t ON t.id = s.teamId
JOIN groups g ON g.id = s.groupId
WHERE g.name = 'A'
ORDER BY s.points DESC, s.goalDiff DESC, s.goalsFor DESC;

-- Semua match yang belum selesai
SELECT
  m.id,
  g.name AS grup,
  m.round,
  ht.name AS home,
  at.name AS away,
  m.status
FROM matches m
JOIN groups g ON g.id = m.groupId
JOIN teams ht ON ht.id = m.homeTeamId
JOIN teams at ON at.id = m.awayTeamId
WHERE m.status = 'SCHEDULED'
ORDER BY g.name, m.round;

-- Head-to-head dua tim
SELECT
  ht.name AS home,
  mr.homeScore,
  mr.awayScore,
  at.name AS away,
  m.status
FROM matches m
JOIN match_results mr ON mr.matchId = m.id
JOIN teams ht ON ht.id = m.homeTeamId
JOIN teams at ON at.id = m.awayTeamId
WHERE (ht.name = 'about you' AND at.name = 'lash hope')
   OR (ht.name = 'lash hope' AND at.name = 'about you');

-- Top scorer / juara semua grup
SELECT
  g.name AS grup,
  t.name AS tim,
  s.points,
  s.won,
  s.goalDiff,
  s.position
FROM standings s
JOIN teams t ON t.id = s.teamId
JOIN groups g ON g.id = s.groupId
WHERE s.position IN (1, 2)
ORDER BY g.name, s.position;
```

---

## ☁️ Deployment

### Vercel + PlanetScale (Recommended)

1. **Buat database di PlanetScale** → salin connection string
2. **Deploy ke Vercel:**
   ```bash
   vercel --prod
   ```
3. **Set Environment Variables** di Vercel Dashboard:
   ```
   DATABASE_URL=mysql://USER:PASS@aws.connect.psdb.cloud/DB?sslaccept=strict
   ```
4. **Jalankan seed** via Vercel CLI atau PlanetScale console:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

### Vercel + Railway MySQL

1. Buat MySQL service di [Railway](https://railway.app)
2. Salin `DATABASE_URL` dari Railway
3. Deploy ke Vercel dengan env var tersebut

### Self-hosted (VPS)

```bash
# Build
npm run build

# Start dengan PM2
npm install -g pm2
pm2 start npm --name "esports-tournament" -- start
pm2 save
```

---

## 🔒 Best Practices Production

- [ ] Ganti `DATABASE_URL` dengan nilai asli, **jangan commit ke git**
- [ ] Aktifkan SSL untuk koneksi database production
- [ ] Set `NEXTAUTH_SECRET` (jika menambah auth)
- [ ] Gunakan Prisma Migrate (bukan `db push`) untuk production
- [ ] Setup monitoring dengan Vercel Analytics atau Sentry
- [ ] Aktifkan ISR/revalidation untuk halaman klasemen publik

---

## 📝 Lisensi

MIT License — bebas digunakan untuk keperluan turnamen komunitas.
#   k m a r i . t o u r n a m e n t  
 