import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "./i18n/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];

  // Locale prefix
  if (!isLocale(first) && !pathname.startsWith("/auth")) {
    const pref = req.cookies.get("mb_locale")?.value;
    const accept = req.headers.get("accept-language") ?? "";
    const guess = isLocale(pref) ? pref : accept.startsWith("he") ? "he" : accept.startsWith("en") ? "en" : defaultLocale;
    const url = req.nextUrl.clone();
    url.pathname = `/${guess}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  let res = NextResponse.next({ request: req });

  // Refresh the Supabase session cookie when configured
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });
    await supabase.auth.getUser();
  }

  if (isLocale(first)) res.cookies.set("mb_locale", first, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|fonts|members|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf)$).*)"],
};
