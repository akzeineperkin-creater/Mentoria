"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BarChart2, BookOpen, Users, PlusCircle, HelpCircle } from "lucide-react";
import { useStore } from "@/store/useStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

// ─── Rule-based admin FAQ ─────────────────────────────────────

type QARule = { pattern: RegExp; answer: string };

const ADMIN_QA: QARule[] = [
  {
    pattern: /сколько (курс|course)/i,
    answer: ((() => "") as unknown as (s: string) => string) as unknown as string,
  },
  {
    pattern: /сколько возможност/i,
    answer: "__OPP_COUNT__",
  },
  {
    pattern: /как добав.*(возможност|opportunity)/i,
    answer:
      "Перейди во вкладку «Возможности» → нажми «+ Добавить возможность». Заполни название, организатора, категорию, формат, дедлайн и классы — и нажми «Добавить». Возможность сразу появится в каталоге для учеников.",
  },
  {
    pattern: /как добав.*(курс|course)/i,
    answer:
      "Перейди во вкладку «Курсы» → нажми «+ Добавить курс». Укажи название, подзаголовок, уровень сложности и добавь уроки. После нажатия «Опубликовать курс» он станет доступен всем ученикам.",
  },
  {
    pattern: /как удал/i,
    answer:
      "В таблице возможностей или курсов нажми кнопку «Удалить» справа в строке. Появится подтверждение — нажми «ОК». Удалённый элемент исчезнет из каталога для учеников.",
  },
  {
    pattern: /как редактир/i,
    answer:
      "Нажми кнопку «Изменить» в строке нужного элемента — откроется форма с уже заполненными полями. Внеси изменения и нажми «Сохранить».",
  },
  {
    pattern: /аналитик|статистик/i,
    answer:
      "В панели администратора есть вкладка «Аналитика» — там ты увидишь: количество зарегистрированных учеников, самые популярные курсы, средний процент завершения, активность по дням и сохранённые возможности.",
  },
  {
    pattern: /скольк.*(пользовател|учени|студент)/i,
    answer: "__USER_COUNT__",
  },
  {
    pattern: /популярн/i,
    answer:
      "В аналитике (вкладка «Аналитика») отображается список курсов по количеству записей. Сейчас самый популярный курс — «Английский для академического успеха».",
  },
  {
    pattern: /telegram|телеграм/i,
    answer:
      "Telegram-интеграция позволяет ученикам получать напоминания о дедлайнах. Кнопка «Напомнить в Telegram» есть в карточках возможностей и в календаре. Бот отправляет уведомление за 3 дня до дедлайна.",
  },
  {
    pattern: /деплой|deploy|верцел|vercel|netlify/i,
    answer:
      "Платформа задеплоена через Vercel. Каждый push в ветку main автоматически обновляет продакшн. Для деплоя нужны переменные окружения: GROQ_API_KEY и NEXT_PUBLIC_SUPABASE_URL/KEY.",
  },
  {
    pattern: /supabase|авторизаци|auth/i,
    answer:
      "Аутентификация реализована через Supabase Auth. Ученики регистрируются по email/паролю. Статус администратора определяется по списку email в файле lib/admins.ts — просто добавь туда нужный email.",
  },
  {
    pattern: /добав.*(администратор|admin|права)/i,
    answer:
      "Чтобы дать кому-то права администратора, добавь его email в массив ADMIN_EMAILS в файле lib/admins.ts. Пример: ADMIN_EMAILS = [\"admin@mentoria.kz\", \"новый@email.com\"].",
  },
  {
    pattern: /рекоменда/i,
    answer:
      "Система рекомендаций работает на основе тегов: при онбординге ученик выбирает интересы (STEM, бизнес, языки и т.д.), а алгоритм подбирает возможности и курсы по совпадению тегов. Чем больше тегов у возможности совпадает с интересами — тем выше она в рекомендациях.",
  },
  {
    pattern: /ии.?ассистент|ai.?assistant/i,
    answer:
      "ИИ-ассистент для учеников работает через Groq API (модель llama-3.3-70b-versatile). Он получает запрос ученика + каталог возможностей и курсов, и возвращает релевантные рекомендации. Ключ GROQ_API_KEY нужно добавить в .env.local.",
  },
  {
    pattern: /помоги|помощ|что ты умееш|что можеш/i,
    answer:
      "Я — административный ИИ-ассистент Mentoria Hub. Могу помочь с:\n• Управлением контентом (как добавить/удалить/изменить курсы и возможности)\n• Статистикой платформы (сколько пользователей, курсов, возможностей)\n• Технической информацией (деплой, Supabase, Telegram-интеграция)\n• Настройкой прав администраторов\n\nСпрашивай!",
  },
];

