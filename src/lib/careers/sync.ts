import "server-only";
import { repo } from "@/lib/data";
import type { Company } from "@/lib/types";
import { fetchCareers } from "./index";

/** Imports the open jobs of one company from its careers site. */
export async function syncCompany(c: Company) {
  if (!c.careers_url) return { ok: false, error: "no careers URL", added: 0, updated: 0, closed: 0, total: 0 };
  const r = await fetchCareers(c.careers_url, { israelOnly: c.location_filter !== "all" });
  if (!r.ok) {
    await repo.saveSyncedJobs(c, [], `error: ${r.error}`).catch(() => {});
    return { ok: false, error: r.error, added: 0, updated: 0, closed: 0, total: 0 };
  }
  const res = await repo.saveSyncedJobs(c, r.jobs, `ok (${r.platform})`);
  return { ok: true, ...res, total: r.jobs.length, platform: r.platform };
}

/** Scheduled sync of every company with a careers URL (a few at a time to be polite to career sites). */
export async function syncAll(limit = 60) {
  const all = (await repo.listCompaniesAll()).filter((c) => c.careers_url && c.sync_enabled)
    .sort((a, b) => (a.last_synced_at ?? "").localeCompare(b.last_synced_at ?? "")).slice(0, limit);
  const results: { company: string; ok: boolean; total: number; error?: string }[] = [];
  for (let i = 0; i < all.length; i += 4) {
    const batch = await Promise.all(all.slice(i, i + 4).map(async (c) => ({ company: c.slug, ...(await syncCompany(c)) })));
    results.push(...batch.map((b) => ({ company: b.company, ok: b.ok, total: b.total, error: b.error })));
  }
  return results;
}
