/**
 * Prisma Seed — Esports Tournament
 *
 * Prisma v7: env tidak di-load otomatis oleh CLI.
 * dotenv/config harus di-import pertama kali.
 *
 * Jalankan: npm run db:seed   (prisma db seed via prisma.config.ts)
 */

import "dotenv/config";
import { PrismaClient, MatchStatus } from "../src/generated/prisma";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tidak ditemukan di .env");
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const groupsData = [
  {
    name: "A",
    teams: ["about you", "lash hope", "petarunk69", "over", "hoki budeh"],
  },
  {
    name: "B",
    teams: ["after rain", "Bain zeus", "medana", "qolamnavictus", "red bull"],
  },
  { name: "C", teams: ["miadiban", "fire fux", "loyalityx", "no name"] },
  { name: "D", teams: ["backpack-1", "enyyous", "cosmic", "bruk"] },
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Generate semua pasangan round-robin (setiap tim vs setiap tim 1x) */
function generateRoundRobin(teams: { id: string }[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairs.push([teams[i].id, teams[j].id]);
    }
  }
  return pairs;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Bersihkan data lama (urutan penting: FK constraint)
  await prisma.bracketMatch.deleteMany();
  await prisma.standing.deleteMany();
  await prisma.matchResult.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.group.deleteMany();

  for (const groupData of groupsData) {
    // 1. Buat grup
    const group = await prisma.group.create({
      data: { name: groupData.name },
    });

    // 2. Buat tim
    const teams = await Promise.all(
      groupData.teams.map((teamName) =>
        prisma.team.create({
          data: {
            name: teamName,
            slug: toSlug(teamName),
            groupId: group.id,
          },
        }),
      ),
    );

    // 3. Inisialisasi klasemen (semua 0)
    await Promise.all(
      teams.map((team) =>
        prisma.standing.create({
          data: { teamId: team.id, groupId: group.id },
        }),
      ),
    );

    // 4. Generate jadwal round-robin
    const pairs = generateRoundRobin(teams);
    let round = 1;
    let matchInRound = 0;
    const maxPerRound = Math.floor(teams.length / 2);

    for (const [homeId, awayId] of pairs) {
      if (matchInRound >= maxPerRound) {
        round++;
        matchInRound = 0;
      }
      await prisma.match.create({
        data: {
          groupId: group.id,
          homeTeamId: homeId,
          awayTeamId: awayId,
          round,
          status: MatchStatus.SCHEDULED,
        },
      });
      matchInRound++;
    }

    const totalMatches = pairs.length;
    console.log(
      `✅ Grup ${groupData.name}: ${teams.length} tim, ${totalMatches} match (${round} round)`,
    );
  }

  console.log("\n🎉 Seed selesai!");
  console.log(
    "📋 Jadwal match sudah dibuat. Silakan input skor di /admin/matches",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
