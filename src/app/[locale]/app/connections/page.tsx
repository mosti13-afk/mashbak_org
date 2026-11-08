import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { BackLink, EmptyState, PageTitle } from "@/components/shell/page";
import { Avatar } from "@/components/ui";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { displayName, waLink } from "@/lib/format";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

/** My network: accepted chats, one tap to WhatsApp. Pending requests live in Activity. */
export default async function Connections({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  const S = shellDict[locale];
  const T = t.app.connections;
  const v = await requireMember(locale);
  const list = (await repo.listConnections(v.id)).filter((c) => c.status === "accepted");
  const b = `/${locale}/app`;
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href={`${b}/account`} label={S.account} />
      <PageTitle title={S.acc.network} />
      {list.length === 0 ? <EmptyState title={T.empty} action={<Link href={`${b}/members`} className="btn btn-primary">{S.members}</Link>} /> : (
        <div className="list">
          {list.map((c) => {
            const name = displayName(c.other, locale);
            return (
              <div key={c.id} className="row">
                <Link href={`${b}/members/${c.other.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar src={c.other.avatar_url} name={name} size={46} />
                  <span className="min-w-0"><span className="row-title block">{name}</span><span className="row-sub block" dir="auto">{[c.other.headline, c.other.company].filter(Boolean).join(" · ")}</span></span>
                </Link>
                {c.phone ? (
                  <a href={waLink(c.phone, T.waText)} target="_blank" rel="noopener noreferrer" aria-label={T.whatsapp} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white"><MessageCircle className="h-5 w-5" /></a>
                ) : <span className="t-small">{T.noPhone}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
