import "server-only";

/*
 * Careers-site importer. Give it any careers URL and it figures out the platform:
 *   Workday (*.myworkdayjobs.com), Greenhouse, Lever, SmartRecruiters, Ashby, Comeet,
 *   or any page that publishes schema.org JobPosting data (most career pages and job pages do).
 * Every adapter returns the same normalized shape. Nothing here throws to the caller.
 */

export interface SyncedJob {
  external_id: string;
  title: string;
  url: string;
  location: string | null;
  posted_at: string | null;
  description?: string | null;
  job_type?: "full_time" | "part_time" | "contract" | "freelance";
  work_mode?: "onsite" | "hybrid" | "remote";
  is_managerial?: boolean;
}

export type Platform = "workday" | "greenhouse" | "lever" | "smartrecruiters" | "ashby" | "comeet" | "jsonld";
export interface FetchResult { ok: boolean; platform: Platform | null; jobs: SyncedJob[]; error?: string; company?: string | null }

const UA = "Mozilla/5.0 (compatible; MashbakJobsBot/1.0; +https://mashbak.org)";
const MAX = 400;

async function get(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { "User-Agent": UA, Accept: "application/json, text/html;q=0.9", ...(init?.headers ?? {}) }, signal: AbortSignal.timeout(20_000), cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} (${new URL(url).host})`);
  return res;
}

const ISRAEL = /israel|ישראל|إسرائيل|\bIL\b|ISR|tel[\s-]?aviv|haifa|jerusalem|yokneam|herzliya|herzlia|petah|petach|ra'?anana|netanya|be'?er|beer[\s-]?sheva|rehovot|kfar[\s-]?saba|ramat[\s-]?gan|hod[\s-]?hasharon|caesarea|nazareth|airport city|matam|modiin|modi'in|rosh ha'?ayin|holon|or yehuda|yakum|migdal|karmiel|kiryat|nesher|lod|ashdod|ashkelon|sderot|omer|hadera|nahariya|תל אביב|חיפה|ירושלים|יקנעם|הרצליה|פתח תקווה|רעננה|נתניה|באר שבע|רחובות|כפר סבא|רמת גן|נצרת|קיסריה/i;
export const inIsrael = (loc: string | null | undefined) => !loc || ISRAEL.test(loc);

const MANAGER = /\b(manager|head of|director|lead|vp|vice president|chief|team lead|group lead|principal)\b|מנהל|ראש צוות|ראש קבוצה|مدير|قائد/i;
const strip = (html?: string | null) => (html ?? "").replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, " ").replace(/<br\s*\/?>|<\/p>|<\/li>/gi, "\n").replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*\n+/g, "\n\n").trim();
const typeOf = (s?: string | null): SyncedJob["job_type"] => {
  const t = (s ?? "").toLowerCase();
  return /part/.test(t) ? "part_time" : /contract|temporary|temp/.test(t) ? "contract" : /freelance/.test(t) ? "freelance" : "full_time";
};
const modeOf = (s?: string | null): SyncedJob["work_mode"] => {
  const t = (s ?? "").toLowerCase();
  return /remote|telecommute/.test(t) ? "remote" : /hybrid/.test(t) ? "hybrid" : "onsite";
};
// "Product/Project/Account Manager" are usually individual-contributor roles unless they also say group/head/director/lead
const IC_MANAGER = /\b(product|project|program|account|key account|customer success|success|partner|community|office|case|sales|marketing operations)\s+manager\b/i;
const SENIOR_MGMT = /\b(group|head|director|vp|vice president|chief|lead|leader|managers)\b|ראש|מנהל.? קבוצה|قائد|مدير قسم/i;
export const looksManagerial = (title: string) => MANAGER.test(title) && (!IC_MANAGER.test(title) || SENIOR_MGMT.test(title.replace(IC_MANAGER, "")));
const finish = (j: SyncedJob): SyncedJob => ({ ...j, title: j.title.trim().slice(0, 200), is_managerial: j.is_managerial ?? looksManagerial(j.title) });

/* ---------- detection ---------- */
export function detect(raw: string): { platform: Platform; key: string; host?: string } | null {
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return null; }
  const h = u.hostname.toLowerCase();
  const parts = u.pathname.split("/").filter(Boolean);
  if (h.endsWith("myworkdayjobs.com")) {
    const site = parts.filter((p) => !/^[a-z]{2}-[A-Z]{2}$/.test(p) && p !== "job" && p !== "details")[0];
    return site ? { platform: "workday", key: site, host: u.host } : null;
  }
  if (h.includes("greenhouse.io")) {
    const token = h.startsWith("boards-api") ? parts[2] : parts[0] === "embed" ? u.searchParams.get("for") ?? "" : parts[0];
    return token ? { platform: "greenhouse", key: token } : null;
  }
  if (h === "jobs.lever.co" || h === "api.lever.co") return parts[0] ? { platform: "lever", key: h === "api.lever.co" ? parts[2] : parts[0] } : null;
  if (h.endsWith("smartrecruiters.com")) {
    const id = h.startsWith("api.") ? parts[2] : parts[0];
    return id ? { platform: "smartrecruiters", key: id } : null;
  }
  if (h === "jobs.ashbyhq.com") return parts[0] ? { platform: "ashby", key: parts[0] } : null;
  if (h.endsWith("comeet.com") || h.endsWith("comeet.co")) return { platform: "comeet", key: u.toString() };
  return { platform: "jsonld", key: u.toString() };
}

/* ---------- adapters ---------- */
async function workday(host: string, site: string, filter: boolean): Promise<SyncedJob[]> {
  const tenant = host.split(".")[0];
  const api = `https://${host}/wday/cxs/${tenant}/${site}/jobs`;
  const out: SyncedJob[] = [];
  for (let offset = 0; offset < MAX; offset += 20) {
    const res = await get(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appliedFacets: {}, limit: 20, offset, searchText: filter ? "Israel" : "" }) });
    const data = (await res.json()) as { total?: number; jobPostings?: { title: string; externalPath: string; locationsText?: string; postedOn?: string; bulletFields?: string[]; timeType?: string }[] };
    const list = data.jobPostings ?? [];
    for (const p of list) {
      out.push(finish({
        external_id: p.bulletFields?.[0] ?? p.externalPath, title: p.title, url: `https://${host}/${site}${p.externalPath}`,
        location: p.locationsText ?? null, posted_at: null, job_type: typeOf(p.timeType),
      }));
    }
    if (list.length < 20 || (data.total && offset + 20 >= data.total)) break;
  }
  return out;
}

