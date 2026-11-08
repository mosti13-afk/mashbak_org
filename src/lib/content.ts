// Default CMS content, captured from the live mashbak.org (Nov 2026). Used by demo mode and the
// "Install defaults" action. Image paths point to files bundled in /public/live.
import live from "./live-content.json";
import type { DropdownOption, Faq, MemberReview, Program, SiteSettings } from "./types";

type LiveProgram = Omit<Program, "color" | "icon">;

export const defaultPrograms: Program[] = (live.programs as unknown as LiveProgram[]).map((p) => ({ ...p, color: "#0b486d", icon: "network" }));
export const defaultFaqs: Faq[] = live.faqs as unknown as Faq[];
export const defaultReviews: MemberReview[] = (live.reviews as unknown as Omit<MemberReview, "created_at">[]).map((r) => ({ ...r, created_at: "2026-11-01T00:00:00Z" }));
export const defaultSettings: SiteSettings = live.settings as SiteSettings;
export const defaultDropdowns: DropdownOption[] = (live.dropdowns as { type: string; key: string; is_active: boolean; sort_order: number }[]).map((d, i) => ({
  id: i + 1, type: d.type, key: d.key, label: {}, sort_order: d.sort_order, is_active: d.is_active, status: "approved",
}));
