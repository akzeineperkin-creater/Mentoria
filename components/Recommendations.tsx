"use client";
import Link from "next/link";
import { Target } from "lucide-react";
import { useStore } from "@/store/useStore";
import { topRecommendations, categoryLabels, deadlineLabel, tagLabels } from "@/lib/recommend";

export default function Recommendations() {
  const profile = useStore((s) => s.profile);
  const opportunities = useStore((s) => s.opportunities);
  const recs = topRecommendations(opportunities, profile);

  return (
    <section className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pb-16 pt-0 md:px-[6vw] md:pb-[120px]">
      <p className="text-[12px] font-medium uppercase tracking-[.2em] text-[var(--muted2)]">
        Рекомендовано тебе
      </p>
      <h2 className="mt-4 text-[clamp(1.8rem,4vw,2.7rem)] font-bold tracking-[-0.03em] text-[var(--text)]">
        Подобрано под твои интересы.
      </h2>

      {recs.length === 0 ? (
        <div className="mt-[52px] flex flex-col items-center gap-5 rounded-[14px] border border-dashed border-[var(--border)] bg-[var(--surface)] py-20 text-center">
          <Target size={40} className="text-[--muted]" />
          <div>
            <h3 className="font-display text-xl font-bold text-[var(--text)]">
              Заполни профиль — получи персональный список
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              Укажи класс и интересы — мы подберём олимпиады, стипендии и курсы именно для тебя.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="rounded-[12px] bg-[var(--accent)] px-7 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            Пройти онбординг
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-[52px] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map((op) => {
              const dl = deadlineLabel(op.deadline);
              return (
                <div
                  key={op.id}
                  className="group rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-[26px] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-hover)]"
                >
                  <span className="inline-block rounded-[7px] border border-[var(--border)] px-3 py-[5px] text-[12px] font-medium text-[var(--muted)]">
                    {categoryLabels[op.category]}
                  </span>
                  <h4 className="mt-4 mb-2 font-display text-[1.15rem] font-semibold leading-snug tracking-[-0.01em] text-[var(--text)]">
                    {op.title}
                  </h4>
                  <p className="text-[13px] font-normal text-[var(--muted2)]">{op.organizer}</p>
                  <p className="mt-4 text-[12px] font-medium text-[var(--muted)]">{dl}</p>
                  <div className="mt-4 flex flex-wrap gap-[7px]">
                    {op.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--border)] px-[11px] py-1 text-[11px] font-normal text-[var(--muted2)]"
                      >
                        {tagLabels[tag]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-left">
            <Link
              href="/catalog"
              className="text-[14px] font-medium text-[var(--accent)] transition-opacity hover:opacity-70"
            >
              [Смотреть все возможности →]
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
