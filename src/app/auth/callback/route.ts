import { NextResponse, type NextRequest } from "next/server";
import { siteUrl } from "@/lib/site-url";
import { supabaseServer } from "@/lib/supabase/server";

/** OAuth (Google / LinkedIn) and email-link landing: exchange the code, then send members to the app. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const raw = url.searchParams.get("next") ?? "/ar/app";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/ar/app";
  const base = await siteUrl();
  const locale = next.split("/")[1] || "ar";
  if (!code) return NextResponse.redirect(new URL(`/${locale}/login?error=oauth`, base));
  const s = await supabaseServer();
  const { data, error } = await s.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL(`/${locale}/login?error=oauth`, base));
  const { data: me } = await s.from("profiles").select("role,status").eq("id", data.user.id).maybeSingle();
  if (me?.role === "admin") return NextResponse.redirect(new URL(`/${locale}/admin`, base));
  if (me?.status !== "active") return NextResponse.redirect(new URL(`/${locale}/login`, base));
  return NextResponse.redirect(new URL(next, base));
}
