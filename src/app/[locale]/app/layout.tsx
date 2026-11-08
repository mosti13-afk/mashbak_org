import type { ReactNode } from "react";
import { BottomBar, Sidebar, TopBar } from "@/components/shell/AppNav";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { displayName } from "@/lib/format";
import { pageLocale } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function AppLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await pageLocale(params);
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const [unread, cons, refs] = await Promise.all([repo.unreadCount(v.id), repo.listConnections(v.id), repo.listMyReferrals(v.id)]);
  const waiting = cons.filter((c) => c.direction === "incoming" && c.status === "pending").length
    + refs.filter((r) => r.direction === "incoming" && r.status === "pending").length;
  const badge = waiting + unread;
  const base = `/${locale}/app`;
  return (
    <div className="min-h-dvh bg-sky lg:flex">
      <Sidebar base={base} S={S} badge={badge} me={{ name: displayName(v, locale), avatar: v.avatar_url, headline: v.headline }} />
      <div className="min-w-0 flex-1">
        <TopBar base={base} S={S} badge={badge} />
        <main className="mx-auto w-full max-w-[1080px] px-4 pb-32 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">{children}</main>
        <BottomBar base={base} S={S} />
      </div>
    </div>
  );
}
