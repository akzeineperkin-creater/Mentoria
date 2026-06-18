"use client";

const STEPS = [
  {
    number: "01",
    title: "Создай профиль за минуту",
    description:
      "Расскажи о классе, интересах и целях — без долгих анкет. Несколько шагов, и платформа знает, что тебе показывать.",
  },
  {
    number: "02",
    title: "Получи рекомендации",
    description:
      "Алгоритм подбирает возможности и курсы под твои интересы.",
  },
  {
    number: "03",
    title: "Учись и следи за дедлайнами",
    description:
      "Сохраняй важное, проходи курсы и не пропускай сроки подачи.",
  },
] as const;

export default function HowItWorks() {
  return (
    <section className="relative z-10 mx-auto w-full max-w-[1200px] px-4 py-16 md:px-[6vw] md:py-[120px]">
      <p className="text-[12px] font-medium uppercase tracking-[.2em] text-[var(--muted2)]">
        Как это работает
      </p>
      <h2 className="mt-4 text-[clamp(1.8rem,4vw,2.7rem)] font-bold tracking-[-0.03em] text-[var(--text)]">
        Три шага до новых возможностей.
      </h2>

      <div className="mt-[56px]">
        {STEPS.map((step, i) => (
          <div
            key={step.number}
            className="flex items-start gap-4 py-8 md:gap-8 md:py-[44px]"
            style={{
              borderTop: "1px solid var(--border)",
              borderBottom: i === STEPS.length - 1 ? "1px solid var(--border)" : undefined,
            }}
          >
            <span
              aria-hidden
              className="w-10 shrink-0 font-bold leading-none tabular-nums text-[var(--text)] md:w-20"
              style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", opacity: 0.07 }}
            >
              {step.number}
            </span>
            <div className="pt-1 max-w-[640px]">
              <h3 className="text-[clamp(1.1rem,2vw,1.35rem)] font-bold tracking-[-0.02em] text-[var(--text)]">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] font-normal leading-relaxed text-[var(--muted)]">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
