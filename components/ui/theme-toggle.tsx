"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-[72px] rounded-full" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      className="flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[var(--surface-hover)]"
      style={{ color: "var(--muted)" }}
    >
      {isDark ? (
        <>
          <Sun size={14} className="shrink-0" />
          <span>Светлая</span>
        </>
      ) : (
        <>
          <Moon size={14} className="shrink-0" />
          <span>Тёмная</span>
        </>
      )}
    </button>
  );
}
