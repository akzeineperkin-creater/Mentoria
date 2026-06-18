"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { categoryLabels, formatLabels, tagLabels, deadlineLabel } from "@/lib/recommend";
import type {
  Opportunity,
  Course,
  OpportunityCategory,
  Format,
  Grade,
  Tag,
  Lesson,
} from "@/lib/types";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import {
  Users, BookOpen, Trophy, TrendingUp,
  BarChart2, Activity,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────
const ALL_TAGS: Tag[] = ["business", "stem", "coding", "science", "finance", "social", "languages", "arts"];
const ALL_GRADES: Grade[] = [8, 9, 10, 11];
const ALL_CATS: OpportunityCategory[] = ["competition", "olympiad", "scholarship", "internship", "course", "event"];
const ALL_FMTS: Format[] = ["online", "offline", "hybrid"];

// ─── Form types ────────────────────────────────────────────────
type OpForm = {
  title: string; organizer: string; category: OpportunityCategory;
  format: Format; description: string; deadline: string;
  grades: Grade[]; tags: Tag[]; prize: string; city: string; link: string;
  linkInstagram: string; linkTelegram: string; linkGithub: string; linkX: string;
};

const EMPTY_OP: OpForm = {
  title: "", organizer: "", category: "competition", format: "online",
  description: "", deadline: "", grades: [], tags: [], prize: "", city: "", link: "",
  linkInstagram: "", linkTelegram: "", linkGithub: "", linkX: "",
};

type LessonDraft = { title: string; content: string };
type CourseForm = {
  title: string; subtitle: string; description: string;
  level: "beginner" | "intermediate" | "advanced";
  cover: string; tags: Tag[]; lessons: LessonDraft[];
};

const EMPTY_COURSE: CourseForm = {
  title: "", subtitle: "", description: "", level: "beginner",
  cover: "📚", tags: [], lessons: [{ title: "", content: "" }],
};

// ─── Shared input styles ────────────────────────────────────────
const inp =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#6D5EF7]/60 transition-colors placeholder-[var(--muted)]";
const labelCls = "mb-1.5 block text-xs font-medium text-[var(--muted)]";

// ─── Mock analytics data ────────────────────────────────────────
const MOCK_STUDENTS = [
  { name: "Алия М.", grade: 10, course: "Английский для академического успеха", pct: 100, saved: 4 },
  { name: "Данияр К.", grade: 11, course: "Основы математического мышления", pct: 67, saved: 2 },
  { name: "Айгерим Б.", grade: 9, course: "Введение в веб-разработку", pct: 33, saved: 6 },
  { name: "Нурлан Т.", grade: 10, course: "Английский для академического успеха", pct: 67, saved: 3 },
  { name: "Зарина Е.", grade: 11, course: "Основы математического мышления", pct: 100, saved: 5 },
  { name: "Санжар О.", grade: 8, course: "Введение в веб-разработку", pct: 33, saved: 1 },
  { name: "Мадина Р.", grade: 10, course: "Английский для академического успеха", pct: 100, saved: 7 },
  { name: "Аслан Ж.", grade: 11, course: "Основы математического мышления", pct: 33, saved: 2 },
];

const DAILY_ACTIVITY = [
  { day: "Пн", sessions: 12 },
  { day: "Вт", sessions: 18 },
  { day: "Ср", sessions: 14 },
  { day: "Чт", sessions: 22 },
  { day: "Пт", sessions: 17 },
  { day: "Сб", sessions: 8 },
  { day: "Вс", sessions: 5 },
];

// ─── Sub-components ─────────────────────────────────────────────
function TagPicker({ selected, onChange, accent = "#00E5C0" }: {
  selected: Tag[]; onChange: (t: Tag[]) => void; accent?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_TAGS.map((tag) => {
        const on = selected.includes(tag);
        return (
          <button key={tag} type="button"
            onClick={() => onChange(on ? selected.filter((t) => t !== tag) : [...selected, tag])}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
            style={on ? { borderColor: accent, color: accent, backgroundColor: `${accent}15` } : {}}
          >
            {tagLabels[tag]}
          </button>
        );
      })}
    </div>
  );
}

