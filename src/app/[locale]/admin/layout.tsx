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
  const items: NavItem[] = [
    { href: b, label: N.overview, icon: "dashboard", exact: true },
    { href: `${b}/applications`, label: N.applications, icon: "inbox", badge: stats.pending },
    { href: `${b}/members`, label: N.members, icon: "members" },
    { href: `${b}/events`, label: N.events, icon: "events" },
    { href: `${b}/jobs`, label: N.jobs, icon: "jobs" },
    { href: `${b}/companies`, label: N.companies, icon: "building" },
    { href: `${b}/reviews`, label: N.reviews, icon: "star" },
    { href: `${b}/programs`, label: N.programs, icon: "layers" },
    { href: `${b}/dropdowns`, label: N.dropdowns, icon: "file" },
    { href: `${b}/notifications`, label: N.notifications, icon: "bell" },
    { href: `${b}/faqs`, label: N.faqs, icon: "help" },
    { href: `${b}/messages`, label: N.messages, icon: "mail", badge: msgs.filter((m) => !m.replied_at).length },
    { href: `${b}/settings`, label: N.settings, icon: "settings" },
  ];
  const mobile = [items[0], items[1], items[2], items[3], items[items.length - 1]];
  return <Shell locale={locale} t={t} viewer={viewer} items={items} mobileItems={mobile} area="admin">{children}</Shell>;
}
