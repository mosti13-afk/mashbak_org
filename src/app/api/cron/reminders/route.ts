import { sendEventReminders } from "@/lib/notify/hooks";

export const dynamic = "force-dynamic";

/** Hit every 15 minutes by Google Cloud Scheduler with header "Authorization: Bearer $CRON_SECRET". */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("unauthorized", { status: 401 });
  const res = await sendEventReminders();
  return Response.json(res);
}
export const POST = GET;
