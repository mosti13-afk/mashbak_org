import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/ar/app";
  if (code) {
    const s = await supabaseServer();
    await s.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/ar/app", url.origin));
}
