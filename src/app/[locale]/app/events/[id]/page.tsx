import { notFound } from "next/navigation";
import { EventDetail } from "@/components/EventDetail";
import { repo } from "@/lib/data";
import { pageLocale } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function AppEvent({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, t } = await pageLocale(params);
  const v = await requireMember(locale);
  const e = await repo.getEvent((await params).id, v.id);
  if (!e || (e.status !== "published" && v.role !== "admin")) notFound();
  return <EventDetail e={e} locale={locale} t={t} viewer={v} backHref={`/${locale}/app/events`} />;
}
