import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserProfile,
  CourseProgress,
  Tag,
  Grade,
  Opportunity,
  Course,
} from "@/lib/types";
import { opportunities as seedOpportunities } from "@/data/opportunities";
import { courses as seedCourses } from "@/data/courses";

interface AppState {
  // ── профиль ──────────────────────────────
  profile: UserProfile;
  setName: (name: string) => void;
  setGrade: (grade: Grade) => void;
  toggleInterest: (tag: Tag) => void;
  toggleGoal: (goal: string) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;

  // ── избранное ────────────────────────────
  savedIds: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;

  // ── прогресс по курсам ───────────────────
  progress: CourseProgress;
  completeLesson: (courseId: string, lessonId: string) => void;
  isLessonDone: (courseId: string, lessonId: string) => boolean;
  courseProgressPct: (courseId: string) => number;

  // ── данные (редактируются админкой) ──────
  opportunities: Opportunity[];
  courses: Course[];
  addOpportunity: (op: Opportunity) => void;
  updateOpportunity: (op: Opportunity) => void;
  deleteOpportunity: (id: string) => void;
  addCourse: (c: Course) => void;
  deleteCourse: (id: string) => void;
}

const emptyProfile: UserProfile = {
  name: "",
  grade: null,
  interests: [],
  goals: [],
  onboarded: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── профиль ──
      profile: emptyProfile,
      setName: (name) =>
        set((s) => ({ profile: { ...s.profile, name } })),
      setGrade: (grade) =>
        set((s) => ({ profile: { ...s.profile, grade } })),
      toggleInterest: (tag) =>
        set((s) => {
          const has = s.profile.interests.includes(tag);
          return {
            profile: {
              ...s.profile,
              interests: has
                ? s.profile.interests.filter((t) => t !== tag)
                : [...s.profile.interests, tag],
            },
          };
        }),
      toggleGoal: (goal) =>
        set((s) => {
          const has = s.profile.goals.includes(goal);
          return {
            profile: {
              ...s.profile,
              goals: has
                ? s.profile.goals.filter((g) => g !== goal)
                : [...s.profile.goals, goal],
            },
          };
        }),
      completeOnboarding: () =>
        set((s) => ({ profile: { ...s.profile, onboarded: true } })),
      resetProfile: () => set({ profile: emptyProfile }),

      // ── избранное ──
      savedIds: [],
      toggleSaved: (id) =>
        set((s) => ({
          savedIds: s.savedIds.includes(id)
            ? s.savedIds.filter((x) => x !== id)
            : [...s.savedIds, id],
        })),
      isSaved: (id) => get().savedIds.includes(id),

      // ── прогресс ──
      progress: {},
      completeLesson: (courseId, lessonId) =>
        set((s) => {
          const done = s.progress[courseId] ?? [];
          if (done.includes(lessonId)) return s;
          return {
            progress: { ...s.progress, [courseId]: [...done, lessonId] },
          };
        }),
      isLessonDone: (courseId, lessonId) =>
        (get().progress[courseId] ?? []).includes(lessonId),
      courseProgressPct: (courseId) => {
        const course = get().courses.find((c) => c.id === courseId);
        if (!course || course.lessons.length === 0) return 0;
        const done = (get().progress[courseId] ?? []).length;
        return Math.round((done / course.lessons.length) * 100);
      },

      // ── данные / админка ──
      opportunities: seedOpportunities,
      courses: seedCourses,
      addOpportunity: (op) =>
        set((s) => ({ opportunities: [op, ...s.opportunities] })),
      updateOpportunity: (op) =>
        set((s) => ({
          opportunities: s.opportunities.map((o) =>
            o.id === op.id ? op : o
          ),
        })),
      deleteOpportunity: (id) =>
        set((s) => ({
          opportunities: s.opportunities.filter((o) => o.id !== id),
          savedIds: s.savedIds.filter((x) => x !== id),
        })),
      addCourse: (c) => set((s) => ({ courses: [c, ...s.courses] })),
      deleteCourse: (id) =>
        set((s) => ({ courses: s.courses.filter((c) => c.id !== id) })),
    }),
    {
      name: "mentoria-hub",
      partialize: (s) => ({
        profile: s.profile,
        savedIds: s.savedIds,
        progress: s.progress,
        opportunities: s.opportunities,
        courses: s.courses,
      }),
    }
  )
);
