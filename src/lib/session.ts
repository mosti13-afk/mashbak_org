import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { isDemo } from "./env";
import { repo } from "./data";
import { supabaseServer } from "./supabase/server";
import type { Profile } from "./types";

export const DEMO_COOKIE = "mb_demo_uid";

/** The signed-in member (or null). Cached per request. */
export const getViewer = cache(async (): Promise<Profile | null> => {
  if (isDemo) {
    const id = (await cookies()).get(DEMO_COOKIE)?.value;
    return id ? repo.getProfile(id) : null;
  }
  const s = await supabaseServer();
  const { data } = await s.auth.getUser();
  if (!data.user) return null;
  return repo.getProfile(data.user.id);
});

export async function requireMember(locale: Locale): Promise<Profile> {
  const v = await getViewer();
  if (!v) redirect(`/${locale}/login`);
  if (v.status !== "active" && v.role !== "admin") redirect(`/${locale}/login?pending=1`);
  return v;
}

export async function requireAdmin(locale: Locale): Promise<Profile> {
  const v = await requireMember(locale);
  if (v.role !== "admin") redirect(`/${locale}/app`);
  return v;
}
