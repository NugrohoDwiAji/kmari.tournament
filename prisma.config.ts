import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Lokasi schema Prisma
  schema: "prisma/schema.prisma",

  // Konfigurasi migrasi
  migrations: {
    path: "prisma/migrations",
    // Script seed yang dijalankan oleh `prisma db seed`
    seed: "tsx prisma/seed.ts",
  },

  // Datasource — URL tidak lagi di schema.prisma, tapi di sini
  datasource: {
    url: env("DATABASE_URL"),
  },
});
