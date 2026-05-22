import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { Shield, LogIn, AlertCircle } from "lucide-react";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export const metadata = {
  title: "Login — Admin Panel",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  // Sudah login → langsung ke admin
  if (session) {
    redirect(callbackUrl ?? "/admin/matches");
  }

  async function handleLogin(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        username: formData.get("username"),
        password: formData.get("password"),
        redirectTo: callbackUrl ?? "/admin/matches",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        const url = new URL(
          `/login?error=invalid`,
          process.env.NEXTAUTH_URL ?? "http://localhost:3000"
        );
        if (callbackUrl) url.searchParams.set("callbackUrl", callbackUrl);
        redirect(url.pathname + url.search);
      }
      // AuthJS melempar NEXT_REDIRECT — biarkan bubble up
      throw err;
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-600/20 border-b border-white/10 p-8 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="mt-1 text-sm text-white/50">
            Masuk untuk mengelola pertandingan
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {/* Error banner */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Username atau password salah. Silakan coba lagi.</span>
            </div>
          )}

          <form action={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-white/70"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Masukkan username"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-orange-500/50 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-white/70"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-orange-500/50 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:shadow-orange-500/40 hover:brightness-110 active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 transition group-hover:translate-x-0.5" />
              Masuk ke Admin Panel
            </button>
          </form>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-white/30">
        Esports Tournament &mdash; Admin Area
      </p>
    </div>
  );
}
