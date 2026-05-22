import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Esports Tournament — Klasemen & Bracket",
  description: "Platform klasemen dan bracket turnamen esports profesional",
  keywords: ["esports", "tournament", "klasemen", "bracket"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <div className="relative min-h-screen">
          {/* Background gradient */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute top-1/2 -left-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full bg-pink-500/5 blur-3xl" />
          </div>
          <Navbar />
          <main className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </main>
        </div>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(222.2 84% 8%)",
              border: "1px solid hsl(217.2 32.6% 20%)",
              color: "hsl(210 40% 98%)",
            },
          }}
        />
      </body>
    </html>
  );
}
