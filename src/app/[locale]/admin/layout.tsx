import type { ReactNode } from "react";
import { Shell } from "@/components/app/Shell";
import type { NavItem } from "@/components/app/NavLinks";
import { repo } from "@/lib/data";
import { pageLocale } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale, t } = await pageLocale(params);
  const viewer = await requireAdmin(locale);
  const [stats, msgs] = await Promise.all([repo.adminStats(), repo.listMessages()]);
  const b = `/${locale}/admin`;
  const N = t.admin.nav;
  const [gP, gC, gM, gS] = ({ ar: ["الأعضاء", "المحتوى", "التواصل", "النظام"], en: ["People", "Content", "Communication", "System"], he: ["חברים", "תוכן", "תקשורת", "מערכת"] } as const)[locale];
  const items: NavItem[] = [
    { href: b, label: N.overview, icon: "dashboard", exact: true },
    { href: `${b}/applications`, label: N.applications, icon: "inbox", badge: stats.pending, group: gP },
    { href: `${b}/members`, label: N.members, icon: "members", group: gP },
    { href: `${b}/events`, label: N.events, icon: "events", group: gC },
    { href: `${b}/jobs`, label: N.jobs, icon: "jobs", group: gC },
    { href: `${b}/companies`, label: N.companies, icon: "building", group: gC },
    { href: `${b}/programs`, label: N.programs, icon: "layers", group: gC },
    { href: `${b}/reviews`, label: N.reviews, icon: "star", group: gC },
    { href: `${b}/faqs`, label: N.faqs, icon: "help", group: gC },
    { href: `${b}/notifications`, label: N.notifications, icon: "bell", group: gM },
    { href: `${b}/messages`, label: N.messages, icon: "mail", badge: msgs.filter((m) => !m.replied_at).length, group: gM },
    { href: `${b}/dropdowns`, label: N.dropdowns, icon: "file", group: gS },
    { href: `${b}/settings`, label: N.settings, icon: "settings", group: gS },
  ];
  return <Shell locale={locale} t={t} viewer={viewer} items={items}>{children}</Shell>;
}
