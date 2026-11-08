import { notFound } from "next/navigation";
import { EventDetail } from "@/components/EventDetail";
import { tr } from "@/i18n/config";
import { repo } from "@/lib/data";
import { pageLocale } from "@/lib/page";
import { getViewer } from "@/lib/session";

type P = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: P) {
  const { locale } = await pageLocale(params);
  const e = await repo.getEvent((await params).id);
  return { title: e ? tr(e.title, locale) : undefined };
}

export default async function EventPage({ params }: P) {
  const { locale, t } = await pageLocale(params);
  const viewer = await getViewer();
  const e = await repo.getEvent((await params).id, viewer?.id);
  if (!e || e.status !== "published") notFound();
  return (
    <div className="container-x py-6 pb-28 sm:py-10 lg:pb-16">
      <EventDetail e={e} locale={locale} t={t} viewer={viewer} backHref={`/${locale}/events`} />
    </div>
  );
}
