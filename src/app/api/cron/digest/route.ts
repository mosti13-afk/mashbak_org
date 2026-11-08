import { sendWeeklyDigest } from "@/lib/notify/hooks";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Weekly digest. Cloud Scheduler (e.g. Sunday 09:00): GET /api/cron/digest with "Authorization: Bearer $CRON_SECRET". */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("unauthorized", { status: 401 });
  return Response.json(await sendWeeklyDigest());
}
export const POST = GET;
