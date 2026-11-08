import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { closeAsk, replyAsk } from "@/app/actions";
import { Avatar, Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { memberDict } from "@/i18n/member";
import { repo } from "@/lib/data";
import { displayName, fmtRelative } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function AskPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const A = memberDict[locale].asks;
  const v = await requireMember(locale);
  const { id } = await params;
  const data = await repo.getAsk(id, v.id);
  if (!data) notFound();
  const { ask: a, replies } = data;
  const mine = a.member_id === v.id;
  const hidden = <input type="hidden" name="locale" value={locale} />;
  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/${locale}/app/asks`} className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-mist hover:text-navy"><ArrowRight className="h-4 w-4 ltr:rotate-180" />{A.title}</Link>
      {sp((await searchParams).replied) && <Notice>{A.replied}</Notice>}
      <article className="card p-5 sm:p-7">
        <div className="flex items-center gap-2">
          <span className={`badge ${a.kind === "ask" ? "badge-amber" : "badge-mint"}`}>{a.kind === "ask" ? A.asks : A.offers}</span>
          {a.status === "closed" && <span className="badge badge-gray">{A.closed}</span>}
          <span className="ms-auto text-[12px] text-mist">{fmtRelative(a.created_at, locale)}</span>
        </div>
        <h1 className="mt-3 text-[22px] font-bold leading-snug text-ink" dir="auto">{a.title}</h1>
        {a.body && <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-ink-2" dir="auto">{a.body}</p>}
        {!!a.tags.length && <div className="mt-3 flex flex-wrap gap-1">{a.tags.map((t) => <span key={t} className="rounded-full bg-sky px-2 py-0.5 text-[12px] text-navy ring-1 ring-line" dir="auto">{t}</span>)}</div>}
        <Link href={`/${locale}/app/members/${a.member_id}`} className="mt-5 flex items-center gap-3 border-t border-line pt-4">
          <Avatar src={a.author.avatar_url} name={displayName(a.author, locale)} size={40} />
          <span><span className="block font-semibold text-ink">{displayName(a.author, locale)}</span><span className="block text-[12px] text-ink-2" dir="auto">{a.author.headline}</span></span>
        </Link>
        {mine && (
          <form action={closeAsk} className="mt-4">{hidden}<input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value={a.status === "open" ? "closed" : "open"} />
            <SubmitButton className="btn btn-ghost btn-sm">{a.status === "open" ? A.close : A.reopen}</SubmitButton>
          </form>
        )}
      </article>

      {mine ? (
        <section className="mt-5">
          <h2 className="mb-1 font-bold text-ink">{A.repliesTitle} ({replies.length})</h2>
          <p className="mb-3 flex items-center gap-1 text-[12px] text-mist"><Lock className="h-3 w-3" />{A.privateReplies}</p>
          {replies.length === 0 ? <p className="card p-5 text-center text-[14px] text-mist">{A.noReplies}</p> : (
            <ul className="space-y-3">
              {replies.map((r) => (
                <li key={r.id} className="card p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={r.author.avatar_url} name={displayName(r.author, locale)} size={38} />
                    <div className="min-w-0 flex-1"><p className="font-semibold text-ink">{displayName(r.author, locale)}</p><p className="truncate text-[12px] text-ink-2" dir="auto">{r.author.headline}</p></div>
                    <Link href={`/${locale}/app/members/${r.member_id}`} className="btn btn-outline btn-sm">{A.connect}</Link>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-[14px] leading-6 text-ink-2" dir="auto">{r.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : a.my_reply ? (
        <p className="card mt-5 p-5 text-center text-[14px] text-green-deep">{A.youReplied}</p>
      ) : a.status === "open" && (
        <form action={replyAsk} className="card mt-5 space-y-3 p-5">
          {hidden}<input type="hidden" name="ask_id" value={a.id} />
          <label className="block"><span className="label">{A.reply}</span><textarea name="message" required minLength={2} rows={4} placeholder={A.replyPh} className="textarea" dir="auto" /></label>
          <p className="flex items-center gap-1 text-[12px] text-mist"><Lock className="h-3 w-3" />{A.privateReplies}</p>
          <SubmitButton className="btn btn-primary">{A.reply}</SubmitButton>
        </form>
      )}
    </div>
  );
}
