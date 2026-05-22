import type { NextAuthConfig } from "next-auth";

/**
 * Konfigurasi edge-compatible untuk dipakai di middleware.
 * Tidak boleh mengandung provider yang bergantung pada Node.js API (Credentials, dll).
 * Provider asli ditambahkan di auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute && !isLoggedIn) {
        // Auth.js otomatis redirect ke signIn dengan callbackUrl
        return false;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
