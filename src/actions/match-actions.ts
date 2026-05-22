"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { TeamStanding } from "@/types/tournament";

const SubmitResultSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.coerce.number().min(0).max(999),
  awayScore: z.coerce.number().min(0).max(999),
  notes: z.string().optional(),
});

export type SubmitResultState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitMatchResult(
  prevState: SubmitResultState,
  formData: FormData
): Promise<SubmitResultState> {
  const parsed = SubmitResultSchema.safeParse({
    matchId: formData.get("matchId"),
    homeScore: formData.get("homeScore"),
    awayScore: formData.get("awayScore"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { matchId, homeScore, awayScore, notes } = parsed.data;

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { result: true, homeTeam: true, awayTeam: true },
    });

    if (!match) return { success: false, message: "Match tidak ditemukan" };
    if (match.status === "CANCELLED")
      return { success: false, message: "Match dibatalkan" };

    // Upsert result
    await prisma.matchResult.upsert({
      where: { matchId },
      create: { matchId, homeScore, awayScore, notes },
      update: { homeScore, awayScore, notes },
    });

    // Update match status
    await prisma.match.update({
      where: { id: matchId },
      data: { status: "FINISHED" },
    });

    // Recalculate standings for the group
    await recalculateGroupStandings(match.groupId);

    revalidatePath("/");
    revalidatePath("/standings");
    revalidatePath("/admin/matches");
    revalidatePath("/bracket");

    return { success: true, message: "Hasil pertandingan berhasil disimpan!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

export async function recalculateGroupStandings(groupId: string) {
  const matches = await prisma.match.findMany({
    where: { groupId, status: "FINISHED" },
    include: { result: true },
  });

  const teams = await prisma.team.findMany({ where: { groupId } });

  // Reset standings
  await prisma.standing.updateMany({
    where: { groupId },
    data: {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
      position: 0,
    },
  });

  const statsMap: Record<
    string,
    {
      played: number;
      won: number;
      drawn: number;
      lost: number;
      gf: number;
      ga: number;
      points: number;
    }
  > = {};

  for (const team of teams) {
    statsMap[team.id] = {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      points: 0,
    };
  }

  for (const match of matches) {
    if (!match.result) continue;
    const { homeScore, awayScore } = match.result;
    const { homeTeamId, awayTeamId } = match;

    if (!statsMap[homeTeamId] || !statsMap[awayTeamId]) continue;

    statsMap[homeTeamId].played++;
    statsMap[awayTeamId].played++;
    statsMap[homeTeamId].gf += homeScore;
    statsMap[homeTeamId].ga += awayScore;
    statsMap[awayTeamId].gf += awayScore;
    statsMap[awayTeamId].ga += homeScore;

    if (homeScore > awayScore) {
      statsMap[homeTeamId].won++;
      statsMap[homeTeamId].points += 3;
      statsMap[awayTeamId].lost++;
    } else if (homeScore < awayScore) {
      statsMap[awayTeamId].won++;
      statsMap[awayTeamId].points += 3;
      statsMap[homeTeamId].lost++;
    } else {
      statsMap[homeTeamId].drawn++;
      statsMap[homeTeamId].points++;
      statsMap[awayTeamId].drawn++;
      statsMap[awayTeamId].points++;
    }
  }

  // Sort for position
  const sorted = Object.entries(statsMap).sort(([, a], [, b]) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdB = b.gf - b.ga;
    const gdA = a.gf - a.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });

  for (let i = 0; i < sorted.length; i++) {
    const [teamId, s] = sorted[i];
    await prisma.standing.updateMany({
      where: { teamId, groupId },
      data: {
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.gf,
        goalsAgainst: s.ga,
        goalDiff: s.gf - s.ga,
        points: s.points,
        position: i + 1,
      },
    });
  }
}

export async function getGroupStandings() {
  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
    include: {
      standings: {
        include: { team: true },
        orderBy: [
          { points: "desc" },
          { goalDiff: "desc" },
          { goalsFor: "desc" },
        ],
      },
    },
  });

  return groups.map((group, _gi) => ({
    groupId: group.id,
    groupName: group.name,
    standings: group.standings.map((s, idx) => {
      let status: TeamStanding["status"] = "neutral";
      if (idx === 0) status = "champion";
      else if (idx === 1) status = "runner-up";
      else status = "eliminate";

      return {
        position: idx + 1,
        teamId: s.teamId,
        teamName: s.team.name,
        teamSlug: s.team.slug,
        groupId: group.id,
        groupName: group.name,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDiff: s.goalDiff,
        points: s.points,
        status,
      } satisfies TeamStanding;
    }),
  }));
}

export async function getGroupMatches(groupId?: string) {
  const matches = await prisma.match.findMany({
    where: groupId ? { groupId } : undefined,
    include: {
      group: true,
      homeTeam: true,
      awayTeam: true,
      result: true,
    },
    orderBy: [{ round: "asc" }, { createdAt: "asc" }],
  });

  return matches.map((m) => ({
    id: m.id,
    round: m.round,
    groupId: m.groupId,
    groupName: m.group.name,
    status: m.status,
    scheduledAt: m.scheduledAt,
    homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, slug: m.homeTeam.slug },
    awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, slug: m.awayTeam.slug },
    result: m.result
      ? {
          homeScore: m.result.homeScore,
          awayScore: m.result.awayScore,
          notes: m.result.notes,
        }
      : null,
  }));
}

export async function generateQuarterFinals() {
  const standings = await getGroupStandings();

  const groupMap: Record<string, TeamStanding[]> = {};
  for (const g of standings) {
    groupMap[g.groupName] = g.standings;
  }

  // QF: A1 vs B2, B1 vs C2, C1 vs D2, D1 vs A2
  const quarterFinals = [
    {
      matchNumber: 1,
      team1: groupMap["A"]?.[0],
      team2: groupMap["B"]?.[1],
      label: "QF1: Juara A vs Runner-up B",
    },
    {
      matchNumber: 2,
      team1: groupMap["B"]?.[0],
      team2: groupMap["C"]?.[1],
      label: "QF2: Juara B vs Runner-up C",
    },
    {
      matchNumber: 3,
      team1: groupMap["C"]?.[0],
      team2: groupMap["D"]?.[1],
      label: "QF3: Juara C vs Runner-up D",
    },
    {
      matchNumber: 4,
      team1: groupMap["D"]?.[0],
      team2: groupMap["A"]?.[1],
      label: "QF4: Juara D vs Runner-up A",
    },
  ];

  return quarterFinals;
}

export async function getGroups() {
  return prisma.group.findMany({ orderBy: { name: "asc" } });
}
