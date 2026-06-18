"use client";
import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
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

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const courses = useStore((s) => s.courses);
  const isLessonDone = useStore((s) => s.isLessonDone);
  const completeLesson = useStore((s) => s.completeLesson);
  const courseProgressPct = useStore((s) => s.courseProgressPct);

  const course = courses.find((c) => c.id === id);

  const [activeLesson, setActiveLesson] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  if (!course) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Search size={48} className="text-[--muted] mb-4" />
            <h1 className="font-display text-2xl font-bold text-[--text]">
              Курс не найден
            </h1>
            <Link
              href="/courses"
              className="mt-6 inline-block rounded-xl border border-[--border] px-5 py-2.5 text-sm text-[--text] hover:border-[--border-hover] transition-colors"
            >
              ← Все курсы
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const lesson = course.lessons[activeLesson];
  const pct = courseProgressPct(course.id);
  const color = levelColors[course.level];
  const done = isLessonDone(course.id, lesson.id);

  const handleMarkDone = () => {
    completeLesson(course.id, lesson.id);
    setQuizAnswer(null);
    if (activeLesson < course.lessons.length - 1) {
      setActiveLesson((v) => v + 1);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen pb-20 px-4 pt-8 md:pt-10">
        <div className="mx-auto max-w-5xl">
          {/* Back + meta */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/courses"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-[--muted] hover:text-[--text] transition-colors"
            >
              ← Все курсы
            </Link>
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[--surface2] text-[--muted]">
                <BookOpen size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ color, backgroundColor: `${color}18` }}
                  >
                    {levelLabels[course.level]}
                  </span>
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[--border] px-2 py-0.5 text-xs text-[--muted]"
                    >
                      {tagLabels[tag]}
                    </span>
                  ))}
                </div>
                <h1 className="font-display text-2xl font-bold text-[--text] md:text-3xl">
                  {course.title}
                </h1>
                <p className="mt-1 text-sm text-[--muted]">{course.description}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-[--muted]">
                <span>Прогресс курса</span>
                <span style={{ color }} className="font-semibold">
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            {/* Lesson sidebar */}
            <aside className="rounded-2xl border border-[--border] bg-[--surface] p-4 h-fit">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[--muted]">
                Уроки
              </p>
              <nav className="flex flex-col gap-1">
                {course.lessons.map((l, i) => {
                  const isDone = isLessonDone(course.id, l.id);
                  const isActive = i === activeLesson;
                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        setActiveLesson(i);
                        setQuizAnswer(null);
                      }}
                      className={`flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                        isActive
                          ? "bg-[--accent]/10 text-[--text] font-medium"
                          : "text-[--muted] hover:bg-white/[0.04] hover:text-[--text]"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                          isDone
                            ? "bg-[#00E5C0]/20 text-[#00E5C0]"
                            : isActive
                            ? "border border-[--accent]/60 text-[--accent]"
                            : "border border-[--border] text-[--muted]"
                        }`}
                      >
                        {isDone ? "✓" : i + 1}
                      </span>
                      <span className="leading-snug">{l.title}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Lesson content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-[--border] bg-[--surface] p-6"
              >
                <h2 className="font-display text-xl font-bold text-[--text] mb-4">
                  {lesson.title}
                </h2>

                {/* YouTube video */}
                {lesson.videoId && (
                  <div className="mb-6 overflow-hidden rounded-xl border border-[--border] bg-black aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${lesson.videoId}?rel=0&modestbranding=1`}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}

                <p className="text-sm leading-relaxed text-[--muted]">
                  {lesson.content}
                </p>

                {/* Quiz */}
                {lesson.quiz && lesson.quiz.length > 0 && (
                  <div className="mt-8 rounded-xl border border-[--border] bg-[--bg] p-5">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[--muted]">
                      Вопрос
                    </p>
                    <p className="mb-4 text-sm font-medium text-[--text]">
                      {lesson.quiz[0].question}
                    </p>
                    <div className="flex flex-col gap-2">
                      {lesson.quiz[0].options.map((opt, i) => {
                        const isCorrect = i === lesson.quiz![0].correct;
                        const isSelected = quizAnswer === i;
                        const answered = quizAnswer !== null;
                        return (
                          <button
                            key={i}
                            disabled={answered}
                            onClick={() => setQuizAnswer(i)}
                            className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                              !answered
                                ? "border-[--border] text-[--muted] hover:border-[--border-hover] hover:bg-[--surface2]"
                                : isSelected && isCorrect
                                ? "border-[#00E5C0]/50 bg-[#00E5C0]/10 text-[#00E5C0]"
                                : isSelected && !isCorrect
                                ? "border-red-500/40 bg-red-500/10 text-red-400"
                                : isCorrect
                                ? "border-[#00E5C0]/30 text-[#00E5C0]/60"
                                : "border-[--border] text-[--muted2]"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizAnswer !== null && (
                      <p
                        className={`mt-3 text-xs font-medium ${
                          quizAnswer === lesson.quiz![0].correct
                            ? "text-[#00E5C0]"
                            : "text-red-400"
                        }`}
                      >
                        {quizAnswer === lesson.quiz![0].correct
                          ? "Верно! Отличная работа 🎉"
                          : "Не совсем. Правильный ответ выделен выше."}
                      </p>
                    )}
                  </div>
                )}

                {/* Done button */}
                <div className="mt-6 flex items-center gap-4">
                  {done ? (
                    <span className="flex items-center gap-2 text-sm font-medium text-[#00E5C0]">
                      <span>✓</span> Урок завершён
                    </span>
                  ) : (
                    <button
                      onClick={handleMarkDone}
                      className="min-h-[44px] rounded-xl bg-[--accent] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                      {activeLesson < course.lessons.length - 1
                        ? "Завершить и перейти дальше →"
                        : "Завершить урок ✓"}
                    </button>
                  )}
                  <span className="text-xs text-[--muted]">
                    {activeLesson + 1} / {course.lessons.length}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
