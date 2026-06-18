"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { tagLabels } from "@/lib/recommend";

const GAP = 22;
const COLORS = ["#141416", "#141416", "#1C1C1F", "#222226", "#7C6FF0"];

type Pixel = {
  x: number; y: number; color: string;
  size: number; max: number; step: number;
  delay: number; counter: number; cStep: number;
  shimmer: boolean; rev: boolean; sp: number;
};

function buildPixels(w: number, h: number): Pixel[] {
  const cxm = w / 2, cym = h / 2;
  const pixels: Pixel[] = [];
  for (let x = 0; x < w; x += GAP) {
    for (let y = 0; y < h; y += GAP) {
      const dx = x - cxm, dy = y - cym;
      const dist = Math.sqrt(dx * dx + dy * dy);
      pixels.push({
        x, y,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 0,
        max: Math.random() * 1.4 + 1.2,
        step: Math.random() * 0.16 + 0.12,
        delay: dist * 0.9,
        counter: 0,
        cStep: 2.4 + (w + h) * 0.006,
        shimmer: false, rev: false,
        sp: Math.random() * 0.3 + 0.06,
      });
    }
  }
  return pixels;
}

export default function Hero() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const profile = useStore((s) => s.profile);
  const onboarded = profile.onboarded;

  useEffect(() => {
    const cv = cvRef.current;
    const section = sectionRef.current;
    if (!cv || !section) return;
    const ctx = cv.getContext("2d")!;
    let rafId: number;
    let pixels: Pixel[] = [];

    function drawP(p: Pixel) {
      const off = 2 - p.size * 0.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + off, p.y + off, p.size, p.size);
    }

    function appear() {
      ctx.clearRect(0, 0, cv!.width, cv!.height);
      for (const p of pixels) {
        if (p.counter <= p.delay) {
          p.counter += p.cStep;
          if (p.size > 0) drawP(p);
          continue;
        }
        if (p.size >= p.max) p.shimmer = true;
        if (p.shimmer) {
          if (p.size >= p.max) p.rev = true;
          else if (p.size <= p.max * 0.55) p.rev = false;
          p.size += p.rev ? -p.sp : p.sp;
        } else {
          p.size += p.step;
        }
        drawP(p);
      }
      rafId = requestAnimationFrame(appear);
    }

    function start() {
      cancelAnimationFrame(rafId);
      cv!.width = section!.clientWidth;
      cv!.height = section!.clientHeight;
      pixels = buildPixels(cv!.width, cv!.height);
      appear();
    }

    start();
    window.addEventListener("resize", start);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", start);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-[5vw] text-center"
      style={{ isolation: "isolate" }}
    >
      {/* Pixel canvas */}
      <canvas ref={cvRef} className="absolute inset-0 z-0" />

      {/* Radial vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: "radial-gradient(circle at center, transparent 0%, var(--bg) 78%)",
        }}
      />

      <div className="relative z-[2] flex flex-col items-center">
        {onboarded ? (
          <>
            <p className="mb-8 text-[12px] font-medium uppercase tracking-[.2em] text-[var(--muted2)]">
              С возвращением, {profile.name || "друг"}
            </p>
            <h1
              className="font-display max-w-[15ch] font-bold leading-[1.0] tracking-[-0.035em] text-[var(--text)]"
              style={{ fontSize: "clamp(2.6rem, 8.5vw, 6.6rem)" }}
            >
              Твои возможности{" "}
              <span className="text-[var(--muted)]">уже ждут</span>
            </h1>
            {profile.interests.length > 0 && (
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                {profile.interests.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--accent)]"
                  >
                    {tagLabels[tag]}
                  </span>
                ))}
              </div>
            )}
            <p
              className="mx-auto mt-7 max-w-[46ch] font-normal leading-relaxed text-[var(--muted)]"
              style={{ fontSize: "clamp(1rem, 1.6vw, 1.2rem)" }}
            >
              {profile.grade ? `${profile.grade} класс · ` : ""}
              Подобрали подходящие олимпиады, курсы и стипендии — прокрути вниз.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3.5">
              <Link href="/catalog" className="inline-flex items-center gap-[9px] rounded-[12px] bg-[var(--accent)] px-[30px] py-[14px] text-[15px] font-medium text-white transition-all duration-200 hover:opacity-90">
                Найти возможности <ArrowIcon />
              </Link>
              <Link href="/courses" className="inline-flex items-center rounded-[12px] border border-[var(--border)] bg-transparent px-[30px] py-[14px] text-[15px] font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--surface)]">
                Мои курсы
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mb-[30px] text-[12px] font-medium uppercase tracking-[.2em] text-[var(--muted2)]">
              Образовательная платформа · 8–11 классов
            </p>
            <h1
              className="font-display max-w-[15ch] font-bold leading-[1.0] tracking-[-0.035em] text-[var(--text)]"
              style={{ fontSize: "clamp(2.6rem, 8.5vw, 6.6rem)" }}
            >
              Твои возможности{" "}
              <span className="text-[var(--muted)]">безграничны</span>
            </h1>
            <p
              className="mx-auto mt-7 max-w-[46ch] font-normal leading-relaxed text-[var(--muted)]"
              style={{ fontSize: "clamp(1rem, 1.6vw, 1.2rem)" }}
            >
              Конкурсы, олимпиады, стипендии и курсы — собраны в одном месте и подобраны под твои интересы.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3.5">
              <Link href="/catalog" className="inline-flex items-center gap-[9px] rounded-[12px] bg-[var(--accent)] px-[30px] py-[14px] text-[15px] font-medium text-white transition-all duration-200 hover:opacity-90">
                Найти возможности <ArrowIcon />
              </Link>
              <Link href="/onboarding" className="inline-flex items-center rounded-[12px] border border-[var(--border)] bg-transparent px-[30px] py-[14px] text-[15px] font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--surface)]">
                Начать обучение
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
