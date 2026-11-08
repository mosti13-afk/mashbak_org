import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { respondConnection } from "@/app/actions";
import { Avatar, Empty, PageHeader, StatusBadge, Tabs } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { repo } from "@/lib/data";
import { displayName, fmtRelative, waLink } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Connections({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const v = await requireMember(locale);
  const tab = sp((await searchParams).tab) ?? "accepted";
  const all = await repo.listConnections(v.id);
  const groups = {
    accepted: all.filter((c) => c.status === "accepted"),
    incoming: all.filter((c) => c.direction === "incoming" && c.status === "pending"),
    outgoing: all.filter((c) => c.direction === "outgoing" && c.status !== "accepted"),
  };
  const list = groups[tab as keyof typeof groups] ?? groups.accepted;
  const T = t.app.connections;
  const b = `/${locale}/app/connections`;
  return (
    <>
      <PageHeader title={T.title} />
      <Tabs items={[
        { href: b, label: T.accepted, active: tab === "accepted", count: groups.accepted.length },
        { href: `${b}?tab=incoming`, label: T.incoming, active: tab === "incoming", count: groups.incoming.length },
        { href: `${b}?tab=outgoing`, label: T.outgoing, active: tab === "outgoing", count: groups.outgoing.length },
      ]} />
      {list.length === 0 ? <Empty>{T.empty}</Empty> : (
        <ul className="space-y-3">
          {list.map((c) => {
            const name = displayName(c.other, locale);
            return (
              <li key={c.id} className="card p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <Link href={`/${locale}/app/members/${c.other.id}`}><Avatar src={c.other.avatar_url} name={name} size={52} /></Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/${locale}/app/members/${c.other.id}`} className="font-black text-navy-ink hover:underline">{name}</Link>
                    <p className="text-sm text-ink-2" dir="auto">{c.other.headline}{c.other.company ? ` · ${c.other.company}` : ""}</p>
                    <p className="mt-3 rounded-xl bg-paper p-3 text-sm leading-relaxed text-ink-2">{c.message}</p>
                    <p className="mt-2 text-xs text-mist">{fmtRelative(c.created_at, locale)}</p>
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto sm:flex-col">
                    {c.status === "accepted" && (c.phone ? (
                      <a href={waLink(c.phone, T.waText)} target="_blank" rel="noreferrer" className="btn btn-sm flex-1 bg-[#25d366] text-white hover:bg-[#1fb457]"><MessageCircle className="h-4 w-4" />{T.whatsapp}</a>
                    ) : <span className="text-xs text-mist">{T.noPhone}</span>)}
                    {c.status === "pending" && c.direction === "incoming" && (
                      <>
                        {[["1", T.accept, "btn btn-primary btn-sm flex-1"], ["0", T.decline, "btn btn-outline btn-sm flex-1"]].map(([a, l, cls]) => (
                          <form key={a} action={respondConnection} className="flex-1">
                            <input type="hidden" name="locale" value={locale} />
                            <input type="hidden" name="id" value={c.id} />
                            <input type="hidden" name="accept" value={a} />
                            <input type="hidden" name="redirect" value={a === "1" ? b : `${b}?tab=incoming`} />
                            <SubmitButton className={`${cls} w-full`}>{l}</SubmitButton>
                          </form>
                        ))}
                      </>
                    )}
                    {c.direction === "outgoing" && c.status !== "accepted" && <StatusBadge status={c.status} label={c.status === "declined" ? T.declined : T.pending} />}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
