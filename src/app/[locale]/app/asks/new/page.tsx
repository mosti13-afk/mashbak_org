import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { createAsk } from "@/app/actions";
import { SubmitButton } from "@/components/ui/client";
import { memberDict } from "@/i18n/member";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function NewAsk({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const A = memberDict[locale].asks;
  await requireMember(locale);
  const q = await searchParams;
  const kind = sp(q.kind) === "offer" ? "offer" : "ask";
  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/${locale}/app/asks`} className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-mist hover:text-navy"><ArrowRight className="h-4 w-4 ltr:rotate-180" />{A.title}</Link>
      <h1 className="mb-5 text-[26px] font-bold text-ink">{kind === "ask" ? A.formTitleAsk : A.formTitleOffer}</h1>
      <form action={createAsk} className="card space-y-4 p-5 sm:p-7">
        <input type="hidden" name="locale" value={locale} />
        <div className="grid grid-cols-2 gap-2">
          {(["ask", "offer"] as const).map((k) => (
            <label key={k} className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-line text-[14px] font-semibold has-[:checked]:border-navy has-[:checked]:bg-sky">
              <input type="radio" name="kind" value={k} defaultChecked={k === kind} className="sr-only" />{k === "ask" ? A.newAsk : A.newOffer}
            </label>
          ))}
        </div>
        <label className="block"><span className="label">{kind === "ask" ? A.formTitleAsk : A.formTitleOffer}</span>
          <input name="title" required minLength={5} maxLength={140} defaultValue={sp(q.title) ?? ""} placeholder={A.titlePh} className="input" dir="auto" /></label>
        <label className="block"><textarea name="body" rows={5} placeholder={A.bodyPh} className="textarea" dir="auto" /></label>
        <label className="block"><span className="label">{A.tags}</span><input name="tags" className="input" dir="auto" placeholder="Product, Finance, CV" /></label>
        <SubmitButton className="btn btn-primary btn-lg w-full">{A.publish}</SubmitButton>
      </form>
    </div>
  );
}
