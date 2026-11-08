import { Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { closeAsk, replyAsk } from "@/app/actions";
import { BackLink, EmptyState } from "@/components/shell/page";
import { Avatar, Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { displayName, fmtRelative } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function AskPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const A = memberDict[locale].asks;
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const { id } = await params;
  const data = await repo.getAsk(id, v.id);
  if (!data) notFound();
  const { ask: a, replies } = data;
  const mine = a.member_id === v.id;
  const hidden = <input type="hidden" name="locale" value={locale} />;
  const b = `/${locale}/app`;
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href={`${b}/asks`} label={S.asks} />
      {sp((await searchParams).replied) && <Notice>{A.replied}</Notice>}
      <article>
        <Link href={`${b}/members/${a.member_id}`} className="flex items-center gap-3">
          <Avatar src={a.author.avatar_url} name={displayName(a.author, locale)} size={44} />
          <span className="min-w-0"><span className="row-title block">{displayName(a.author, locale)}</span><span className="row-sub block" dir="auto">{a.author.headline} · {fmtRelative(a.created_at, locale)}</span></span>
        </Link>
        <div className="mt-4 flex items-center gap-2">
          <span className={`badge ${a.kind === "ask" ? "badge-amber" : "badge-mint"}`}>{a.kind === "ask" ? A.asks : A.offers}</span>
          {a.status === "closed" && <span className="badge badge-gray">{A.closed}</span>}
        </div>
        <h1 className="mt-2 t-h1" dir="auto">{a.title}</h1>
        {a.body && <p className="mt-3 whitespace-pre-line text-[16px] leading-8 text-ink-2" dir="auto">{a.body}</p>}
        {!!a.tags.length && <div className="mt-3 flex flex-wrap gap-1.5">{a.tags.map((t) => <span key={t} className="chip" dir="auto">{t}</span>)}</div>}
        {mine && (
          <form action={closeAsk} className="mt-4">{hidden}<input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value={a.status === "open" ? "closed" : "open"} />
            <SubmitButton className="btn btn-outline btn-sm">{a.status === "open" ? A.close : A.reopen}</SubmitButton>
          </form>
        )}
      </article>

      <section className="mt-8">
        <h2 className="t-h2">{mine ? `${A.repliesTitle} (${replies.length})` : A.reply}</h2>
        <p className="t-small mb-4 mt-1 flex items-center gap-1"><Lock className="h-3.5 w-3.5" />{A.privateReplies}</p>
        {mine ? (replies.length === 0 ? <EmptyState title={A.noReplies} /> : (
          <ul className="space-y-5">
            {replies.map((r) => (
              <li key={r.id}>
                <p className="bubble whitespace-pre-line bg-white text-[15px] leading-7 text-ink-2 ring-1 ring-line" dir="auto">{r.message}</p>
                <div className="mt-3 flex items-center gap-3 px-1">
                  <Avatar src={r.author.avatar_url} name={displayName(r.author, locale)} size={34} />
                  <span className="min-w-0 flex-1"><span className="row-title block text-[14px]">{displayName(r.author, locale)}</span><span className="row-sub block" dir="auto">{r.author.headline}</span></span>
                  <Link href={`${b}/members/${r.member_id}`} className="btn btn-secondary btn-sm">{A.connect}</Link>
                </div>
              </li>
            ))}
          </ul>
        )) : a.my_reply ? <p className="rounded-[16px] bg-mint-soft p-4 text-center text-[15px] text-green-deep">{A.youReplied}</p>
          : a.status === "open" && (
            <form action={replyAsk} className="space-y-3">{hidden}<input type="hidden" name="ask_id" value={a.id} />
              <textarea name="message" required minLength={2} rows={4} placeholder={A.replyPh} aria-label={A.reply} className="textarea" dir="auto" />
              <SubmitButton className="btn btn-primary btn-lg w-full sm:w-auto">{A.reply}</SubmitButton>
            </form>
          )}
      </section>
    </div>
  );
}
