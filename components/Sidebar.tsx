"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  BookOpen,
  MessageSquare,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
};

const STUDENT_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Главная" },
  { href: "/catalog", icon: Search, label: "Каталог" },
  { href: "/courses", icon: BookOpen, label: "Курсы" },
  { href: "/assistant", icon: MessageSquare, label: "Ассистент" },
  { href: "/cabinet", icon: User, label: "Кабинет" },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Главная" },
  { href: "/assistant", icon: MessageSquare, label: "Ассистент" },
  { href: "/admin", icon: Settings, label: "Администрирование" },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  const items = isAdmin ? ADMIN_NAV_ITEMS : STUDENT_NAV_ITEMS;

  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-[var(--border)] bg-[var(--bg)]">
      {/* Logo */}
      <div className="flex h-[60px] shrink-0 items-center border-b border-[var(--border)] px-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="text-[18px] font-bold leading-none tracking-[-0.01em] text-[var(--text)]"
        >
          Mentoria<span className="font-normal text-[var(--muted)]"> Hub</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-0.5">
          {items.map(({ href, icon: Icon, label }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={`group flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={1.75}
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--muted2)] group-hover:text-[var(--muted)]"
                  }`}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Theme toggle + User + logout */}
      <div className="shrink-0 border-t border-[var(--border)] p-3">
        <div className="mb-1 px-1">
          <ThemeToggle />
        </div>
        {user && (
          <div className="mb-1 flex items-center gap-2.5 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-[11px] font-bold text-[var(--accent)]">
              {user.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="min-w-0 truncate text-xs text-[var(--muted)]">
              {user.email}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium text-[var(--muted)] transition-colors duration-150 hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
        >
          <LogOut size={16} strokeWidth={1.75} className="shrink-0 text-[var(--muted2)]" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
