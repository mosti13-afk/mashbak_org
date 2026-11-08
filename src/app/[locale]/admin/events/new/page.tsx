import Link from "next/link";
import { EventForm } from "@/components/admin/EventForm";
import { PageHeader } from "@/components/ui";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

export default async function NewEvent({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/${locale}/admin/events`} className="mb-4 inline-flex text-sm font-bold text-mist hover:text-navy">← {t.admin.nav.events}</Link>
      <PageHeader title={t.admin.newEvent} />
      <EventForm locale={locale} t={t} />
    </div>
  );
}
