"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, BookOpen, User, Calendar, Settings, Bookmark, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AppShell from "@/components/AppShell";
import OpportunityCard from "@/components/OpportunityCard";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/store/useStore";

interface Card {
  href: string;
  Icon: LucideIcon;
  title: string;
  desc: string;
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const profile = useStore((s) => s.profile);
  const savedIds = useStore((s) => s.savedIds);
  const opportunities = useStore((s) => s.opportunities);
  const courses = useStore((s) => s.courses);
  const courseProgressPct = useStore((s) => s.courseProgressPct);

  const displayName =
    profile.name ||
    (user?.email ? user.email.split("@")[0] : "");

  const cards: Card[] = [
    { href: "/catalog",  Icon: Search,   title: "Каталог",  desc: "Олимпиады, стипендии и стажировки" },
    { href: "/courses",  Icon: BookOpen, title: "Курсы",    desc: "Учитесь и отслеживайте прогресс" },
    { href: "/cabinet",  Icon: User,     title: "Кабинет",  desc: "Профиль, избранное и прогресс" },
    { href: "/calendar", Icon: Calendar, title: "Дедлайны", desc: "Избранное и напоминания в Telegram" },
    ...(isAdmin
      ? [{ href: "/admin", Icon: Settings, title: "Админ-панель", desc: "Управление контентом" }]
      : []),
  ];

  // first 3 opportunities as "recent"
  const recentOpps = opportunities.slice(0, 3);

  const coursesInProgress = courses.filter((c) => courseProgressPct(c.id) > 0).length;

  return (
    <AppShell>
      <div className="min-h-screen pb-20 pt-8 px-4 md:pt-10 md:px-[6vw]">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <p className="mb-1 text-sm text-[--muted]">Добро пожаловать,</p>
            <h1 className="font-display text-2xl font-bold text-[--text] tracking-[-0.02em] md:text-3xl">
              {displayName}
            </h1>
            {isAdmin && (
              <span className="mt-2 inline-block rounded-full border border-[--accent]/30 bg-[--accent]/10 px-3 py-0.5 text-xs font-medium text-[--accent]">
                Администратор
              </span>
            )}
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-2xl border border-[--border] bg-[--surface] p-6 transition-all duration-200 hover:border-[--border-hover] hover:bg-[--surface2]"
              >
                <div className="mb-3 text-[--muted]">
                  <card.Icon size={24} />
                </div>
                <h2 className="mb-1 text-[15px] font-semibold text-[--text] group-hover:text-white">
                  {card.title}
                </h2>
                <p className="text-xs text-[--muted]">{card.desc}</p>
              </Link>
            ))}
          </motion.div>

          {/* Mini stats */}
          {(savedIds.length > 0 || coursesInProgress > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              {savedIds.length > 0 && (
                <Link
                  href="/cabinet"
                  className="flex items-center gap-2 rounded-xl border border-[--border] bg-[--surface] px-4 py-2.5 text-sm transition-colors hover:border-[--border-hover]"
                >
                  <Bookmark size={14} className="text-[--accent]" />
                  <span className="text-[--muted]">Избранное:</span>
                  <span className="font-semibold text-[--text]">{savedIds.length}</span>
                </Link>
              )}
              {coursesInProgress > 0 && (
                <Link
                  href="/courses"
                  className="flex items-center gap-2 rounded-xl border border-[--border] bg-[--surface] px-4 py-2.5 text-sm transition-colors hover:border-[--border-hover]"
                >
                  <TrendingUp size={14} className="text-[#00E5C0]" />
                  <span className="text-[--muted]">Курсы в процессе:</span>
                  <span className="font-semibold text-[--text]">{coursesInProgress}</span>
                </Link>
              )}
            </motion.div>
          )}

          {/* Recent opportunities */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[--text]">
                Недавно опубликованные
              </h2>
              <Link
                href="/catalog"
                className="text-xs text-[--muted] transition-colors hover:text-[--text]"
              >
                Все возможности →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentOpps.map((op) => (
                <OpportunityCard key={op.id} opportunity={op} />
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </AppShell>
  );
}
