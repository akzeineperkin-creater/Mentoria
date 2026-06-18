import type { Opportunity, Course, Tag, UserProfile } from "@/lib/types";

// ─── Рекомендации ────────────────────────────────────────────
// Простая честная логика из брифа: считаем пересечение тегов
// профиля с тегами возможности/курса. Чем больше совпадений —
// тем выше в выдаче. Никакого ML не требуется.

function scoreByTags(itemTags: Tag[], interests: Tag[]): number {
  return itemTags.filter((t) => interests.includes(t)).length;
}

/** Возвращает возможности, отсортированные по релевантности профилю. */
export function recommendOpportunities(
  items: Opportunity[],
  profile: UserProfile
): Opportunity[] {
  if (!profile.onboarded || profile.interests.length === 0) {
    return [...items].sort(
      (a, b) => +new Date(a.deadline) - +new Date(b.deadline)
    );
  }
  return [...items]
    .map((op) => ({
      op,
      score:
        scoreByTags(op.tags, profile.interests) +
        // лёгкий бонус, если возможность подходит по классу
        (profile.grade && op.grades.includes(profile.grade) ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.op);
}

/** Топ-N рекомендованных возможностей (для блока «Рекомендовано тебе»). */
export function topRecommendations(
  items: Opportunity[],
  profile: UserProfile,
  n = 3
): Opportunity[] {
  if (!profile.onboarded || profile.interests.length === 0) return [];
  return recommendOpportunities(items, profile)
    .filter((op) => scoreByTags(op.tags, profile.interests) > 0)
    .slice(0, n);
}

/** Рекомендованные курсы по тем же тегам. */
export function recommendCourses(
  items: Course[],
  profile: UserProfile
): Course[] {
  if (!profile.onboarded) return items;
  return [...items].sort(
    (a, b) =>
      scoreByTags(b.tags, profile.interests) -
      scoreByTags(a.tags, profile.interests)
  );
}

// ─── Фильтры каталога ────────────────────────────────────────

export interface OpportunityFilters {
  category?: string;
  grade?: number;
  format?: string;
  search?: string;
}

export function filterOpportunities(
  items: Opportunity[],
  f: OpportunityFilters
): Opportunity[] {
  return items.filter((op) => {
    if (f.category && f.category !== "all" && op.category !== f.category)
      return false;
    if (f.format && f.format !== "all" && op.format !== f.format) return false;
    if (f.grade && !op.grades.includes(f.grade as any)) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      const hay = `${op.title} ${op.organizer} ${op.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ─── Дедлайны ────────────────────────────────────────────────

export function daysLeft(deadline: string): number {
  const ms = +new Date(deadline) - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function deadlineLabel(deadline: string): string {
  const d = daysLeft(deadline);
  if (d < 0) return "Завершено";
  if (d === 0) return "Сегодня последний день";
  if (d === 1) return "Остался 1 день";
  if (d < 5) return `Осталось ${d} дня`;
  if (d < 30) return `Осталось ${d} дней`;
  return new Date(deadline).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

// ─── Лейблы для UI ───────────────────────────────────────────

export const categoryLabels: Record<string, string> = {
  competition: "Конкурс",
  olympiad: "Олимпиада",
  scholarship: "Стипендия",
  internship: "Стажировка",
  course: "Курс",
  event: "Мероприятие",
};

export const formatLabels: Record<string, string> = {
  online: "Онлайн",
  offline: "Офлайн",
  hybrid: "Гибрид",
};

export const tagLabels: Record<Tag, string> = {
  business: "Бизнес",
  stem: "STEM",
  coding: "Программирование",
  science: "Наука",
  finance: "Финансы",
  social: "Общество",
  languages: "Языки",
  arts: "Искусство",
};
