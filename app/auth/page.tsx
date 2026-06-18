"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Bebas_Neue } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admins";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

type Mode = "login" | "register";

const SUPABASE_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Неверный email или пароль",
  "Email already in use": "Email уже зарегистрирован",
  "User already registered": "Email уже зарегистрирован",
  "Password should be at least 6 characters": "Пароль должен содержать минимум 6 символов",
  "Unable to validate email address: invalid format": "Неверный формат email",
  "Email not confirmed": "Подтвердите email перед входом",
  "Email rate limit exceeded": "Слишком много попыток. Попробуйте позже",
  "For security purposes, you can only request this once every 60 seconds":
    "Подождите 60 секунд перед повторной отправкой",
};

function mapError(msg: string): string {
  for (const [key, ru] of Object.entries(SUPABASE_ERRORS)) {
    if (msg.includes(key)) return ru;
  }
  return "Ошибка. Попробуйте ещё раз";
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace(isAdmin(data.user.email) ? "/admin" : "/dashboard");
      }
    });
  }, [router]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (mode === "login") {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (err) { setError(mapError(err.message)); return; }
      router.push(isAdmin(data.user?.email) ? "/admin" : "/dashboard");
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (err) { setError(mapError(err.message)); return; }
      if (data.session) {
        router.push(isAdmin(data.user?.email) ? "/admin" : "/onboarding");
      } else {
        setInfo("Письмо с подтверждением отправлено на " + email + ". Проверьте почту.");
      }
    }
  };

  return (
    <>
      <style>{`
        .auth-root {
          min-height: 100vh;
          background: #000;
          display: grid;
          grid-template-columns: 42fr 58fr;
          overflow: hidden;
        }
        .auth-underline-input::placeholder { color: #3A3A3A; }
        .auth-underline-input:focus { border-bottom-color: #fff !important; }
        .auth-submit-btn:hover:not(:disabled) { background: #000 !important; color: #fff !important; }
        .auth-switch-btn:hover { color: #fff !important; border-bottom-color: #fff !important; }
        @media (max-width: 768px) {
          .auth-root { grid-template-columns: 1fr; }
          .auth-visual-col { display: none; }
          .auth-form-col {
            padding: 80px 24px 48px !important;
            padding-top: clamp(72px, 15vh, 120px) !important;
          }
        }
      `}</style>

      <div className={`auth-root ${bebas.variable}`}>

        {/* ─── LEFT: Form column ─────────────────────────────── */}
        <div
          className="auth-form-col"
          style={{
            borderRight: "1px solid #1A1A1A",
            display: "flex",
            flexDirection: "column",
            padding: "40px 52px 64px",
            paddingTop: "clamp(40px, 25vh, 160px)",
            position: "relative",
          }}
        >
          {/* Logo */}
          <div style={{ position: "absolute", top: 32, left: "clamp(24px, 52px, 52px)" }}>
            <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 12, letterSpacing: "0.12em", color: "#fff", fontWeight: 700 }}>
              MENTORIA
            </span>
            <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 12, letterSpacing: "0.12em", color: "#555" }}>
              {" "}HUB
            </span>
          </div>

          {/* Stagger wrapper — key=mode replays on mode switch */}
          <motion.div key={mode} variants={stagger} initial="hidden" animate="show">

            <motion.h1 variants={fadeUp} style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(48px, 6vw, 96px)",
              letterSpacing: "-0.01em",
              color: "#fff",
              lineHeight: 1,
              marginBottom: 10,
              fontWeight: 400,
            }}>
              {mode === "login" ? "С возвращением" : "Регистрация"}
            </motion.h1>

            <motion.p variants={fadeUp} style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "#555",
              textTransform: "uppercase",
              marginBottom: 48,
            }}>
              {mode === "login" ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
            </motion.p>

            {/* Mode tabs */}
            <motion.div variants={fadeUp} style={{ display: "flex", gap: 24, marginBottom: 44 }}>
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: mode === m ? "#fff" : "#444",
                    background: "none",
                    border: "none",
                    borderBottom: `1px solid ${mode === m ? "#fff" : "transparent"}`,
                    padding: "4px 0",
                    cursor: "pointer",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                >
                  {m === "login" ? "Вход" : "Регистрация"}
                </button>
              ))}
            </motion.div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>

              {/* Email */}
              <motion.div variants={fadeUp}>
                <label style={{
                  display: "block",
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "#888",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="auth-underline-input"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid #333",
                    outline: "none",
                    padding: "10px 0",
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: 14,
                    color: "#fff",
                    letterSpacing: "0.03em",
                    transition: "border-color 0.2s",
                    borderRadius: 0,
                  }}
                />
              </motion.div>

              {/* Password */}
              <motion.div variants={fadeUp}>
                <label style={{
                  display: "block",
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "#888",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}>
                  Пароль
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder={mode === "register" ? "Минимум 6 символов" : "••••••••"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="auth-underline-input"
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid #333",
                      outline: "none",
                      padding: "10px 36px 10px 0",
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: 14,
                      color: "#fff",
                      letterSpacing: "0.03em",
                      transition: "border-color 0.2s",
                      borderRadius: 0,
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#444",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#888"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#444"; }}
                  >
                    {showPw ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                  </button>
                </div>
              </motion.div>

              {/* Remember me */}
              {mode === "login" && (
                <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    type="button"
                    aria-pressed={remember}
                    onClick={() => setRemember(!remember)}
                    style={{
                      width: 14,
                      height: 14,
                      border: `1px solid ${remember ? "#fff" : "#333"}`,
                      background: remember ? "#fff" : "transparent",
                      borderRadius: 0,
                      padding: 0,
                      cursor: "pointer",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    {remember && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4L3 6L7 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 11, letterSpacing: "0.08em", color: "#555", textTransform: "uppercase" }}>
                    Запомнить меня
                  </span>
                </motion.div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: 11,
                      letterSpacing: "0.05em",
                      color: "#f87171",
                      borderLeft: "2px solid rgba(248,113,113,0.4)",
                      paddingLeft: 12,
                      margin: 0,
                    }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Info */}
              <AnimatePresence>
                {info && (
                  <motion.p
                    key="info"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: 11,
                      letterSpacing: "0.05em",
                      color: "#888",
                      borderLeft: "2px solid #2A2A2A",
                      paddingLeft: 12,
                      margin: 0,
                    }}
                  >
                    {info}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                variants={fadeUp}
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
                style={{
                  width: "100%",
                  background: "#fff",
                  color: "#000",
                  border: "1px solid #fff",
                  borderRadius: 0,
                  padding: "16px 0",
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.45 : 1,
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Создать аккаунт"}
              </motion.button>

              {/* Switch mode */}
              <motion.p variants={fadeUp} style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 11,
                letterSpacing: "0.08em",
                color: "#444",
                textTransform: "uppercase",
                margin: 0,
              }}>
                {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "login" ? "register" : "login")}
                  className="auth-switch-btn"
                  style={{
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid transparent",
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "#888",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    padding: "0 0 1px",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                >
                  {mode === "login" ? "Зарегистрироваться" : "Войти"}
                </button>
              </motion.p>

            </form>
          </motion.div>
        </div>

        {/* ─── RIGHT: Visual column ──────────────────────────── */}
        <div
          className="auth-visual-col"
          style={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "40px 48px 64px",
          }}
        >
          {/* Ghost watermark */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: "-3%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              userSelect: "none",
              lineHeight: 0.82,
            }}
          >
            <span style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(130px, 20vw, 310px)",
              color: "#0D0D0D",
              display: "block",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}>
              MENTORIA
            </span>
          </div>

          {/* Bottom slogan */}
          <p
            aria-hidden
            style={{
              position: "relative",
              zIndex: 1,
              fontFamily: "var(--font-jetbrains)",
              fontSize: 11,
              letterSpacing: "0.15em",
              color: "#2A2A2A",
              textTransform: "uppercase",
              lineHeight: 2,
              margin: 0,
            }}
          >
            Платформа для роста.<br />
            Менторство. Курсы. Сообщество.
          </p>
        </div>

      </div>
    </>
  );
}