function getAdminReply(msg: string, oppCount: number, courseCount: number): string {
  for (const rule of ADMIN_QA) {
    if (rule.pattern.test(msg)) {
      let ans = rule.answer as string;
      if (ans === "__OPP_COUNT__") return `Сейчас в базе ${oppCount} возможностей. Ты можешь добавлять новые во вкладке «Возможности» → «+ Добавить возможность».`;
      if (ans === "__USER_COUNT__") return `На платформе зарегистрировано 47 учеников (тестовые данные). Посмотреть подробную аналитику можно во вкладке «Аналитика» панели администратора.`;
      if (ans.includes("__COURSE_COUNT__")) return `Сейчас в базе ${courseCount} курсов.`;
      return ans;
    }
  }
  if (/сколько (курс|course)/i.test(msg)) {
    return `Сейчас в базе ${courseCount} курсов. Добавить новый можно во вкладке «Курсы» → «+ Добавить курс».`;
  }
  return `Я не нашёл точного ответа на этот вопрос. Попробуй спросить:\n• «Как добавить возможность?»\n• «Сколько пользователей на платформе?»\n• «Как дать права администратора?»\n• «Как работает аналитика?»`;
}

// ─── Quick suggestion chips ───────────────────────────────────

const ADMIN_SUGGESTIONS = [
  "Как добавить возможность?",
  "Сколько пользователей?",
  "Как работает аналитика?",
  "Как добавить администратора?",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-[6px] w-[6px] rounded-full bg-[var(--muted2)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export default function AdminAssistantChat() {
  const opportunities = useStore((s) => s.opportunities);
  const courses = useStore((s) => s.courses);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  }, [input]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: trimmed }]);
      setInput("");
      setIsTyping(true);

      setTimeout(() => {
        const reply = getAdminReply(trimmed, opportunities.length, courses.length);
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: reply }]);
        setIsTyping(false);
      }, 600 + Math.random() * 400);
    },
    [opportunities.length, courses.length, isTyping]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const hasMessages = messages.length > 0;

  const STAT_PILLS = [
    { icon: Users, label: `${opportunities.length} возможностей` },
    { icon: BookOpen, label: `${courses.length} курсов` },
    { icon: BarChart2, label: "47 учеников" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center gap-8 px-4 py-12">
            <div className="pointer-events-none absolute h-64 w-64 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(109,94,247,0.06) 0%, transparent 70%)" }}
            />
            <div className="relative text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[.15em] text-[var(--muted2)]">
                Mentoria Admin AI
              </p>
              <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-[var(--text)]">
                Чем могу помочь?
              </h1>
              <p className="mt-2.5 text-sm text-[var(--muted)]">
                Отвечу на вопросы об управлении платформой
              </p>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {STAT_PILLS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)]">
                  <Icon size={13} className="text-[#6D5EF7]" />
                  {label}
                </div>
              ))}
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {ADMIN_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
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
                    <div className="flex w-full flex-col gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--muted2)]">
                        Admin AI
                      </p>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text)]">
                        {msg.text}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--muted2)]">Admin AI</p>
                <div className="w-fit rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
                  <TypingDots />
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-4">
        <div className="mx-auto max-w-2xl">
          {hasMessages && !isTyping && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {ADMIN_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] whitespace-nowrap transition-all hover:border-[var(--border-hover)] hover:text-[var(--text)]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-colors focus-within:border-[var(--border-hover)]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Задай вопрос об управлении платформой…"
              rows={1}
              className="max-h-32 flex-1 resize-none bg-transparent text-sm leading-relaxed text-[var(--text)] placeholder-[var(--muted)] outline-none"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
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
