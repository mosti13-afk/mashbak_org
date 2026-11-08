import { createAsk } from "@/app/actions";
import { BackLink, PageTitle } from "@/components/shell/page";
import { SubmitButton } from "@/components/ui/client";
import { memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function NewAsk({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const A = memberDict[locale].asks;
  const S = shellDict[locale];
  await requireMember(locale);
  const q = await searchParams;
  const kind = sp(q.kind) === "offer" ? "offer" : "ask";
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href={`/${locale}/app/asks`} label={S.asks} />
      <PageTitle title={S.asks} sub={A.sub} />
      <form action={createAsk} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <div className="seg">
          {(["ask", "offer"] as const).map((k) => (
            <label key={k} className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[10px] text-[14px] text-ink-2 has-[:checked]:bg-white has-[:checked]:font-bold has-[:checked]:text-navy has-[:checked]:shadow-[0_1px_2px_rgb(6_42_64/0.08)]">
              <input type="radio" name="kind" value={k} defaultChecked={k === kind} className="sr-only" />{k === "ask" ? A.newAsk : A.newOffer}
            </label>
          ))}
        </div>
        <div className="space-y-4 rounded-[20px] bg-white p-4 ring-1 ring-line sm:p-5">
          <label className="block"><span className="label">{kind === "ask" ? A.formTitleAsk : A.formTitleOffer}</span>
            <input name="title" required minLength={5} maxLength={140} defaultValue={sp(q.title) ?? ""} placeholder={A.titlePh} className="input" dir="auto" /></label>
          <textarea name="body" rows={5} placeholder={A.bodyPh} aria-label={A.bodyPh} className="textarea" dir="auto" />
          <label className="block"><span className="label">{A.tags}</span><input name="tags" className="input" dir="auto" placeholder="Product, Finance, CV" /></label>
        </div>
        <SubmitButton className="btn btn-primary btn-lg w-full">{A.publish}</SubmitButton>
      </form>
    </div>
  );
}
