import { redirect } from "next/navigation";
import { pageLocale, type LocaleParams } from "@/lib/page";

export default async function Notifications({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  redirect(`/${locale}/app/activity?tab=updates`);
}
