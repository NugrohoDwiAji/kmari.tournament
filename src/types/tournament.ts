export type GroupName = "A" | "B" | "C" | "D";

export interface TeamStanding {
  position: number;
  teamId: string;
  teamName: string;
  teamSlug: string;
  groupId: string;
  groupName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  status: "champion" | "runner-up" | "eliminate" | "neutral";
}

export interface MatchWithTeams {
  id: string;
  round: number;
  groupId: string;
  groupName: string;
  status: string;
  scheduledAt: Date | null;
  homeTeam: { id: string; name: string; slug: string };
  awayTeam: { id: string; name: string; slug: string };
  result?: {
    homeScore: number;
    awayScore: number;
    notes?: string | null;
  } | null;
}

export interface BracketMatchData {
  id: string;
  round: string;
  matchNumber: number;
  team1: { id: string; name: string } | null;
  team2: { id: string; name: string } | null;
  team1Score: number | null;
  team2Score: number | null;
  winnerId: string | null;
  status: string;
}

export interface GroupStandings {
  groupId: string;
  groupName: string;
  standings: TeamStanding[];
}
