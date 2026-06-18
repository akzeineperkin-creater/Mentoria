"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Desktop sidebar — fixed on the left */}
      <div className="fixed inset-y-0 left-0 hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-[60px] items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/95 px-5 backdrop-blur-[14px] lg:hidden">
        <Link
          href="/dashboard"
          className="text-[18px] font-bold leading-none tracking-[-0.01em] text-[var(--text)]"
        >
          Mentoria<span className="font-normal text-[var(--muted)]"> Hub</span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Content — offset right on desktop, offset top on mobile */}
      <div className="pt-[60px] lg:pl-[240px] lg:pt-0">
        {children}
      </div>
    </div>
  );
}
