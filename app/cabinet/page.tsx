"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Bookmark, CalendarDays, Calendar } from "lucide-react";
import { useStore } from "@/store/useStore";
import { tagLabels, categoryLabels, deadlineLabel, daysLeft } from "@/lib/recommend";
import { DaysLeftBadge } from "@/components/DaysLeftBadge";
import TelegramReminderButton from "@/components/TelegramReminderButton";
import AppShell from "@/components/AppShell";

const levelColors = {
  beginner: "#00E5C0",
  intermediate: "#8B7DFF",
  advanced: "#FFB020",
} as const;

const levelLabels = {
  beginner: "Начальный",
  intermediate: "Средний",
  advanced: "Продвинутый",
} as const;

export default function CabinetPage() {
  const profile = useStore((s) => s.profile);
  const savedIds = useStore((s) => s.savedIds);
  const opportunities = useStore((s) => s.opportunities);
  const courses = useStore((s) => s.courses);
  const courseProgressPct = useStore((s) => s.courseProgressPct);
  const toggleSaved = useStore((s) => s.toggleSaved);
  const resetProfile = useStore((s) => s.resetProfile);

  const savedOpps = opportunities.filter((op) => savedIds.includes(op.id));
  const coursesInProgress = courses.filter((c) => courseProgressPct(c.id) > 0);

  const upcomingDeadlines = savedOpps
    .filter((op) => daysLeft(op.deadline) >= 0)
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));

  return (
    <AppShell>
      <div className="min-h-screen pb-20 px-4 pt-10">
        <div className="mx-auto max-w-5xl space-y-10">

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[--border] bg-[--surface] p-6"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-[--text]">
                  {profile.onboarded && profile.name ? profile.name : "Личный кабинет"}
                </h1>
                {profile.onboarded ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.grade && (
                      <span className="rounded-full bg-[--accent]/10 px-3 py-0.5 text-xs font-medium text-[--accent]">
                        {profile.grade} класс
                      </span>
                    )}
                    {profile.interests.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[--border] px-3 py-0.5 text-xs text-[--muted]"
                      >
                        {tagLabels[tag]}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[--muted]">
                    Заполни профиль, чтобы получать персональные рекомендации
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                {!profile.onboarded ? (
                  <Link
                    href="/onboarding"
                    className="shrink-0 rounded-xl bg-[--accent] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                  >
                    Пройти онбординг
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm("Сбросить профиль?")) resetProfile();
                    }}
                    className="shrink-0 rounded-xl border border-[--border] px-5 py-2.5 text-sm text-[--muted] transition-colors hover:border-[--border-hover] hover:text-[--text]"
                  >
                    Сбросить профиль
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Courses in progress */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="mb-5 font-display text-xl font-bold text-[--text]">
              Мои курсы
            </h2>
            {coursesInProgress.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[--border] py-12 text-center">
                <BookOpen size={36} className="text-[--muted]" />
                <p className="text-sm text-[--muted]">Ты ещё не начал ни один курс</p>
                <Link
                  href="/courses"
                  className="rounded-xl border border-[--border] px-5 py-2 text-sm font-medium text-[--text] transition-all hover:border-[--border-hover]"
                >
                  Перейти к курсам
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {coursesInProgress.map((course) => {
                  const pct = courseProgressPct(course.id);
                  const color = levelColors[course.level];
                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="group flex flex-col gap-3 rounded-2xl border border-[--border] bg-[--surface] p-5 transition-all hover:border-[--border-hover]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[--surface2] text-[--muted]">
                          <BookOpen size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-semibold text-[--text]">
                            {course.title}
                          </p>
                          <p className="text-xs text-[--muted]">
                            {levelLabels[course.level]}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-[--muted]">Прогресс</span>
                          <span style={{ color }} className="font-semibold">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* Saved opportunities */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="mb-5 font-display text-xl font-bold text-[--text]">
              Сохранённые возможности
            </h2>
            {savedOpps.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[--border] py-12 text-center">
                <Bookmark size={36} className="text-[--muted]" />
                <p className="text-sm text-[--muted]">Ты ещё ничего не сохранил</p>
                <Link
                  href="/catalog"
                  className="rounded-xl border border-[--border] px-5 py-2 text-sm font-medium text-[--text] transition-all hover:border-[--border-hover]"
                >
                  Открыть каталог
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedOpps.map((op) => {
                  const dl = deadlineLabel(op.deadline);
                  const isUrgent =
                    dl.startsWith("Остался") ||
                    dl === "Сегодня последний день" ||
                    dl.startsWith("Осталось");
                  return (
                    <div
                      key={op.id}
                      className="group relative flex flex-col gap-3 rounded-2xl border border-[--border] bg-[--surface] p-5 transition-all hover:border-[--border-hover]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-full bg-[--accent]/10 px-2.5 py-0.5 text-xs font-medium text-[--accent]">
                          {categoryLabels[op.category]}
                        </span>
                        <button
                          onClick={() => toggleSaved(op.id)}
                          className="shrink-0 text-[#FFB020] transition-opacity hover:opacity-70"
                          title="Убрать из сохранённых"
                        >
                          ★
                        </button>
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-semibold leading-snug text-[--text]">
                          {op.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-[--muted]">{op.organizer}</p>
                      </div>
                      <p
                        className={`text-xs font-medium ${
                          isUrgent ? "text-[#FFB020]" : "text-[--muted]"
                        }`}
                      >
                        {dl}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* Deadlines from favorites */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="mb-5 flex items-center gap-2.5">
              <CalendarDays size={18} className="text-[--accent]" />
              <h2 className="font-display text-xl font-bold text-[--text]">
                Дедлайны из избранного
              </h2>
            </div>

            {savedOpps.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[--border] py-12 text-center">
                <Calendar size={36} className="text-[--muted]" />
                <p className="text-sm text-[--muted]">
                  Добавь возможности в избранное, чтобы следить за дедлайнами
                </p>
                <Link
                  href="/catalog"
                  className="rounded-xl border border-[--border] px-5 py-2 text-sm font-medium text-[--text] transition-all hover:border-[--border-hover]"
                >
                  Открыть каталог
                </Link>
              </div>
            ) : (
              <>
                {upcomingDeadlines.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {upcomingDeadlines.map((op) => (
                      <div
                        key={op.id}
                        className="flex items-start justify-between gap-4 rounded-2xl border border-[--border] bg-[--surface] p-5 hover:border-[--border-hover] transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-[--text] truncate">{op.title}</p>
                          <p className="text-sm text-[--muted] mt-0.5">{op.organizer}</p>
                          <p className="text-xs text-[--muted2] mt-2">{deadlineLabel(op.deadline)}</p>
                        </div>
                        <div className="shrink-0">
                          <DaysLeftBadge days={daysLeft(op.deadline)} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mb-6 text-sm text-[--muted]">
                    Все дедлайны истекли. Найди новые возможности в{" "}
                    <Link href="/catalog" className="text-[--accent] hover:underline">
                      каталоге
                    </Link>
                    .
                  </p>
                )}
                <TelegramReminderButton />
              </>
            )}
          </motion.section>

        </div>
      </div>
    </AppShell>
  );
}
