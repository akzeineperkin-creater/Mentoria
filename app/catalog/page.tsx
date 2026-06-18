"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import {
  filterOpportunities,
  categoryLabels,
  formatLabels,
  deadlineLabel,
  tagLabels,
} from "@/lib/recommend";
import type { OpportunityCategory, Format, Grade, Opportunity } from "@/lib/types";
import OpportunityCard from "@/components/OpportunityCard";
import OpportunityModal from "@/components/OpportunityModal";
import AppShell from "@/components/AppShell";
import { Search } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "Все категории" },
  { value: "olympiad", label: categoryLabels.olympiad },
  { value: "competition", label: categoryLabels.competition },
  { value: "scholarship", label: categoryLabels.scholarship },
  { value: "internship", label: categoryLabels.internship },
  { value: "course", label: categoryLabels.course },
  { value: "event", label: categoryLabels.event },
];

const FORMATS = [
  { value: "all", label: "Любой формат" },
  { value: "online", label: formatLabels.online },
  { value: "offline", label: formatLabels.offline },
  { value: "hybrid", label: formatLabels.hybrid },
];

const GRADES = [
  { value: "", label: "Любой класс" },
  { value: "8", label: "8 класс" },
  { value: "9", label: "9 класс" },
  { value: "10", label: "10 класс" },
  { value: "11", label: "11 класс" },
];

export default function CatalogPage() {
  const opportunities = useStore((s) => s.opportunities);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [format, setFormat] = useState("all");
  const [grade, setGrade] = useState("");
  const [selectedOp, setSelectedOp] = useState<Opportunity | null>(null);

  const filtered = useMemo(
    () =>
      filterOpportunities(opportunities, {
        search: search || undefined,
        category: category !== "all" ? category : undefined,
        format: format !== "all" ? format : undefined,
        grade: grade ? Number(grade) : undefined,
      }),
    [opportunities, search, category, format, grade]
  );

  return (
    <AppShell>
      <OpportunityModal opportunity={selectedOp} onClose={() => setSelectedOp(null)} />
      <div className="min-h-screen pb-20 px-4 pt-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl font-bold text-[--text] md:text-5xl">
              Каталог возможностей
            </h1>
            <p className="mt-3 text-[--muted]">
              {filtered.length} из {opportunities.length} возможностей
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <input
              type="text"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border border-[--border] bg-[--surface] px-4 text-sm text-[--text] placeholder-[--muted2] outline-none focus:border-[--accent]/50 transition-colors sm:w-56"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 rounded-xl border border-[--border] bg-[--surface] px-3 text-sm text-[--text] outline-none focus:border-[--accent]/50 transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="h-10 rounded-xl border border-[--border] bg-[--surface] px-3 text-sm text-[--text] outline-none focus:border-[--accent]/50 transition-colors"
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="h-10 rounded-xl border border-[--border] bg-[--surface] px-3 text-sm text-[--text] outline-none focus:border-[--accent]/50 transition-colors"
            >
              {GRADES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            {(search || category !== "all" || format !== "all" || grade) && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setFormat("all");
                  setGrade("");
                }}
                className="h-10 rounded-xl border border-[--border] px-4 text-sm text-[--muted] hover:border-[--border-hover] hover:text-[--text] transition-colors"
              >
                Сбросить
              </button>
            )}
          </motion.div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <motion.div
              className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search size={40} className="text-[--muted]" />
              <p className="text-[--muted]">Ничего не найдено. Попробуй другие фильтры.</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            >
              {filtered.map((op) => (
                <motion.div
                  key={op.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="h-full"
                >
                  <OpportunityCard opportunity={op} onClick={setSelectedOp} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
