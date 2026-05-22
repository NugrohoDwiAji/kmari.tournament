import { getGroupMatches, getGroups } from "@/actions/match-actions";
import { AdminMatchesClient } from "@/components/admin/admin-matches-client";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminMatchesPage() {
  const [matches, groups] = await Promise.all([
    getGroupMatches(),
    getGroups(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Panel Admin</h1>
          <p className="text-sm text-muted-foreground">Input hasil pertandingan fase grup</p>
        </div>
      </div>

      <AdminMatchesClient matches={matches} groups={groups} />
    </div>
  );
}
