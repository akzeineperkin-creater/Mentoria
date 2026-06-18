// ─── Mentoria Hub — общие типы ───────────────────────────────

export type Tag =
  | "business"
  | "stem"
  | "coding"
  | "science"
  | "finance"
  | "social"
  | "languages"
  | "arts";

export type Grade = 8 | 9 | 10 | 11;

export type OpportunityCategory =
  | "competition"   // конкурс
  | "olympiad"      // олимпиада
  | "scholarship"   // стипендия / грант
  | "internship"    // стажировка
  | "course"        // внешний курс
  | "event";        // мероприятие / хакатон

export type Format = "online" | "offline" | "hybrid";

export interface Opportunity {
  id: string;
  title: string;
  organizer: string;
  category: OpportunityCategory;
  format: Format;
  description: string;
  /** ISO-дата дедлайна, например "2026-07-15" */
  deadline: string;
  /** для каких классов подходит */
  grades: Grade[];
  tags: Tag[];
  /** внешняя ссылка на заявку */
  link?: string;
  /** есть ли денежный приз / стипендия */
  prize?: string;
  city?: string;
  /** ссылка на пост-источник (Instagram и т.п.) */
  sourceUrl?: string;
  /** список требований / условий участия */
  requirements?: string[];
  /** ссылки на источники в соцсетях */
  links?: {
    instagram?: string;
    telegram?: string;
    github?: string;
    x?: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  /** текст материала урока */
  content: string;
  /** плейсхолдер видео (youtube id или null) */
  videoId?: string | null;
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** индекс правильного варианта */
  correct: number;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  /** эмодзи или путь к обложке */
  cover: string;
  tags: Tag[];
  lessons: Lesson[];
}

// ─── Профиль пользователя (онбординг) ────────────────────────

export interface UserProfile {
  name: string;
  grade: Grade | null;
  interests: Tag[];
  goals: string[];
  onboarded: boolean;
}

// прогресс по курсу: id курса → массив id завершённых уроков
export type CourseProgress = Record<string, string[]>;
