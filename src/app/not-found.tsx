import Link from "next/link";
import { Trophy } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center space-y-6">
      <div className="text-8xl font-black gradient-text">404</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Halaman Tidak Ditemukan</h1>
        <p className="text-muted-foreground max-w-md">
          Sepertinya halaman yang kamu cari tidak ada. Mungkin sudah dieliminasi dari turnamen 🎮
        </p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
      >
        <Trophy className="w-4 h-4" />
        Kembali ke Klasemen
      </Link>
    </div>
  );
}
