import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="space-y-4">
      {/* Admin top bar */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm backdrop-blur-sm">
        <span className="text-white/50">
          Login sebagai{" "}
          <span className="font-semibold text-orange-400">
            {session.user?.name ?? "Admin"}
          </span>
        </span>
        <form action={handleSignOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-red-400"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </form>
      </div>

      {children}
    </div>
  );
}
