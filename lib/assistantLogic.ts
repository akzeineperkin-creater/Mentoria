import type {
  Opportunity,
  Course,
  UserProfile,
  Tag,
  OpportunityCategory,
} from "@/lib/types";
import { topRecommendations, recommendCourses } from "@/lib/recommend";

export interface AssistantContext {
  opportunities: Opportunity[];
  courses: Course[];
  profile: UserProfile;
}

export interface AssistantResponse {
  text: string;
  opportunities: Opportunity[];
  courses: Course[];
}

// Keyword patterns → tags
const KEYWORD_TAG_MAP: Array<[RegExp, Tag[]]> = [
  [/мед|биолог|врач|медицин|здоровь/i, ["science", "stem"]],
  [/прог|код|it\b|информатик|разраб|хакатон|веб\b|web\b/i, ["coding", "stem"]],
  [/бизнес|стартап|предприним|компани/i, ["business", "finance"]],
  [/математик|физик|химия|задач/i, ["stem", "science"]],
  [/финанс|инвест|экономик|деньг|банк/i, ["finance"]],
  [/язык|английск|немецк|french|франц/i, ["languages"]],
  [/искусств|дизайн|рисов|арт\b|творч/i, ["arts"]],
  [/общество|соц\b|дебат|полит/i, ["social"]],
  [/поступлен|универ|вуз\b|университет/i, ["languages", "social", "science"]],
  [/наук|исследован|природ/i, ["science", "stem"]],
];

// Keyword patterns → opportunity categories
const KEYWORD_CATEGORY_MAP: Array<[RegExp, OpportunityCategory]> = [
  [/олимпиад/i, "olympiad"],
  [/стипенд|грант/i, "scholarship"],
  [/стажировк/i, "internship"],
  [/конкурс/i, "competition"],
  [/мероприяти/i, "event"],
];

function extractTags(message: string): Tag[] {
  const tags = new Set<Tag>();
  for (const [pattern, mappedTags] of KEYWORD_TAG_MAP) {
    if (pattern.test(message)) {
      mappedTags.forEach((t) => tags.add(t));
    }
  }
  return Array.from(tags);
}

function extractCategory(message: string): OpportunityCategory | null {
  for (const [pattern, category] of KEYWORD_CATEGORY_MAP) {
    if (pattern.test(message)) return category;
  }
  return null;
}

function countTagMatches(itemTags: Tag[], queryTags: Tag[]): number {
  return itemTags.filter((t) => queryTags.includes(t)).length;
}

function buildResponseText(
  message: string,
  ops: Opportunity[],
  courses: Course[]
): string {
  const total = ops.length + courses.length;
  const hasCourses = courses.length > 0;

  if (total === 0) {
    return "Не нашёл точных совпадений, но вот что может быть интересно — посмотри эти возможности:";
  }

  if (/мед|биолог|врач|медицин/i.test(message))
    return `Вот что подобрал по теме биологии и медицины${hasCourses ? " — включая курсы для подготовки" : ""}:`;
  if (/прог|код|it\b|информатик|разраб|веб\b/i.test(message))
    return `Нашёл возможности по программированию и IT${hasCourses ? ", и подходящие курсы тоже" : ""}:`;
  if (/бизнес|стартап|предприним/i.test(message))
    return `По бизнесу и предпринимательству есть вот что:`;
  if (/математик|физик|химия/i.test(message))
    return `По точным наукам подобрал следующее${hasCourses ? " — и курс для подготовки тоже есть" : ""}:`;
  if (/финанс|инвест|экономик/i.test(message))
    return `По теме финансов и инвестиций — вот что актуально:`;
  if (/язык|английск/i.test(message))
    return `По языкам и коммуникации нашёл для тебя:`;
  if (/поступлен|универ|вуз\b|университет/i.test(message))
    return `Для подготовки к поступлению подобрал несколько вариантов${hasCourses ? " — смотри и возможности, и курсы" : ""}:`;
  if (/олимпиад/i.test(message))
    return `Вот олимпиады, которые могут тебя заинтересовать${hasCourses ? " — и курсы для подготовки к ним" : ""}:`;
  if (/стипенд|грант/i.test(message))
    return `По стипендиям и грантам — вот актуальные возможности:`;
  if (/искусств|дизайн|рисов/i.test(message))
    return `По творческому направлению нашёл для тебя:`;

  const total2 = ops.length + courses.length;
  return `Нашёл ${total2} подходящих вариантов по твоему запросу:`;
}

export async function getAssistantResponseAI(
  message: string
): Promise<{ reply: string; ids: string[] }> {
  try {
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { reply: "Не удалось получить ответ. Попробуй ещё раз.", ids: [] };
  }
}

export function getAssistantResponse(
  message: string,
  context: AssistantContext
): AssistantResponse {
  const { opportunities, courses, profile } = context;

  const tags = extractTags(message);
  const category = extractCategory(message);

  let filteredOps: Opportunity[] = [];
  let filteredCourses: Course[] = [];

  if (tags.length > 0 || category) {
    // Filter opportunities by matched tags
    if (tags.length > 0) {
      filteredOps = opportunities
        .filter((op) => op.tags.some((t) => tags.includes(t)))
        .sort((a, b) => countTagMatches(b.tags, tags) - countTagMatches(a.tags, tags));
    } else {
      filteredOps = [...opportunities];
    }

    // Narrow by category if detected, but only if it yields results
    if (category) {
      const byCategory = filteredOps.filter((op) => op.category === category);
      if (byCategory.length > 0) filteredOps = byCategory;
    }

    // Filter internal courses by matched tags
    filteredCourses =
      tags.length > 0
        ? courses.filter((c) => c.tags.some((t) => tags.includes(t)))
        : [];
  }

  // Fallback: profile-based or first N items
  if (filteredOps.length === 0 && filteredCourses.length === 0) {
    filteredOps =
      profile.onboarded && profile.interests.length > 0
        ? topRecommendations(opportunities, profile, 4)
        : opportunities.slice(0, 3);
    filteredCourses =
      profile.onboarded && profile.interests.length > 0
        ? recommendCourses(courses, profile).slice(0, 2)
        : courses.slice(0, 2);
  }

  const resultOps = filteredOps.slice(0, 3);
  const resultCourses = filteredCourses.slice(0, 2);
  const text = buildResponseText(message, resultOps, resultCourses);

  return { text, opportunities: resultOps, courses: resultCourses };
}
