"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useStore } from "@/store/useStore";
import { tagLabels } from "@/lib/recommend";
import AppShell from "@/components/AppShell";

const levelLabels = {
  beginner: "Начальный",
  intermediate: "Средний",
  advanced: "Продвинутый",
} as const;

const levelColors = {
  beginner: "#00E5C0",
  intermediate: "#8B7DFF",
  advanced: "#FFB020",
} as const;

export default function CoursesPage() {
  const courses = useStore((s) => s.courses);
  const courseProgressPct = useStore((s) => s.courseProgressPct);

  return (
    <AppShell>
      <div className="min-h-screen pb-20 px-4 pt-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl font-bold text-[--text] md:text-5xl">
              Курсы
            </h1>
            <p className="mt-3 text-[--muted]">
              Учись в своём темпе — уроки, квизы и прогресс в одном месте
            </p>
          </motion.div>

          {/* Course cards */}
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          >
            {courses.map((course) => {
              const pct = courseProgressPct(course.id);
              const color = levelColors[course.level];

              return (
                <motion.div
                  key={course.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                  }}
                >
                  <Link
                    href={`/courses/${course.id}`}
                    className="group flex h-full flex-col rounded-2xl border border-[--border] bg-[--surface] p-6 transition-all duration-300 hover:border-[--border-hover]"
                  >
                    {/* Cover + level badge */}
                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[--surface2] text-[--muted]">
                        <BookOpen size={22} />
                      </div>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          color,
                          backgroundColor: `${color}18`,
                        }}
                      >
                        {levelLabels[course.level]}
                      </span>
                    </div>

                    {/* Title & subtitle */}
                    <h2 className="font-display text-lg font-bold leading-snug text-[--text] group-hover:text-white">
                      {course.title}
                    </h2>
                    <p className="mt-1 text-sm text-[--muted]">{course.subtitle}</p>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[--border] px-2 py-0.5 text-xs text-[--muted]"
                        >
                          {tagLabels[tag]}
                        </span>
                      ))}
                    </div>

                    {/* Meta row */}
                    <div className="mt-4 flex items-center gap-3 text-xs text-[--muted]">
                      <span>{course.lessons.length} урок{course.lessons.length !== 1 ? "а" : ""}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-auto pt-5">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-[--muted]">Прогресс</span>
                        <span
                          className="font-semibold"
                          style={{ color: pct > 0 ? color : "var(--muted)" }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
