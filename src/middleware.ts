import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Middleware menggunakan konfigurasi edge-compatible (tanpa Credentials provider).
 * Ini menghindari error Node.js API di Edge Runtime.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
