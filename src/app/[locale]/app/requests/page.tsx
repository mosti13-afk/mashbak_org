import { redirect } from "next/navigation";
import { pageLocale, sp, type SearchParams } from "@/lib/page";

export default async function Requests({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const tab = sp((await searchParams).tab);
  redirect(`/${locale}/app/activity${tab === "sent" ? "?tab=sent" : ""}`);
}
