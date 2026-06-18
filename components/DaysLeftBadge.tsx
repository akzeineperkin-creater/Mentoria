"use client";

export function DaysLeftBadge({ days }: { days: number }) {
  if (days < 0) return null;

  const color =
    days === 0
      ? "bg-red-500/15 text-red-400 border-red-500/30"
      : days <= 3
      ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
      : days <= 14
      ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
      : "bg-[--accent]/10 text-[--accent] border-[--accent]/25";

  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {days === 0 ? "Сегодня" : `${days} дн.`}
    </span>
  );
}
