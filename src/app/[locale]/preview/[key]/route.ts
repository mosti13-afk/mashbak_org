import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_OWNER_ID } from "@/lib/data/demo-seed";
import { isLocale } from "@/i18n/config";
import { PREVIEW_COOKIE, PREVIEW_KEY } from "@/lib/preview";
import { siteUrl } from "@/lib/site-url";
import { DEMO_COOKIE } from "@/lib/session";

/** /[locale]/preview/<key> enters the private preview as the owner; /[locale]/preview/exit leaves it. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ locale: string; key: string }> }) {
  const { locale: raw, key } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const jar = await cookies();
  const base = await siteUrl();
  void req;
  if (key === "exit") {
    jar.delete(PREVIEW_COOKIE); jar.delete(DEMO_COOKIE);
    return NextResponse.redirect(new URL(`/${locale}`, base));
  }
  if (key !== PREVIEW_KEY) return new NextResponse("Not found", { status: 404 });
  const opts = { path: "/", httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 14 };
  jar.set(PREVIEW_COOKIE, "1", opts);
  jar.set(DEMO_COOKIE, DEMO_OWNER_ID, opts);
  return NextResponse.redirect(new URL(`/${locale}/app`, base));
}