function GradePicker({ selected, onChange }: { selected: Grade[]; onChange: (g: Grade[]) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ALL_GRADES.map((g) => {
        const on = selected.includes(g);
        return (
          <button key={g} type="button"
            onClick={() => onChange(on ? selected.filter((x) => x !== g) : [...selected, g])}
            className={`rounded-lg border px-4 py-2 text-sm font-bold transition-all ${
              on ? "border-[#6D5EF7] bg-[#6D5EF7]/15 text-[#6D5EF7]"
                 : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-hover)]"
            }`}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}

// ─── Opportunity form (shared for add + edit) ───────────────────
function OpportunityForm({
  initial, onSubmit, onCancel, submitLabel,
}: {
  initial: OpForm;
  onSubmit: (f: OpForm) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<OpForm>(initial);
  const valid = form.title.trim() && form.organizer.trim() && form.deadline && form.grades.length > 0;

  return (
    <div className="rounded-2xl border border-[#6D5EF7]/30 bg-[var(--surface)] p-6">
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className={labelCls}>Название *</p>
            <input className={inp} placeholder="Название возможности"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Организатор *</p>
            <input className={inp} placeholder="Организатор"
              value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className={labelCls}>Категория</p>
            <select className={inp} value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as OpportunityCategory })}>
              {ALL_CATS.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
            </select>
          </div>
          <div>
            <p className={labelCls}>Формат</p>
            <select className={inp} value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value as Format })}>
              {ALL_FMTS.map((f) => <option key={f} value={f}>{formatLabels[f]}</option>)}
            </select>
          </div>
        </div>
        <div>
          <p className={labelCls}>Описание</p>
          <textarea className={`${inp} resize-none`} rows={3} placeholder="Краткое описание..."
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className={labelCls}>Дедлайн *</p>
            <input type="date" className={inp}
              value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Приз / Стипендия</p>
            <input className={inp} placeholder="Необязательно"
              value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Город</p>
            <input className={inp} placeholder="Необязательно"
              value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
        </div>
        <div>
          <p className={labelCls}>Ссылка для подачи заявки</p>
          <input className={inp} placeholder="https://..."
            value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        </div>
        <div>
          <p className={`${labelCls} mb-3`}>Ссылки на источники <span className="font-normal text-[var(--muted2)]">(необязательно)</span></p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["linkInstagram", "linkTelegram", "linkGithub", "linkX"] as const).map((key) => {
              const labels = { linkInstagram: "Instagram", linkTelegram: "Telegram", linkGithub: "GitHub", linkX: "X (Twitter)" };
              const placeholders = { linkInstagram: "https://instagram.com/...", linkTelegram: "https://t.me/...", linkGithub: "https://github.com/...", linkX: "https://x.com/..." };
              return (
                <div key={key}>
                  <p className={labelCls}>{labels[key]}</p>
                  <input className={inp} placeholder={placeholders[key]}
                    value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                  {form[key] && !form[key].startsWith("http") && (
                    <p className="mt-1 text-xs text-[#FFB020]">URL должен начинаться с https://</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <p className={`${labelCls} mb-2`}>Классы *</p>
          <GradePicker selected={form.grades} onChange={(g) => setForm({ ...form, grades: g })} />
        </div>
        <div>
          <p className={`${labelCls} mb-2`}>Теги</p>
          <TagPicker selected={form.tags} onChange={(t) => setForm({ ...form, tags: t })} />
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
          <button onClick={onCancel}
            className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            Отмена
          </button>
          <button onClick={() => valid && onSubmit(form)} disabled={!valid}
            className="rounded-xl bg-gradient-to-r from-[#6D5EF7] to-[#00E5C0] px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Course form (shared for add + edit) ────────────────────────
function CourseFormPanel({
  initial, onSubmit, onCancel, submitLabel,
}: {
  initial: CourseForm;
  onSubmit: (f: CourseForm) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<CourseForm>(initial);
  const valid = form.title.trim() && form.subtitle.trim() && form.lessons[0]?.title.trim();

  return (
    <div className="rounded-2xl border border-[#6D5EF7]/30 bg-[var(--surface)] p-6">
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className={labelCls}>Название *</p>
            <input className={inp} placeholder="Название курса"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Подзаголовок *</p>
            <input className={inp} placeholder="Краткий подзаголовок"
              value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
        </div>
        <div>
          <p className={labelCls}>Описание</p>
          <textarea className={`${inp} resize-none`} rows={2} placeholder="Подробнее о курсе..."
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className={labelCls}>Уровень</p>
            <select className={inp} value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value as CourseForm["level"] })}>
              <option value="beginner">Начальный</option>
              <option value="intermediate">Средний</option>
              <option value="advanced">Продвинутый</option>
            </select>
          </div>
          <div>
            <p className={labelCls}>Обложка (эмодзи)</p>
            <input className={inp} placeholder="📚"
              value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} />
          </div>
        </div>
        <div>
          <p className={`${labelCls} mb-2`}>Теги</p>
          <TagPicker selected={form.tags} onChange={(t) => setForm({ ...form, tags: t })} accent="#00E5C0" />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className={labelCls}>Уроки *</p>
            <button type="button"
              onClick={() => setForm({ ...form, lessons: [...form.lessons, { title: "", content: "" }] })}
              className="text-xs text-[#6D5EF7] hover:underline">
              + Добавить урок
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {form.lessons.map((lesson, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6D5EF7]">Урок {i + 1}</span>
                  {form.lessons.length > 1 && (
                    <button type="button"
                      onClick={() => setForm({ ...form, lessons: form.lessons.filter((_, j) => j !== i) })}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors">
                      Удалить урок
                    </button>
                  )}
                </div>
                <input className={`${inp} mb-2`} placeholder="Название урока"
                  value={lesson.title}
                  onChange={(e) => {
                    const ls = [...form.lessons]; ls[i] = { ...ls[i], title: e.target.value };
                    setForm({ ...form, lessons: ls });
                  }} />
                <textarea className={`${inp} resize-none`} rows={3} placeholder="Текст урока..."
                  value={lesson.content}
                  onChange={(e) => {
                    const ls = [...form.lessons]; ls[i] = { ...ls[i], content: e.target.value };
                    setForm({ ...form, lessons: ls });
                  }} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
          <button onClick={onCancel}
            className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            Отмена
          </button>
          <button onClick={() => valid && onSubmit(form)} disabled={!valid}
            className="rounded-xl bg-gradient-to-r from-[#6D5EF7] to-[#00E5C0] px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics tab ──────────────────────────────────────────────
function AnalyticsTab({ opportunities, courses }: { opportunities: Opportunity[]; courses: Course[] }) {
  const maxSessions = Math.max(...DAILY_ACTIVITY.map((d) => d.sessions));

  const courseStats = courses.map((c) => {
    const enrolled = MOCK_STUDENTS.filter((s) => s.course === c.title).length;
    const avgPct = enrolled > 0
      ? Math.round(MOCK_STUDENTS.filter((s) => s.course === c.title).reduce((a, s) => a + s.pct, 0) / enrolled)
      : 0;
    return { title: c.title, cover: c.cover, enrolled, avgPct };
  });

  const totalCompleted = MOCK_STUDENTS.filter((s) => s.pct === 100).length;
  const avgCompletion = Math.round(MOCK_STUDENTS.reduce((a, s) => a + s.pct, 0) / MOCK_STUDENTS.length);

  const statCards = [
    { icon: Users, label: "Учеников", value: "47", sub: "+5 на этой неделе", color: "#6D5EF7" },
    { icon: BookOpen, label: "Курсов", value: String(courses.length), sub: `${totalCompleted} завершений`, color: "#00E5C0" },
    { icon: Trophy, label: "Возможностей", value: String(opportunities.length), sub: "в каталоге", color: "#FFB020" },
    { icon: TrendingUp, label: "Средний прогресс", value: `${avgCompletion}%`, sub: "по всем курсам", color: "#FF6B6B" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}18` }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--text)]">{value}</p>
            <p className="mt-0.5 text-xs text-[var(--muted2)]">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weekly activity chart */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={14} className="text-[#6D5EF7]" />
            <p className="text-sm font-semibold text-[var(--text)]">Активность за неделю</p>
          </div>
          <div className="flex items-end gap-2 h-28">
            {DAILY_ACTIVITY.map(({ day, sessions }) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-[var(--muted)]">{sessions}</span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${(sessions / maxSessions) * 80}px`,
                    background: "linear-gradient(to top, #6D5EF7, #00E5C0)",
                    opacity: 0.85,
                  }}
                />
                <span className="text-[10px] text-[var(--muted2)]">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Course enrollments */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart2 size={14} className="text-[#00E5C0]" />
            <p className="text-sm font-semibold text-[var(--text)]">Курсы по записям</p>
          </div>
          <div className="flex flex-col gap-3">
            {courseStats.map(({ title, cover, enrolled, avgPct }) => (
              <div key={title}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-base">{cover}</span>
                    <p className="truncate text-xs font-medium text-[var(--text)]">{title}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-xs text-[var(--muted)]">{enrolled} учеников</span>
                    <span className="text-xs font-medium text-[#00E5C0]">{avgPct}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#6D5EF7] to-[#00E5C0]"
                    style={{ width: `${avgPct}%` }} />
                </div>
              </div>
            ))}
            {courseStats.length === 0 && (
              <p className="text-sm text-[var(--muted)]">Нет данных о курсах</p>
            )}
          </div>
        </div>
      </div>

      {/* Students table */}
      <div className="rounded-2xl border border-[var(--border)] overflow-x-auto">
        <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--text)]">Ученики</p>
          <p className="text-xs text-[var(--muted)]">{MOCK_STUDENTS.length} активных пользователей (тестовые данные)</p>
        </div>
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Ученик</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Класс</th>
              <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Текущий курс</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Прогресс</th>
              <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Сохранено</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_STUDENTS.map((s, i) => (
              <tr key={i} className={`border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-hover)] ${i % 2 === 0 ? "bg-[var(--bg)]" : "bg-[var(--surface2)]"}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6D5EF7]/15 text-[11px] font-bold text-[#6D5EF7]">
                      {s.name[0]}
                    </div>
                    <span className="font-medium text-[var(--text)]">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--muted)]">{s.grade} кл.</td>
                <td className="hidden sm:table-cell px-4 py-3">
                  <span className="truncate text-xs text-[var(--muted)]">{s.course}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--border)]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6D5EF7] to-[#00E5C0]"
                        style={{ width: `${s.pct}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${s.pct === 100 ? "text-[#00E5C0]" : "text-[var(--muted)]"}`}>
                      {s.pct}%
                    </span>
                  </div>
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-right text-xs text-[var(--muted)]">{s.saved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────
export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      window.location.replace("/dashboard");
    }
  }, [loading, user, isAdmin]);

  type Tab = "opportunities" | "courses" | "analytics";
  const [tab, setTab] = useState<Tab>("opportunities");

  // Opportunity state
  const [showOpForm, setShowOpForm] = useState(false);
  const [editingOp, setEditingOp] = useState<Opportunity | null>(null);
  const [opSaved, setOpSaved] = useState<string | null>(null);

  // Course state
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseSaved, setCourseSaved] = useState<string | null>(null);

  const opportunities    = useStore((s) => s.opportunities);
  const courses          = useStore((s) => s.courses);
  const addOpportunity   = useStore((s) => s.addOpportunity);
  const updateOpportunity = useStore((s) => s.updateOpportunity);
  const deleteOpportunity = useStore((s) => s.deleteOpportunity);
  const addCourse        = useStore((s) => s.addCourse);
  const deleteCourse     = useStore((s) => s.deleteCourse);

  const toast = (msg: string) => {
    setOpSaved(msg);
    setTimeout(() => setOpSaved(null), 2500);
  };

  const courseToast = (msg: string) => {
    setCourseSaved(msg);
    setTimeout(() => setCourseSaved(null), 2500);
  };

  if (loading || !isAdmin) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8B7DFF] border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  // ── Opportunity handlers ──────────────────────────────────────
  const handleAddOp = (f: OpForm) => {
    const rawLinks = {
      instagram: f.linkInstagram.trim(),
      telegram:  f.linkTelegram.trim(),
      github:    f.linkGithub.trim(),
      x:         f.linkX.trim(),
    };
    const filledLinks = Object.fromEntries(Object.entries(rawLinks).filter(([, v]) => v !== "")) as NonNullable<Opportunity["links"]>;
    addOpportunity({
      id: `op-${Date.now()}`,
      title: f.title.trim(), organizer: f.organizer.trim(),
      category: f.category, format: f.format,
      description: f.description.trim(), deadline: f.deadline,
      grades: f.grades, tags: f.tags,
      prize: f.prize.trim() || undefined,
      city: f.city.trim() || undefined,
      link: f.link.trim() || "#",
      links: Object.keys(filledLinks).length > 0 ? filledLinks : undefined,
    } as Opportunity);
    setShowOpForm(false);
    toast("Возможность добавлена");
  };

  const handleEditOp = (f: OpForm) => {
    if (!editingOp) return;
    const rawLinks = {
      instagram: f.linkInstagram.trim(),
      telegram:  f.linkTelegram.trim(),
      github:    f.linkGithub.trim(),
      x:         f.linkX.trim(),
    };
    const filledLinks = Object.fromEntries(Object.entries(rawLinks).filter(([, v]) => v !== "")) as NonNullable<Opportunity["links"]>;
    updateOpportunity({
      ...editingOp,
      title: f.title.trim(), organizer: f.organizer.trim(),
      category: f.category, format: f.format,
      description: f.description.trim(), deadline: f.deadline,
      grades: f.grades, tags: f.tags,
      prize: f.prize.trim() || undefined,
      city: f.city.trim() || undefined,
      link: f.link.trim() || "#",
      links: Object.keys(filledLinks).length > 0 ? filledLinks : undefined,
    } as Opportunity);
    setEditingOp(null);
    toast("Возможность обновлена");
  };

  const opToForm = (op: Opportunity): OpForm => ({
    title: op.title, organizer: op.organizer,
    category: op.category, format: op.format,
    description: op.description ?? "", deadline: op.deadline,
    grades: op.grades, tags: op.tags,
    prize: op.prize ?? "", city: op.city ?? "", link: op.link ?? "",
    linkInstagram: op.links?.instagram ?? "",
    linkTelegram:  op.links?.telegram ?? "",
    linkGithub:    op.links?.github ?? "",
    linkX:         op.links?.x ?? "",
  });

  // ── Course handlers ───────────────────────────────────────────
  const handleAddCourse = (f: CourseForm) => {
    const builtLessons: Lesson[] = f.lessons.filter((l) => l.title.trim()).map((l, i) => ({
      id: `l-${Date.now()}-${i}`, title: l.title.trim(), content: l.content.trim(), videoId: null,
    }));
    addCourse({
      id: `c-${Date.now()}`,
      title: f.title.trim(), subtitle: f.subtitle.trim(), description: f.description.trim(),
      level: f.level, cover: f.cover.trim() || "📚", tags: f.tags, lessons: builtLessons,
    } as Course);
    setShowCourseForm(false);
    courseToast("Курс опубликован");
  };

  const courseToForm = (c: Course): CourseForm => ({
    title: c.title, subtitle: c.subtitle, description: c.description ?? "",
    level: c.level, cover: c.cover, tags: c.tags,
    lessons: c.lessons.map((l) => ({ title: l.title, content: l.content })),
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: "opportunities", label: "Возможности" },
    { key: "courses", label: "Курсы" },
    { key: "analytics", label: "Аналитика" },
  ];

  return (
    <AppShell>
      <div className="min-h-screen pb-20 px-4 pt-10">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <motion.div className="mb-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-[var(--text)]">Панель администратора</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {opportunities.length} возможностей · {courses.length} курсов · 47 учеников
            </p>
          </motion.div>

          {/* Toast */}
          <AnimatePresence>
            {(opSaved || courseSaved) && (
              <motion.div
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="mb-4 flex items-center gap-2 rounded-xl border border-[#00E5C0]/30 bg-[#00E5C0]/10 px-4 py-3 text-sm font-medium text-[#00E5C0]"
              >
                <span>✓</span> {opSaved ?? courseSaved}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 w-fit rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`min-h-[44px] rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                  tab === key ? "bg-[#6D5EF7] text-white shadow-lg shadow-[#6D5EF7]/20" : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* ══════════ OPPORTUNITIES ══════════ */}
          {tab === "opportunities" && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--muted)]">{opportunities.length} записей</p>
                <button onClick={() => { setShowOpForm((v) => !v); setEditingOp(null); }}
                  className="min-h-[44px] rounded-xl bg-gradient-to-r from-[#6D5EF7] to-[#00E5C0] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90">
                  {showOpForm ? "✕ Отменить" : "+ Добавить возможность"}
                </button>
              </div>

              <AnimatePresence>
                {showOpForm && !editingOp && (
                  <motion.div key="op-add" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                    <div className="mb-3">
                      <h3 className="font-display text-lg font-bold text-[var(--text)]">Новая возможность</h3>
                    </div>
                    <OpportunityForm initial={EMPTY_OP} onSubmit={handleAddOp}
                      onCancel={() => setShowOpForm(false)} submitLabel="Добавить возможность" />
                  </motion.div>
                )}
                {editingOp && (
                  <motion.div key="op-edit" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                    <div className="mb-3">
                      <h3 className="font-display text-lg font-bold text-[var(--text)]">Редактировать: {editingOp.title}</h3>
                    </div>
                    <OpportunityForm initial={opToForm(editingOp)} onSubmit={handleEditOp}
                      onCancel={() => setEditingOp(null)} submitLabel="Сохранить изменения" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="rounded-2xl border border-[var(--border)] overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Название</th>
                      <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Категория</th>
                      <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Классы</th>
                      <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Дедлайн</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opportunities.map((op, i) => (
                      <tr key={op.id} className={`border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-hover)] ${i % 2 === 0 ? "bg-[var(--bg)]" : "bg-[var(--surface2)]"}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--text)]">{op.title}</p>
                          <p className="text-xs text-[var(--muted)]">{op.organizer}</p>
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3">
                          <span className="rounded-full bg-[#6D5EF7]/15 px-2.5 py-0.5 text-xs text-[#6D5EF7]">
                            {categoryLabels[op.category]}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 text-xs text-[var(--muted)]">{op.grades.join(", ")}</td>
                        <td className="hidden lg:table-cell px-4 py-3 text-xs text-[var(--muted)]">{deadlineLabel(op.deadline)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditingOp(op); setShowOpForm(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                              className="rounded-lg border border-[#6D5EF7]/20 px-3 py-1 text-xs text-[#6D5EF7] transition-all hover:border-[#6D5EF7]/40 hover:bg-[#6D5EF7]/10"
                            >
                              Изменить
                            </button>
                            <button
                              onClick={() => { if (confirm(`Удалить «${op.title}»?`)) deleteOpportunity(op.id); }}
                              className="rounded-lg border border-red-500/20 px-3 py-1 text-xs text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/10"
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {opportunities.length === 0 && (
                  <p className="py-10 text-center text-sm text-[var(--muted)]">Возможностей пока нет</p>
                )}
              </div>
            </div>
          )}

          {/* ══════════ COURSES ══════════ */}
          {tab === "courses" && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--muted)]">{courses.length} курсов</p>
                <button onClick={() => { setShowCourseForm((v) => !v); setEditingCourse(null); }}
                  className="min-h-[44px] rounded-xl bg-gradient-to-r from-[#6D5EF7] to-[#00E5C0] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90">
                  {showCourseForm ? "✕ Отменить" : "+ Добавить курс"}
                </button>
              </div>

              <AnimatePresence>
                {showCourseForm && !editingCourse && (
                  <motion.div key="course-add" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                    <div className="mb-3">
                      <h3 className="font-display text-lg font-bold text-[var(--text)]">Новый курс</h3>
                    </div>
                    <CourseFormPanel initial={EMPTY_COURSE} onSubmit={handleAddCourse}
                      onCancel={() => setShowCourseForm(false)} submitLabel="Опубликовать курс" />
                  </motion.div>
                )}
                {editingCourse && (
                  <motion.div key="course-edit" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                    <div className="mb-3">
                      <h3 className="font-display text-lg font-bold text-[var(--text)]">Редактировать: {editingCourse.title}</h3>
                    </div>
                    <CourseFormPanel
                      initial={courseToForm(editingCourse)}
                      onSubmit={(f) => {
                        const builtLessons: Lesson[] = f.lessons.filter((l) => l.title.trim()).map((l, i) => ({
                          id: `l-${Date.now()}-${i}`, title: l.title.trim(), content: l.content.trim(), videoId: null,
                        }));
                        deleteCourse(editingCourse.id);
                        addCourse({
                          ...editingCourse,
                          title: f.title.trim(), subtitle: f.subtitle.trim(), description: f.description.trim(),
                          level: f.level, cover: f.cover.trim() || "📚", tags: f.tags, lessons: builtLessons,
                        } as Course);
                        setEditingCourse(null);
                        courseToast("Курс обновлён");
                      }}
                      onCancel={() => setEditingCourse(null)}
                      submitLabel="Сохранить изменения"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="rounded-2xl border border-[var(--border)] overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Курс</th>
                      <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Уровень</th>
                      <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Уроков</th>
                      <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Теги</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c, i) => (
                      <tr key={c.id} className={`border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-hover)] ${i % 2 === 0 ? "bg-[var(--bg)]" : "bg-[var(--surface2)]"}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{c.cover}</span>
                            <div>
                              <p className="font-medium text-[var(--text)]">{c.title}</p>
                              <p className="text-xs text-[var(--muted)]">{c.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3 text-xs text-[var(--muted)] capitalize">
                          {c.level === "beginner" ? "Начальный" : c.level === "intermediate" ? "Средний" : "Продвинутый"}
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 text-xs text-[var(--muted)]">{c.lessons.length}</td>
                        <td className="hidden md:table-cell px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.tags.slice(0, 2).map((t) => (
                              <span key={t} className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{tagLabels[t]}</span>
                            ))}
                            {c.tags.length > 2 && <span className="text-xs text-[var(--muted)]">+{c.tags.length - 2}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditingCourse(c); setShowCourseForm(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                              className="rounded-lg border border-[#6D5EF7]/20 px-3 py-1 text-xs text-[#6D5EF7] transition-all hover:border-[#6D5EF7]/40 hover:bg-[#6D5EF7]/10"
                            >
                              Изменить
                            </button>
                            <button
                              onClick={() => { if (confirm(`Удалить курс «${c.title}»?`)) deleteCourse(c.id); }}
                              className="rounded-lg border border-red-500/20 px-3 py-1 text-xs text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/10"
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {courses.length === 0 && (
                  <p className="py-10 text-center text-sm text-[var(--muted)]">Курсов пока нет</p>
                )}
              </div>
            </div>
          )}

          {/* ══════════ ANALYTICS ══════════ */}
          {tab === "analytics" && (
            <AnalyticsTab opportunities={opportunities} courses={courses} />
          )}

        </div>
      </div>
    </AppShell>
  );
}