async function greenhouse(token: string): Promise<SyncedJob[]> {
  const res = await get(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`);
  const data = (await res.json()) as { jobs: { id: number; title: string; absolute_url: string; location?: { name?: string }; updated_at?: string; content?: string }[] };
  return data.jobs.map((j) => finish({
    external_id: String(j.id), title: j.title, url: j.absolute_url, location: j.location?.name ?? null, posted_at: j.updated_at ?? null,
    description: strip(j.content ? j.content.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&") : "").slice(0, 6000),
  }));
}

async function lever(company: string): Promise<SyncedJob[]> {
  const res = await get(`https://api.lever.co/v0/postings/${company}?mode=json`);
  const data = (await res.json()) as { id: string; text: string; hostedUrl: string; createdAt?: number; descriptionPlain?: string; workplaceType?: string; categories?: { location?: string; commitment?: string; allLocations?: string[] } }[];
  return data.map((j) => finish({
    external_id: j.id, title: j.text, url: j.hostedUrl, location: j.categories?.allLocations?.join(", ") || j.categories?.location || null,
    posted_at: j.createdAt ? new Date(j.createdAt).toISOString() : null, description: (j.descriptionPlain ?? "").slice(0, 6000),
    job_type: typeOf(j.categories?.commitment), work_mode: modeOf(j.workplaceType),
  }));
}

async function smartrecruiters(id: string, filter: boolean): Promise<SyncedJob[]> {
  const out: SyncedJob[] = [];
  for (let offset = 0; offset < MAX; offset += 100) {
    const res = await get(`https://api.smartrecruiters.com/v1/companies/${id}/postings?limit=100&offset=${offset}${filter ? "&country=il" : ""}`);
    const data = (await res.json()) as { totalFound: number; content: { id: string; name: string; releasedDate?: string; location?: { city?: string; country?: string; remote?: boolean; fullLocation?: string }; typeOfEmployment?: { label?: string } }[] };
    for (const j of data.content) {
      out.push(finish({
        external_id: j.id, title: j.name, url: `https://jobs.smartrecruiters.com/${id}/${j.id}`,
        location: j.location?.fullLocation ?? ([j.location?.city, j.location?.country].filter(Boolean).join(", ") || null),
        posted_at: j.releasedDate ?? null, job_type: typeOf(j.typeOfEmployment?.label), work_mode: j.location?.remote ? "remote" : undefined,
      }));
    }
    if (offset + 100 >= data.totalFound) break;
  }
  return out;
}

async function ashby(name: string): Promise<SyncedJob[]> {
  const res = await get(`https://api.ashbyhq.com/posting-api/job-board/${name}`);
  const data = (await res.json()) as { jobs: { id: string; title: string; jobUrl: string; location?: string; publishedAt?: string; employmentType?: string; isRemote?: boolean; descriptionPlain?: string; secondaryLocations?: { location: string }[] }[] };
  return data.jobs.map((j) => finish({
    external_id: j.id, title: j.title, url: j.jobUrl, location: [j.location, ...(j.secondaryLocations ?? []).map((x) => x.location)].filter(Boolean).join(", ") || null,
    posted_at: j.publishedAt ?? null, job_type: typeOf(j.employmentType), work_mode: j.isRemote ? "remote" : undefined, description: (j.descriptionPlain ?? "").slice(0, 6000),
  }));
}

type LdJob = { "@type"?: string | string[]; title?: string; name?: string; url?: string; identifier?: string | { value?: string }; datePosted?: string; description?: string;
  employmentType?: string | string[]; jobLocationType?: string; hiringOrganization?: { name?: string }; jobLocation?: unknown; applicantLocationRequirements?: unknown };
function ldLocation(l: unknown): string | null {
  const arr = Array.isArray(l) ? l : l ? [l] : [];
  const names = arr.map((x) => {
    const a = (x as { address?: { addressLocality?: string; addressRegion?: string; addressCountry?: string | { name?: string } } })?.address;
    if (!a) return (x as { name?: string })?.name ?? "";
    const country = typeof a.addressCountry === "string" ? a.addressCountry : a.addressCountry?.name;
    return [a.addressLocality, a.addressRegion, country].filter(Boolean).join(", ");
  }).filter(Boolean);
  return names.length ? names.join(" | ") : null;
}
function ldBlocks(html: string): LdJob[] {
  const out: LdJob[] = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (n: unknown): void => {
        if (!n || typeof n !== "object") return;
        if (Array.isArray(n)) { n.forEach(walk); return; }
        const o = n as Record<string, unknown>;
        const t = o["@type"];
        if (t === "JobPosting" || (Array.isArray(t) && t.includes("JobPosting"))) out.push(o as LdJob);
        for (const k of ["@graph", "itemListElement", "item", "mainEntity"]) if (o[k]) walk(o[k]);
      };
      walk(JSON.parse(m[1].trim()));
    } catch { /* skip malformed block */ }
  }
  return out;
}
function fromLd(j: LdJob, pageUrl: string): SyncedJob {
  const id = typeof j.identifier === "string" ? j.identifier : j.identifier?.value;
  const url = j.url ? new URL(j.url, pageUrl).toString() : pageUrl;
  return finish({
    external_id: id || url, title: j.title || j.name || "", url, location: ldLocation(j.jobLocation) ?? (j.jobLocationType ? "Remote" : null),
    posted_at: j.datePosted ?? null, description: strip(j.description).slice(0, 6000),
    job_type: typeOf(Array.isArray(j.employmentType) ? j.employmentType.join(" ") : j.employmentType), work_mode: j.jobLocationType ? "remote" : undefined,
  });
}

