import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Recommendations from "@/components/Recommendations";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Recommendations />
      </main>

      <footer className="relative z-10 border-t border-[var(--border)] px-[6vw] py-14">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[var(--muted2)]">
            © 2026 Mentoria<span className="text-[var(--accent)]"> Hub</span>
            <span className="mx-2 opacity-30">—</span>
            <em className="not-italic text-[var(--muted2)]">образовательная платформа для школьников Казахстана</em>
          </p>
          <Link
            href="/admin"
            className="text-[12px] text-[var(--muted2)] transition-colors hover:text-[var(--muted)]"
          >
            Панель администратора
          </Link>
        </div>
      </footer>
    </>
  );
}
