import { NextRequest, NextResponse } from "next/server";
import { opportunities } from "@/data/opportunities";
import { courses } from "@/data/courses";

const SYSTEM_PROMPT = `Ты — ИИ-ассистент платформы Mentoria Hub. Помогаешь казахстанским школьникам находить подходящие возможности (олимпиады, гранты, стажировки, конкурсы) и курсы из каталога.

Тебе передаётся каталог в JSON. Твоя задача — выбрать ТОЛЬКО релевантные запросу позиции, максимум 3–5.

ПРАВИЛА (обязательны):
1. Если запрос непонятный, слишком короткий (менее 3 символов), пустой, бессмысленный или не связан с учёбой / возможностями / развитием — верни ids как пустой массив и вежливо попроси уточнить: например, «Уточни, что тебя интересует — олимпиады, гранты, стажировки или курсы?»
2. Выбирай id ТОЛЬКО из переданного каталога. Никогда не придумывай и не добавляй чужие id.
3. Максимум 5 id в ответе.
4. Отвечай ТОЛЬКО валидным JSON без markdown, блоков кода и любого текста снаружи JSON.

Формат ответа (строго, без отклонений):
{"reply":"<текст ответа на русском>","ids":["id1","id2"]}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: "Сервис временно недоступен (GROQ_API_KEY не настроен).", ids: [] },
      { status: 200 }
    );
  }

  let message: string;
  try {
    const body = await req.json();
    message = typeof body.message === "string" ? body.message.trim() : "";
  } catch {
    return NextResponse.json({ reply: "Некорректный запрос.", ids: [] }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json(
      { reply: "Напиши, что тебя интересует — олимпиады, гранты, стажировки или курсы?", ids: [] },
      { status: 200 }
    );
  }

  // Compact catalog: only fields the model needs for matching
  const catalog = [
    ...opportunities.map((op) => ({
      id: op.id,
      title: op.title,
      category: op.category,
      tags: op.tags,
      grades: op.grades,
      deadline: op.deadline,
    })),
    ...courses.map((c) => ({
      id: c.id,
      title: c.title,
      category: "course" as const,
      tags: c.tags,
    })),
  ];

  const userContent = `Каталог:\n${JSON.stringify(catalog)}\n\nЗапрос ученика: "${message}"`;

  let groqRes: Response;
  try {
    groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 512,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });
  } catch {
    return NextResponse.json(
      { reply: "Не удалось подключиться к AI-сервису. Попробуй позже.", ids: [] },
      { status: 200 }
    );
  }

  if (!groqRes.ok) {
    console.error("Groq API error:", groqRes.status, await groqRes.text());
    return NextResponse.json(
      { reply: "AI-сервис временно недоступен. Попробуй позже.", ids: [] },
      { status: 200 }
    );
  }

  const groqData = await groqRes.json();
  const raw: string = groqData.choices?.[0]?.message?.content ?? "";

  let parsed: { reply?: string; ids?: unknown };
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const reply = typeof parsed.reply === "string" && parsed.reply.trim()
    ? parsed.reply.trim()
    : "Уточни, что тебя интересует — олимпиады, гранты, стажировки или курсы?";

  // Validate ids: only accept real ids from the catalog
  const validIds = new Set(catalog.map((item) => item.id));
  const safeIds = Array.isArray(parsed.ids)
    ? (parsed.ids as unknown[])
        .filter((id): id is string => typeof id === "string" && validIds.has(id))
        .slice(0, 5)
    : [];

  return NextResponse.json({ reply, ids: safeIds });
}
