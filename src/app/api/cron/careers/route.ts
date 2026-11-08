import { syncAll } from "@/lib/careers/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Daily careers import. Cloud Scheduler: GET /api/cron/careers with "Authorization: Bearer $CRON_SECRET". */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("unauthorized", { status: 401 });
  return Response.json({ results: await syncAll() });
}
export const POST = GET;
