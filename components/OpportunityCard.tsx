"use client";
import { Award, MapPin } from "lucide-react";
import { useStore } from "@/store/useStore";
import { categoryLabels, deadlineLabel, tagLabels } from "@/lib/recommend";
import type { Opportunity } from "@/lib/types";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick?: (op: Opportunity) => void;
}

export default function OpportunityCard({ opportunity: op, onClick }: OpportunityCardProps) {
  const isSaved = useStore((s) => s.isSaved(op.id));
  const toggleSaved = useStore((s) => s.toggleSaved);

  const dl = deadlineLabel(op.deadline);
  const isUrgent =
    dl.startsWith("Остался") ||
    dl === "Сегодня последний день" ||
    dl.startsWith("Осталось");

  return (
    <div
      className="group relative flex h-full flex-col gap-3 rounded-2xl border border-[--border] bg-[--surface] p-5 transition-all duration-300 hover:border-[--border-hover]"
      style={onClick ? { cursor: "pointer" } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(op)}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(op);
        }
      }}
    >
      {/* Header: category + deadline + save */}
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-[--accent]/10 px-2.5 py-0.5 text-xs font-medium text-[--accent]">
          {categoryLabels[op.category]}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`text-xs font-medium ${
              isUrgent ? "text-[#FFB020]" : "text-[--muted]"
            }`}
          >
            {dl}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaved(op.id);
            }}
            aria-label={isSaved ? "Убрать из сохранённых" : "Сохранить"}
            className={`flex h-9 w-9 items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
              isSaved ? "text-[#FFB020]" : "text-[--muted2] hover:text-[#FFB020]"
            }`}
          >
            {isSaved ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3h14a1 1 0 0 1 1 1v17.27a.5.5 0 0 1-.78.42L12 17.27l-7.22 4.42A.5.5 0 0 1 4 21.27V4a1 1 0 0 1 1-1z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Title + organizer */}
      <div>
        <h3 className="font-display text-base font-semibold leading-snug text-[--text]">
          {op.title}
        </h3>
        <p className="mt-0.5 text-xs text-[--muted]">{op.organizer}</p>
      </div>

      {/* Prize */}
      {op.prize && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-[--muted]">
          <Award size={12} className="shrink-0" />
          <span>{op.prize}</span>
        </div>
      )}

      {/* Format + city */}
      {(op.format || op.city) && (
        <div className="flex items-center gap-2 text-xs text-[--muted]">
          {op.format && (
            <span className="rounded-full border border-[--border] px-2 py-0.5">
              {op.format === "online" ? "Онлайн" : op.format === "offline" ? "Офлайн" : "Гибрид"}
            </span>
          )}
          {op.city && (
            <span className="flex items-center gap-1">
              <MapPin size={11} className="shrink-0" />
              {op.city}
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {op.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[--border] px-2 py-0.5 text-xs text-[--muted]"
          >
            {tagLabels[tag]}
          </span>
        ))}
      </div>

      {/* CTA */}
      {op.link && op.link !== "#" && (
        <a
          href={op.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-auto pt-1 text-xs font-semibold text-[--accent] hover:underline"
        >
          Подробнее →
        </a>
      )}
    </div>
  );
}
