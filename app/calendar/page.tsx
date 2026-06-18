"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import TelegramReminderButton from "@/components/TelegramReminderButton";
import { DaysLeftBadge } from "@/components/DaysLeftBadge";
import { useStore } from "@/store/useStore";
import { deadlineLabel, daysLeft } from "@/lib/recommend";
import { Calendar, CalendarDays } from "lucide-react";

export default function CalendarPage() {
  const { savedIds, opportunities } = useStore();

  const saved = opportunities
    .filter((op) => savedIds.includes(op.id))
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));

  const upcoming = saved.filter((op) => daysLeft(op.deadline) >= 0);
  const past = saved.filter((op) => daysLeft(op.deadline) < 0);

  return (
    <AppShell>
      <div className="min-h-screen pb-24 pt-8 px-4 md:pt-10 md:px-[6vw]">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-1">
              <CalendarDays size={22} className="text-[--accent]" />
              <h1 className="font-display text-2xl font-bold text-[--text] tracking-[-0.02em]">
                Календарь дедлайнов
              </h1>
            </div>
            <p className="text-sm text-[--muted]">Избранные возможности, отсортированные по дедлайну</p>
          </motion.div>

          {saved.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-2xl border border-[--border] bg-[--surface] p-10 text-center"
            >
              <Calendar size={36} className="text-[--muted] mb-4" />
              <p className="text-[--text] font-medium mb-1">Избранное пусто</p>
              <p className="text-sm text-[--muted] mb-6">
                Добавь возможности в избранное, чтобы следить за дедлайнами
              </p>
              <Link
                href="/catalog"
                className="inline-block rounded-xl bg-[--accent] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Перейти к возможностям
              </Link>
            </motion.div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="mb-8"
                >
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[--muted]">
                    Предстоящие
                  </h2>
                  <div className="space-y-3">
                    {upcoming.map((op, i) => (
                      <motion.div
                        key={op.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 + i * 0.04 }}
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
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {past.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="mb-8 opacity-50"
                >
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[--muted]">
                    Завершённые
                  </h2>
                  <div className="space-y-3">
                    {past.map((op) => (
                      <div
                        key={op.id}
                        className="flex items-start justify-between gap-4 rounded-2xl border border-[--border] bg-[--surface] p-5"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-[--text] truncate line-through">{op.title}</p>
                          <p className="text-sm text-[--muted] mt-0.5">{op.organizer}</p>
                          <p className="text-xs text-[--muted2] mt-2">Завершено</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="pt-2"
              >
                <TelegramReminderButton />
              </motion.div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