async function jsonld(url: string): Promise<{ jobs: SyncedJob[]; company: string | null }> {
  const html = await (await get(url, { headers: { Accept: "text/html" } })).text();
  const blocks = ldBlocks(html);
  return { jobs: blocks.map((b) => fromLd(b, url)).filter((j) => j.title), company: blocks[0]?.hiringOrganization?.name ?? null };
}

async function comeet(url: string): Promise<SyncedJob[]> {
  const html = await (await get(url, { headers: { Accept: "text/html" } })).text();
  const m = html.match(/COMPANY_POSITIONS_DATA\s*=\s*(\[[\s\S]*?\]);/);
  if (m) {
    const list = JSON.parse(m[1]) as { uid: string; name: string; location?: { name?: string; city?: string; country?: string }; url_comeet_hosted_page?: string; url_active_page?: string; time_updated?: string; employment_type?: string; workplace_type?: string }[];
    return list.map((p) => finish({
      external_id: p.uid, title: p.name, url: p.url_active_page || p.url_comeet_hosted_page || url,
      location: p.location?.name ?? ([p.location?.city, p.location?.country].filter(Boolean).join(", ") || null),
      posted_at: p.time_updated ?? null, job_type: typeOf(p.employment_type), work_mode: modeOf(p.workplace_type),
    }));
  }
  return ldBlocks(html).map((b) => fromLd(b, url));
}

