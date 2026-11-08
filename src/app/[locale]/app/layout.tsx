import type { ReactNode } from "react";
import { Shell } from "@/components/app/Shell";
import type { NavItem } from "@/components/app/NavLinks";
import { repo } from "@/lib/data";
import { pageLocale } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function AppLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale, t } = await pageLocale(params);
  const viewer = await requireMember(locale);
  const [unread, cons] = await Promise.all([repo.unreadCount(viewer.id), repo.listConnections(viewer.id)]);
  const incoming = cons.filter((c) => c.direction === "incoming" && c.status === "pending").length;
  const b = `/${locale}/app`;
  const items: NavItem[] = [
    { href: b, label: t.app.nav.home, icon: "home", exact: true },
    { href: `${b}/members`, label: t.app.nav.members, icon: "members" },
    { href: `${b}/connections`, label: t.app.nav.connections, icon: "connections", badge: incoming },
    { href: `${b}/jobs`, label: t.app.nav.jobs, icon: "jobs" },
    { href: `${b}/events`, label: t.app.nav.events, icon: "events" },
    { href: `${b}/notifications`, label: t.app.nav.notifications, icon: "bell", badge: unread },
    { href: `${b}/profile`, label: t.app.nav.profile, icon: "profile" },
  ];
  const mobile = [items[0], items[1], items[3], items[4], { ...items[5] }];
  return <Shell locale={locale} t={t} viewer={viewer} items={items} mobileItems={mobile} area="app">{children}</Shell>;
}
