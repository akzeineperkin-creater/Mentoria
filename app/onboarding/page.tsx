"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Atom, Code2, FlaskConical, Briefcase,
  TrendingUp, Globe, Users, Palette,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStore } from "@/store/useStore";
import { tagLabels } from "@/lib/recommend";
import type { Tag, Grade } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

const TAGS: Tag[] = [
  "stem", "coding", "science", "business",
  "finance", "languages", "social", "arts",
];

const TAG_ICONS: Record<Tag, LucideIcon> = {
  stem:      Atom,
  coding:    Code2,
  science:   FlaskConical,
  business:  Briefcase,
  finance:   TrendingUp,
  languages: Globe,
  social:    Users,
  arts:      Palette,
};

const GRADES: Grade[] = [8, 9, 10, 11];

const GOALS = [
  "Поступить в топовый вуз",
  "Выиграть олимпиаду",
  "Получить стипендию или грант",
  "Найти стажировку",
  "Развить профессиональные навыки",
  "Запустить свой проект",
];

const STEP_LABELS = ["Имя", "Класс", "Интересы", "Цели"];

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setName, setGrade, toggleInterest, toggleGoal, completeOnboarding } = useStore();
  const { isAdmin, loading } = useAuth();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [localName, setLocalName] = useState(profile.name || "");

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace("/admin");
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (profile.onboarded) {
      router.replace("/dashboard");
    }
  }, [profile.onboarded, router]);

  const totalSteps = STEP_LABELS.length;

  const canAdvance = () => {
    if (step === 0) return localName.trim().length >= 2;
    if (step === 1) return profile.grade !== null;
    if (step === 2) return profile.interests.length > 0;
    return true;
  };

  const goNext = () => {
    if (!canAdvance()) return;
    if (step === 0) setName(localName.trim());
    if (step < totalSteps - 1) {
      setDir(1);
      setStep((s) => s + 1);
    } else {
      completeOnboarding();
      router.push("/dashboard");
    }
  };

  const goBack = () => {
    setDir(-1);
    setStep((s) => s - 1);
  };

  return (
    <div className="min-h-screen bg-[--bg] flex flex-col items-center justify-center px-4 py-12">
      {/* Glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[--accent]/[0.06] blur-[120px]" />
      </div>

      {/* Logo */}
      <motion.a
        href="/"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 font-display text-xl font-bold text-[--text]"
      >
        Mentoria<span className="font-normal text-[--muted]"> Hub</span>
      </motion.a>

      {/* Progress bar */}
      <motion.div
        className="mb-8 w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="mb-2 flex gap-1.5">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  i <= step ? "bg-[--accent]" : "bg-white/[0.08]"
                }`}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-[--muted]">
          Шаг {step + 1} из {totalSteps} — {STEP_LABELS[step]}
        </p>
      </motion.div>

      {/* Card */}
      <div className="w-full max-w-md overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="rounded-2xl border border-[--border] bg-[--surface] p-5 sm:p-8"
          >
            {/* Step 0 — Name */}
            {step === 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[--accent]">
                  Добро пожаловать
                </p>
                <h1 className="font-display text-2xl font-bold text-[--text] mb-2">
                  Как тебя зовут?
                </h1>
                <p className="text-sm text-[--muted] mb-7">
                  Мы будем обращаться к тебе по имени
                </p>
                <input
                  autoFocus
                  type="text"
                  placeholder="Твоё имя"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goNext()}
                  className="w-full rounded-xl border border-[--border] bg-[--bg] px-4 py-3 text-[--text] placeholder-[--muted2] outline-none focus:border-[--accent]/60 transition-colors text-sm"
                />
              </div>
            )}

            {/* Step 1 — Grade */}
            {step === 1 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[--accent]">
                  Академический уровень
                </p>
                <h1 className="font-display text-2xl font-bold text-[--text] mb-2">
                  В каком классе ты учишься?
                </h1>
                <p className="text-sm text-[--muted] mb-7">
                  Мы покажем только подходящие возможности
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGrade(g)}
                      className={`rounded-xl border py-5 text-lg font-bold transition-all duration-200 ${
                        profile.grade === g
                          ? "border-[--accent] bg-[--accent]/10 text-[--accent]"
                          : "border-[--border] text-[--muted] hover:border-[--border-hover] hover:text-[--text]"
                      }`}
                    >
                      {g} класс
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Interests */}
            {step === 2 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[--accent]">
                  Интересы
                </p>
                <h1 className="font-display text-2xl font-bold text-[--text] mb-2">
                  Что тебя увлекает?
                </h1>
                <p className="text-sm text-[--muted] mb-7">
                  Выбери одно или несколько направлений
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TAGS.map((tag) => {
                    const active = profile.interests.includes(tag);
                    const Icon = TAG_ICONS[tag];
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleInterest(tag)}
                        className={`flex min-h-[44px] items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          active
                            ? "border-[--accent] bg-[--accent]/10 text-[--accent]"
                            : "border-[--border] text-[--muted] hover:border-[--border-hover] hover:text-[--text]"
                        }`}
                      >
                        <Icon size={15} className="shrink-0" />
                        {tagLabels[tag]}
                        {active && <span className="ml-auto text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3 — Goals */}
            {step === 3 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[--accent]">
                  Цели
                </p>
                <h1 className="font-display text-2xl font-bold text-[--text] mb-2">
                  Чего ты хочешь достичь?
                </h1>
                <p className="text-sm text-[--muted] mb-7">
                  Можно выбрать несколько. Это поможет нам точнее подбирать возможности.
                </p>
                <div className="flex flex-col gap-2">
                  {GOALS.map((goal) => {
                    const active = profile.goals.includes(goal);
                    return (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-medium text-left transition-all duration-200 ${
                          active
                            ? "border-[--accent] bg-[--accent]/10 text-[--accent]"
                            : "border-[--border] text-[--muted] hover:border-[--border-hover] hover:text-[--text]"
                        }`}
                      >
                        <span>{goal}</span>
                        <span
                          className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs transition-all ${
                            active
                              ? "border-[--accent] bg-[--accent] text-[--bg]"
                              : "border-[--border]"
                          }`}
                        >
                          {active && "✓"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <motion.div
        className="mt-6 w-full max-w-md flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {step > 0 ? (
          <button
            onClick={goBack}
            className="text-sm text-[--muted] hover:text-[--text] transition-colors"
          >
            ← Назад
          </button>
        ) : (
          <span />
        )}

        <button
          onClick={goNext}
          disabled={!canAdvance()}
          className={`rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-200 ${
            canAdvance()
              ? "bg-[--accent] text-white hover:opacity-90 active:scale-[0.98]"
              : "bg-white/10 text-[--muted] cursor-not-allowed"
          }`}
        >
          {step === totalSteps - 1 ? "Завершить" : "Далее →"}
        </button>
      </motion.div>

      {step === 3 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { completeOnboarding(); router.push("/dashboard"); }}
          className="mt-4 text-xs text-[--muted] hover:text-[--text] transition-colors"
        >
          Пропустить этот шаг
        </motion.button>
      )}
    </div>
  );
}
