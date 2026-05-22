/**
 * Prisma Client Singleton — Prisma v7
 *
 * Perubahan dari versi sebelumnya:
 * - DATABASE_URL di-parse manual agar bisa set connectTimeout & acquireTimeout
 *   yang lebih pendek — sehingga error koneksi muncul cepat dan informatif
 *   (default acquireTimeout 10 detik menyebabkan "pool timeout" yang membingungkan)
 */

import { PrismaClient } from "@/generated/prisma";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Parse DATABASE_URL ke PoolConfig dengan timeout lebih pendek.
 * Fallback ke string mentah jika URL tidak valid.
 */
function buildPoolConfig(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1).split("?")[0],
      connectionLimit: 5,
      /**
       * connectTimeout: batas waktu membuka socket ke DB server (ms).
       * Default mariadb: 1000ms — cukup untuk LAN/lokal.
       */
      connectTimeout: 5000,
      /**
       * acquireTimeout: batas waktu menunggu koneksi tersedia dari pool (ms).
       * Default mariadb: 10000ms — dikurangi agar error muncul lebih cepat.
       */
      acquireTimeout: 5000,
    };
  } catch {
    // URL tidak valid → biarkan mariadb yang parse
    return databaseUrl;
  }
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      [
        "❌ DATABASE_URL tidak ditemukan.",
        "Tambahkan ke file .env.local:",
        '   DATABASE_URL="mysql://user:password@localhost:3306/tournament"',
      ].join("\n"),
    );
  }

  const adapter = new PrismaMariaDb(buildPoolConfig(databaseUrl));

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
