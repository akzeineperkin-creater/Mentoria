"use client";
import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ExternalLink, MapPin, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { categoryLabels, deadlineLabel, tagLabels } from "@/lib/recommend";
import type { Opportunity } from "@/lib/types";

// ─── Inline social SVGs (brand icons not in lucide) ──────────
function IconInstagram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconTelegram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconGithub() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { key: "instagram" as const, label: "Instagram", Icon: IconInstagram },
  { key: "telegram"  as const, label: "Telegram",  Icon: IconTelegram },
  { key: "github"    as const, label: "GitHub",    Icon: IconGithub },
  { key: "x"         as const, label: "X",         Icon: IconX },
];

interface Props {
  opportunity: Opportunity | null;
  onClose: () => void;
}

export default function OpportunityModal({ opportunity: op, onClose }: Props) {
  const isSaved = useStore((s) => (op ? s.isSaved(op.id) : false));
  const toggleSaved = useStore((s) => s.toggleSaved);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!op) return;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [op, handleKeyDown]);

  return (
    <AnimatePresence>
      {op && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Card */}
          <motion.div
            className="relative z-10 flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-y-auto rounded-[16px] border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={op.title}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className="p-4 pb-4 sm:p-7 sm:pb-5">
              {/* Category badge */}
              <span className="inline-block rounded-[7px] border border-[var(--border)] px-3 py-[5px] text-[12px] font-medium text-[var(--muted)]">
                {categoryLabels[op.category]}
              </span>

              {/* Title */}
              <h2 className="mt-4 font-display text-[1.4rem] font-bold leading-snug tracking-[-0.02em] text-[var(--text)]">
                {op.title}
              </h2>

              {/* Organizer */}
              <p className="mt-1.5 text-sm text-[var(--muted2)]">{op.organizer}</p>

              {/* Deadline */}
              <p className="mt-3 text-sm font-medium text-[var(--muted)]">
                {deadlineLabel(op.deadline)}
              </p>

              {/* Prize */}
              {op.prize && (
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-[--muted]">
                  <Award size={14} className="shrink-0" />
                  <span>{op.prize}</span>
                </div>
              )}

              {/* Format + city */}
              {(op.format || op.city) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                  {op.format && (
                    <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5">
                      {op.format === "online"
                        ? "Онлайн"
                        : op.format === "offline"
                        ? "Офлайн"
                        : "Гибрид"}
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

              {/* Description */}
              <p className="mt-5 text-[14px] leading-relaxed text-[var(--muted)]">
                {op.description}
              </p>

              {/* Requirements */}
              {op.requirements && op.requirements.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2.5 text-xs font-semibold uppercase tracking-[.1em] text-[var(--muted2)]">
                    Требования
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {op.requirements.map((req, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[13px] text-[var(--muted)]"
                      >
                        <span className="mt-[3px] shrink-0 text-[var(--muted2)]">—</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              <div className="mt-5 flex flex-wrap gap-2">
                {op.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-[12px] text-[var(--muted2)]"
                  >
                    {tagLabels[tag]}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-[var(--border)] px-4 py-4 sm:px-7 sm:py-5">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => toggleSaved(op.id)}
                  className={`flex h-10 items-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-all duration-200 ${
                    isSaved
                      ? "border-[#FFB020]/30 bg-[#FFB020]/10 text-[#FFB020]"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-hover)] hover:text-[var(--text)]"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 3h14a1 1 0 0 1 1 1v17.27a.5.5 0 0 1-.78.42L12 17.27l-7.22 4.42A.5.5 0 0 1 4 21.27V4a1 1 0 0 1 1-1z" />
                      </svg>
                      В избранном
                    </>
                  ) : (
                    <>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      В избранное
                    </>
                  )}
                </button>

                {op.sourceUrl && (
                  <a
                    href={op.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 items-center gap-2 rounded-[10px] border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)] transition-all duration-200 hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                  >
                    <ExternalLink size={14} />
                    Источник в Instagram
                  </a>
                )}
              </div>

              {/* Social links */}
              {op.links && Object.values(op.links).some(Boolean) && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-[var(--muted2)]">Источники</span>
                  <div className="flex gap-2">
                    {SOCIAL_LINKS.map(({ key, label, Icon }) => {
                      const url = op.links?.[key];
                      if (!url) return null;
                      return (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={label}
                          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] text-[var(--muted)] transition-all duration-200 hover:border-[var(--border-hover)] hover:text-[var(--text)]"
                        >
                          <Icon />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