/** Fetches all open jobs from a careers URL. With filter, keeps jobs located in Israel (or with no location). */
export async function fetchCareers(careersUrl: string, opts: { israelOnly?: boolean } = {}): Promise<FetchResult> {
  const d = detect(careersUrl);
  if (!d) return { ok: false, platform: null, jobs: [], error: "invalid URL" };
  const filter = opts.israelOnly !== false;
  try {
    let jobs: SyncedJob[] = [];
    let company: string | null = null;
    switch (d.platform) {
      case "workday": jobs = await workday(d.host!, d.key, filter); break;
      case "greenhouse": jobs = await greenhouse(d.key); break;
      case "lever": jobs = await lever(d.key); break;
      case "smartrecruiters": jobs = await smartrecruiters(d.key, filter); break;
      case "ashby": jobs = await ashby(d.key); break;
      case "comeet": jobs = await comeet(d.key); break;
      case "jsonld": ({ jobs, company } = await jsonld(d.key)); break;
    }
    const seen = new Set<string>();
    jobs = jobs.filter((j) => j.title && !seen.has(j.external_id) && seen.add(j.external_id)).filter((j) => !filter || inIsrael(j.location)).slice(0, MAX);
    return { ok: true, platform: d.platform, jobs, company };
  } catch (e) {
    return { ok: false, platform: d.platform, jobs: [], error: (e as Error).message.slice(0, 300) };
  }
}

/** Reads a single job page (any site publishing JobPosting data) to prefill "share a job". */
export async function fetchJobFromLink(url: string): Promise<(SyncedJob & { company: string | null }) | null> {
  try {
    const d = detect(url);
    if (!d) return null;
    if (d.platform === "greenhouse") {
      const id = new URL(url).pathname.match(/jobs\/(\d+)/)?.[1];
      if (id) {
        const j = (await (await get(`https://boards-api.greenhouse.io/v1/boards/${d.key}/jobs/${id}`)).json()) as { id: number; title: string; absolute_url: string; location?: { name?: string }; content?: string; updated_at?: string };
        return { ...finish({ external_id: String(j.id), title: j.title, url: j.absolute_url, location: j.location?.name ?? null, posted_at: j.updated_at ?? null, description: strip((j.content ?? "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")).slice(0, 6000) }), company: null };
      }
    }
    if (d.platform === "lever") {
      const id = new URL(url).pathname.split("/").filter(Boolean)[1];
      if (id) {
        const j = (await (await get(`https://api.lever.co/v0/postings/${d.key}/${id}`)).json()) as { id: string; text: string; hostedUrl: string; descriptionPlain?: string; categories?: { location?: string; commitment?: string }; workplaceType?: string };
        return { ...finish({ external_id: j.id, title: j.text, url: j.hostedUrl, location: j.categories?.location ?? null, posted_at: null, description: j.descriptionPlain ?? "", job_type: typeOf(j.categories?.commitment), work_mode: modeOf(j.workplaceType) }), company: null };
      }
    }
    if (d.platform === "workday") {
      const u = new URL(url);
      const tenant = u.host.split(".")[0];
      const path = u.pathname.replace(/^\/[a-z]{2}-[A-Z]{2}/, "").replace(`/${d.key}`, "");
      const res = await get(`https://${u.host}/wday/cxs/${tenant}/${d.key}${path}`);
      const j = (await res.json()) as { jobPostingInfo?: { title: string; jobDescription?: string; location?: string; jobReqId?: string; timeType?: string; startDate?: string; externalUrl?: string }; hiringOrganization?: { name?: string } };
      if (j.jobPostingInfo) {
        const p = j.jobPostingInfo;
        return { ...finish({ external_id: p.jobReqId ?? url, title: p.title, url: p.externalUrl ?? url, location: p.location ?? null, posted_at: p.startDate ?? null, description: strip(p.jobDescription).slice(0, 6000), job_type: typeOf(p.timeType) }), company: j.hiringOrganization?.name ?? null };
      }
    }
    const html = await (await get(url, { headers: { Accept: "text/html" } })).text();
    const b = ldBlocks(html)[0];
    if (b) return { ...fromLd(b, url), url, company: b.hiringOrganization?.name ?? null };
    const title = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1] ?? html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const desc = html.match(/<meta[^>]+(?:property=["']og:description["']|name=["']description["'])[^>]+content=["']([^"']+)/i)?.[1];
    return title ? { ...finish({ external_id: url, title: strip(title), url, location: null, posted_at: null, description: desc ? strip(desc) : null }), company: null } : null;
  } catch {
    return null;
  }
}
