"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  ["Каталог", "/catalog"],
  ["Курсы", "/courses"],
  ["Ассистент", "/assistant"],
  ["Кабинет", "/cabinet"],
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/50 px-[6vw] py-5 backdrop-blur-[14px]">
      <Link href="/" className="text-[19px] font-bold leading-none tracking-[-0.02em] text-[var(--text)]">
        Mentoria<span className="text-[var(--accent)]"> Hub</span>
      </Link>

      <nav className="hidden gap-[34px] md:flex">
        {NAV_LINKS.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="text-[14px] font-medium text-[var(--muted)] transition-colors duration-200 hover:text-[var(--text)]"
          >
            {label}
          </Link>
        ))}
        {!loading && user && isAdmin && (
          <Link
            href="/admin"
            className="text-[14px] font-medium text-[var(--accent)] transition-colors duration-200 hover:text-[var(--accent)]/80"
          >
            Админ
          </Link>
        )}
      </nav>

      {/* Desktop auth area */}
      <div className="hidden md:flex items-center gap-3">
        {!loading && user ? (
          <>
            <span className="max-w-[160px] truncate text-[13px] text-[var(--muted)]">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-[9px] border border-[var(--border)] bg-transparent px-[18px] py-[9px] text-[14px] font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--surface)]"
            >
              Выйти
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className="rounded-[9px] border border-[var(--border)] bg-transparent px-[18px] py-[9px] text-[14px] font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--surface)]"
          >
            Войти
          </Link>
        )}
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center text-[var(--muted)] md:hidden"
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 7h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-t border-[var(--border)] bg-[var(--bg)]/95 px-[6vw] pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-[8px] px-2 py-2.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              >
                {label}
              </Link>
            ))}
            {!loading && user && isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-[8px] px-2 py-2.5 text-sm text-[var(--accent)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                Админ
              </Link>
            )}
            <div className="mt-3 border-t border-[var(--border)] pt-3">
              {!loading && user ? (
                <>
                  <p className="mb-2 truncate px-2 text-xs text-[var(--muted)]">{user.email}</p>
                  <button
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className="w-fit rounded-[9px] border border-[var(--border)] px-[18px] py-[9px] text-sm font-medium text-[var(--text)]"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="w-fit rounded-[9px] border border-[var(--border)] px-[18px] py-[9px] text-sm font-medium text-[var(--text)]"
                >
                  Войти
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
