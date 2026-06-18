"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import OpportunityModal from "@/components/OpportunityModal";
import { getAssistantResponseAI } from "@/lib/assistantLogic";
import { deadlineLabel, tagLabels, categoryLabels } from "@/lib/recommend";
import type { Opportunity, Course } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  opportunities?: Opportunity[];
  courses?: Course[];
}

// ─── Quick suggestion chips ───────────────────────────────────

const SUGGESTIONS = [
  "Хочу в медицину",
  "Интересует программирование",
  "Подбери олимпиады по математике",
  "Курсы для подготовки к университету",
];

// ─── Typing dots ──────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-[6px] h-[6px] rounded-full bg-[var(--muted2)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ─── Compact opportunity card ─────────────────────────────────

function OpportunityMiniCard({
  op,
  onClick,
}: {
  op: Opportunity;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-[10px] border border-[var(--border)] bg-[var(--surface2)] p-3.5 transition-colors hover:border-[var(--border-hover)]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-[var(--text)]">
          {op.title}
        </p>
        <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--muted2)]">
          {categoryLabels[op.category]}
        </span>
      </div>
      <p className="mt-1.5 text-[12px] text-[var(--muted)]">
        {deadlineLabel(op.deadline)}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {op.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--muted2)]"
          >
            {tagLabels[tag]}
          </span>
        ))}
      </div>
    </button>
  );
}

// ─── Compact course card ──────────────────────────────────────

function CourseMiniCard({ course }: { course: Course }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/courses/${course.id}`)}
      className="w-full text-left rounded-[10px] border border-[var(--border)] bg-[var(--surface2)] p-3.5 transition-colors hover:border-[var(--border-hover)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface2)] text-[var(--muted)]">
          <BookOpen size={14} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-[var(--text)]">
            {course.title}
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {course.subtitle}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--muted2)]"
              >
                {tagLabels[tag]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────

export default function AssistantChat() {
  const opportunities = useStore((s) => s.opportunities);
  const courses = useStore((s) => s.courses);


  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedOp, setSelectedOp] = useState<Opportunity | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  }, [input]);

  // Scroll to bottom on new messages or typing state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const { reply, ids } = await getAssistantResponseAI(trimmed);

        const matchedOps = ids.length > 0
          ? opportunities.filter((op) => ids.includes(op.id))
          : [];
        const matchedCourses = ids.length > 0
          ? courses.filter((c) => ids.includes(c.id))
          : [];

        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: reply,
          opportunities: matchedOps,
          courses: matchedCourses,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: "Не удалось получить ответ. Проверь подключение к сети.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [opportunities, courses, isTyping]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-col">
      <OpportunityModal
        opportunity={selectedOp}
        onClose={() => setSelectedOp(null)}
      />

      {/* ── Messages area ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          /* Empty / welcome state */
          <div className="flex h-full flex-col items-center justify-center gap-8 px-4 py-12">
            {/* Subtle accent glow */}
            <div
              className="pointer-events-none absolute h-64 w-64 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(139,125,255,0.04) 0%, transparent 70%)",
              }}
            />

            <div className="relative text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[.15em] text-[var(--muted2)]">
                Mentoria AI
              </p>
              <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">
                Подберу возможности под тебя
              </h1>
              <p className="mt-2.5 text-sm text-[var(--muted)]">
                Расскажи, что тебе интересно — олимпиады, стажировки, курсы
              </p>
            </div>

            {/* Quick chips */}
            <div className="relative flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)] transition-all duration-200 hover:border-[var(--border-hover)] hover:text-[var(--text)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat history */
          <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[76%] rounded-[14px] border border-[var(--border)] bg-[var(--surface2)] px-4 py-3 text-sm text-[var(--text)]">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="flex w-full flex-col gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--muted2)]">
                        Mentoria AI
                      </p>
                      <p className="text-sm leading-relaxed text-[var(--text)]">
                        {msg.text}
                      </p>

                      {/* Opportunity cards */}
                      {msg.opportunities && msg.opportunities.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {msg.opportunities.map((op) => (
                            <OpportunityMiniCard
                              key={op.id}
                              op={op}
                              onClick={() => setSelectedOp(op)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Course cards */}
                      {msg.courses && msg.courses.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {msg.courses.map((c) => (
                            <CourseMiniCard key={c.id} course={c} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--muted2)]">
                  Mentoria AI
                </p>
                <div className="w-fit rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
                  <TypingDots />
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input area ────────────────────────────── */}
      <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-4">
        <div className="mx-auto max-w-2xl">
          {/* Suggestion chips (compact row when chat is active) */}
          {hasMessages && !isTyping && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] whitespace-nowrap transition-all duration-200 hover:border-[var(--border-hover)] hover:text-[var(--text)]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Textarea + send */}
          <div className="flex items-end gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-colors focus-within:border-[var(--border-hover)]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Опиши, что тебе интересно…"
              rows={1}
              className="max-h-32 flex-1 resize-none bg-transparent text-sm leading-relaxed text-[var(--text)] placeholder-[var(--muted)] outline-none"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              aria-label="Отправить"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-white text-black transition-opacity hover:bg-white/90 disabled:opacity-30"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
