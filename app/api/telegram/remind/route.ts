import { NextRequest } from "next/server";

interface DeadlineItem {
  title: string;
  organizer: string;
  deadline: string;
}

export async function POST(req: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return Response.json({ ok: false, error: "Bot not configured" }, { status: 500 });
    }

    const { chatId, deadlines }: { chatId: string; deadlines: DeadlineItem[] } =
      await req.json();

    if (!chatId || !Array.isArray(deadlines) || deadlines.length === 0) {
      return Response.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const lines = deadlines.map((d) => {
      const date = new Date(d.deadline).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return `• ${d.title} (${d.organizer}) — до ${date}`;
    });

    const text = `📌 Твои дедлайны из избранного:\n\n${lines.join("\n")}`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!res.ok) {
      const err = await res.json();
      return Response.json({ ok: false, error: err.description }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
