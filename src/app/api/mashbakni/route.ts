import Anthropic from "@anthropic-ai/sdk";
import { isLocale } from "@/i18n/config";
import { mashbakniSystem } from "@/lib/mashbakni";
import { getViewer } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

// Light per-member rate limit (per Cloud Run instance): 40 messages per hour.
const hits = new Map<string, number[]>();
function limited(id: string) {
  const now = Date.now();
  const list = (hits.get(id) ?? []).filter((t) => now - t < 3600_000);
  list.push(now);
  hits.set(id, list);
  return list.length > 40;
}

const NO_KEY = {
  ar: "مشبكني غير مفعّل بعد. على فريق مشبك إضافة مفتاح ANTHROPIC_API_KEY في إعدادات الخادم.",
  en: "Mashbakni isn't switched on yet. The Mashbak team needs to add ANTHROPIC_API_KEY to the server settings.",
  he: "משבקני עדיין לא מופעל. צוות משבק צריך להוסיף ANTHROPIC_API_KEY להגדרות השרת.",
};
const BUSY = {
  ar: "وصلت للحد الأقصى من الرسائل لهذه الساعة. جرّب مجددًا بعد قليل.",
  en: "You've reached the message limit for this hour. Please try again a bit later.",
  he: "הגעת למגבלת ההודעות לשעה זו. נסו שוב מעט מאוחר יותר.",
};

const text = (s: string, status = 200) => new Response(s, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer || (viewer.status !== "active" && viewer.role !== "admin")) return text("unauthorized", 401);
  let body: { messages?: Msg[]; locale?: string };
  try { body = await req.json(); } catch { return text("bad request", 400); }
  const locale = isLocale(body.locale ?? "") ? (body.locale as "ar" | "en" | "he") : "ar";
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages.at(-1)!.role !== "user") return text("bad request", 400);

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return text(NO_KEY[locale]);
  if (limited(viewer.id)) return text(BUSY[locale]);

  const client = new Anthropic({ apiKey: key });
  const system = await mashbakniSystem(viewer, locale);
  const stream = client.messages.stream({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
    max_tokens: 1500,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages,
  });

  const enc = new TextEncoder();
  const out = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("text", (delta) => controller.enqueue(enc.encode(delta)));
      stream.on("end", () => controller.close());
      stream.on("error", (e) => {
        console.error("[mashbakni]", e.message);
        controller.enqueue(enc.encode(locale === "ar" ? "\n\nحدث خطأ مؤقت. حاول مرة أخرى." : locale === "he" ? "\n\nאירעה שגיאה זמנית. נסו שוב." : "\n\nA temporary error happened. Please try again."));
        controller.close();
      });
    },
    cancel() { stream.abort(); },
  });
  return new Response(out, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" } });
}
