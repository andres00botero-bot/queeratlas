"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export default function FloatingHomeButton() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) return null;

  return (
    <Link
      href="/"
      aria-label="Back to Home"
      className="fixed bottom-4 right-4 z-[90] inline-flex items-center gap-2 rounded-full border border-fuchsia-200/30 bg-[linear-gradient(135deg,rgba(236,72,153,0.22),rgba(99,102,241,0.2),rgba(10,10,10,0.92))] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_44px_rgba(217,70,239,0.35)] backdrop-blur transition hover:scale-[1.02] hover:border-fuchsia-100/45 hover:shadow-[0_18px_55px_rgba(192,38,211,0.42)] sm:bottom-6 sm:right-6"
    >
      <Home className="h-4 w-4" aria-hidden="true" />
      <span>Home</span>
    </Link>
  );
}
