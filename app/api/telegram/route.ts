import { NextRequest } from "next/server";

async function sendMessage(token: string, chatId: number | string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return new Response("OK", { status: 200 });

    const update = await req.json();
    const message = update?.message;
    if (!message) return new Response("OK", { status: 200 });

    const chatId = message.chat?.id;
    const text: string = message.text ?? "";

    if (text.startsWith("/start")) {
      await sendMessage(
        token,
        chatId,
        `Привет! Я бот Mentoria Hub 🎓\n\nТвой chat ID: <b>${chatId}</b>\n\nСкопируй его и вставь на сайте, чтобы получать напоминания о дедлайнах.`
      );
    }
  } catch {
    // always 200 to Telegram
  }

  return new Response("OK", { status: 200 });
}
