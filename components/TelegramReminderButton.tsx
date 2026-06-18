"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { daysLeft } from "@/lib/recommend";
import { Send, Link2, Check, ChevronRight } from "lucide-react";

const LS_KEY = "tg_chat_id";

export default function TelegramReminderButton() {
  const { savedIds, opportunities } = useStore();
  const username = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  const [chatId, setChatId] = useState<string>("");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setChatId(stored);
  }, []);

  const savedOpps = opportunities.filter(
    (op) => savedIds.includes(op.id) && daysLeft(op.deadline) >= 0
  );

  function saveId() {
    const trimmed = input.trim();
    if (!trimmed) return;
    localStorage.setItem(LS_KEY, trimmed);
    setChatId(trimmed);
    setShowInput(false);
    setInput("");
  }

  async function sendReminder() {
    if (!chatId || savedOpps.length === 0) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/telegram/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          deadlines: savedOpps.map((op) => ({
            title: op.title,
            organizer: op.organizer,
            deadline: op.deadline,
          })),
        }),
      });
      const data = await res.json();
      setStatus(data.ok ? "sent" : "error");
      if (data.ok) setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  }

  if (!chatId) {
    return (
      <div className="rounded-2xl border border-[--border] bg-[--surface] p-5 space-y-3">
        <p className="text-sm text-[--muted]">
          Подключи Telegram, чтобы получать напоминания о дедлайнах
        </p>

        <a
          href={`https://t.me/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[--accent]/10 border border-[--accent]/30 px-4 py-2 text-sm font-medium text-[--accent] hover:bg-[--accent]/20 transition-colors"
        >
          <Link2 size={15} />
          Открыть @{username}
          <ChevronRight size={13} className="opacity-60" />
        </a>

        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="block text-xs text-[--muted] underline underline-offset-2 hover:text-[--text] transition-colors"
          >
            Уже получил chat ID? Вставить
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Chat ID"
              className="flex-1 rounded-xl border border-[--border] bg-[--surface2] px-3 py-2 text-sm text-[--text] placeholder:text-[--muted2] outline-none focus:border-[--accent]/50 transition-colors"
            />
            <button
              onClick={saveId}
              className="rounded-xl bg-[--accent] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Сохранить
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={sendReminder}
        disabled={savedOpps.length === 0 || status === "sending"}
        className="inline-flex items-center gap-2 rounded-xl bg-[--accent] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        {status === "sent" ? (
          <>
            <Check size={15} />
            Отправлено ✅
          </>
        ) : (
          <>
            <Send size={15} />
            {status === "sending" ? "Отправляю…" : "Напомнить в Telegram"}
          </>
        )}
      </button>

      {status === "error" && (
        <span className="text-xs text-red-400">Не удалось отправить</span>
      )}

      <button
        onClick={() => {
          localStorage.removeItem(LS_KEY);
          setChatId("");
        }}
        className="text-xs text-[--muted] hover:text-[--text] transition-colors"
      >
        Отвязать
      </button>
    </div>
  );
}
