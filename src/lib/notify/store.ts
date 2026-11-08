import "server-only";
import { demoActive } from "@/lib/preview";
import { supabaseServer } from "@/lib/supabase/server";
import { clearTemplateCache, demoLog } from "./index";

/* Admin-side reads/writes for notification templates, the delivery log and broadcasts (RLS: admins only). */

export interface TemplateRow {
  key: string; subject: Record<string, string>; body: Record<string, string>;
  whatsapp_template: { name?: string; lang?: string }; email_enabled: boolean; whatsapp_enabled: boolean;
}
export interface LogRow { id?: string; channel: string; template: string | null; recipient: string; status: string; error: string | null; created_at: string; body?: string | null; provider?: string | null; subject?: string }

const demoTemplates = new Map<string, TemplateRow>();

export async function listTemplateRows(): Promise<TemplateRow[]> {
  if (await demoActive()) return [...demoTemplates.values()];
  const s = await supabaseServer();
  const { data } = await s.from("notification_templates").select("*");
  return (data ?? []) as TemplateRow[];
}

export async function saveTemplateRow(row: TemplateRow) {
  clearTemplateCache();
  if (await demoActive()) { demoTemplates.set(row.key, row); return; }
  const s = await supabaseServer();
  const { error } = await s.from("notification_templates").upsert({ ...row, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

export async function listLog(limit = 150): Promise<LogRow[]> {
  if (await demoActive()) return demoLog.slice(0, limit).map((r) => ({ ...r, error: r.error ?? null, body: r.body ?? r.subject ?? null, created_at: r.at }));
  const s = await supabaseServer();
  const { data } = await s.from("message_log").select("*").order("created_at", { ascending: false }).limit(limit);
  return (data ?? []) as LogRow[];
}

export async function recordBroadcast(b: { title: string; body: string; channels: string[]; audience: string; recipients: number; created_by: string }) {
  if (await demoActive()) return;
  const s = await supabaseServer();
  await s.from("broadcasts").insert({ ...b, title: { ar: b.title, en: b.title, he: b.title }, body: { ar: b.body, en: b.body, he: b.body } });
}
