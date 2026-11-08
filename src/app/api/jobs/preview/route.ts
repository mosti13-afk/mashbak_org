import { fetchJobFromLink } from "@/lib/careers";
import { getViewer } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Reads a job page link (careers site, LinkedIn-free) and returns fields to prefill "share a job". */
export async function GET(req: Request) {
  const v = await getViewer();
  if (!v || (v.status !== "active" && v.role !== "admin")) return new Response("unauthorized", { status: 401 });
  const url = new URL(req.url).searchParams.get("url") ?? "";
  if (!/^https:\/\//i.test(url)) return Response.json({ ok: false });
  const j = await fetchJobFromLink(url);
  return Response.json(j ? { ok: true, job: j } : { ok: false });
}
