import type { ReactNode } from "react";
import { Shell } from "@/components/app/Shell";
import type { NavItem } from "@/components/app/NavLinks";
import { memberDict } from "@/i18n/member";
import { repo } from "@/lib/data";
import { pageLocale } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function AppLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale, t } = await pageLocale(params);
  const M = memberDict[locale].nav;
  const viewer = await requireMember(locale);
  const [unread, cons, refs] = await Promise.all([repo.unreadCount(viewer.id), repo.listConnections(viewer.id), repo.listMyReferrals(viewer.id)]);
  const waiting = cons.filter((c) => c.direction === "incoming" && c.status === "pending").length
    + refs.filter((r) => r.direction === "incoming" && r.status === "pending").length;
  const b = `/${locale}/app`;
  const items: NavItem[] = [
    { href: b, label: M.home, icon: "home", exact: true },
    { href: `${b}/jobs`, label: M.jobs, icon: "jobs" },
    { href: `${b}/companies`, label: M.companies, icon: "building" },
    { href: `${b}/requests`, label: M.requests, icon: "requests", badge: waiting },
    { href: `${b}/mashbakni`, label: M.mashbakni, icon: "sparkles" },
    { href: `${b}/asks`, label: M.asks, icon: "asks" },
    { href: `${b}/members`, label: M.members, icon: "members" },
    { href: `${b}/events`, label: M.events, icon: "events" },
    { href: `${b}/connections`, label: M.network, icon: "connections" },
    { href: `${b}/notifications`, label: M.notifications, icon: "bell", badge: unread },
    { href: `${b}/profile`, label: M.profile, icon: "profile" },
  ];
  const mobile = [items[0], items[1], items[4], items[3], items[6]];
  return <Shell locale={locale} t={t} viewer={viewer} items={items} mobileItems={mobile} area="app">{children}</Shell>;
}
