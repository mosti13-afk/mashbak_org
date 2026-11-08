/* Notification categories and per-channel preferences. Safe to import from client and server code. */

export const CHANNELS = ["email", "whatsapp", "sms"] as const;
export type Channel = (typeof CHANNELS)[number];

export const CATEGORIES = ["requests", "updates", "events", "digest", "news"] as const;
export type Category = (typeof CATEGORIES)[number];

export type NotifyPrefs = Partial<Record<Category, Partial<Record<Channel, boolean>>>>;

/** What a new member receives before changing anything. Text messages stay off unless chosen. */
export const DEFAULT_PREFS: Record<Category, Record<Channel, boolean>> = {
  requests: { email: true, whatsapp: true, sms: false },
  updates: { email: true, whatsapp: true, sms: false },
  events: { email: true, whatsapp: true, sms: false },
  digest: { email: true, whatsapp: false, sms: false },
  news: { email: true, whatsapp: false, sms: false },
};

/** "account" covers transactional messages (application decisions, contact replies): always sent on enabled channels. */
export type TemplateCategory = Category | "account";

export function wants(prefs: NotifyPrefs | null | undefined, cat: TemplateCategory, ch: Channel) {
  if (cat === "account") return ch !== "sms";
  return prefs?.[cat]?.[ch] ?? DEFAULT_PREFS[cat][ch];
}

export function resolvePrefs(prefs: NotifyPrefs | null | undefined) {
  return Object.fromEntries(CATEGORIES.map((c) => [c, Object.fromEntries(CHANNELS.map((ch) => [ch, wants(prefs, c, ch)]))])) as Record<Category, Record<Channel, boolean>>;
}
