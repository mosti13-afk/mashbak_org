import "server-only";
import { defaultFaqs, defaultPrograms, defaultReviews, defaultSettings } from "../content";
import { SITE_URL } from "../env";
import { supabaseAdmin, supabaseServer } from "../supabase/server";
import type {
  Application, AttendeeRow, Connection, ConnectionWithPeople, ContactMessage, EventItem, EventWithStats, Faq, Job,
  JobWithPoster, MemberReview, MiniProfile, Notification, Profile, Program, ReferralRequest, ReferralWithRequester,
  Registration, SiteSettings,
} from "../types";
import type { MemberCard, Repo } from "./repo";

const MINI = "id, full_name_ar, full_name_en, avatar_url, headline, company";

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

async function sb() {
  return supabaseServer();
}

async function withStats(events: EventItem[], viewerId?: string | null): Promise<EventWithStats[]> {
  if (!events.length) return [];
  const s = await sb();
  const ids = events.map((e) => e.id);
  const counts = check(await s.rpc("event_counts", { ids })) as { event_id: string; n: number }[];
  let mine: Registration[] = [];
  if (viewerId) {
    mine = check(await s.from("registrations").select("*").in("event_id", ids).eq("member_id", viewerId).neq("status", "cancelled")) as Registration[];
  }
  return events.map((e) => ({
    ...e,
    registered_count: counts.find((c) => c.event_id === e.id)?.n ?? 0,
    my_registration: mine.find((r) => r.event_id === e.id) ?? null,
  }));
}

async function connectionsFor(viewerId: string, otherIds: string[]) {
  if (!otherIds.length) return [] as Connection[];
  const s = await sb();
  const list = otherIds.join(",");
  return check(await s.from("connections").select("*")
    .or(`and(requester_id.eq.${viewerId},recipient_id.in.(${list})),and(recipient_id.eq.${viewerId},requester_id.in.(${list}))`)) as Connection[];
}

function pairMatch(c: Connection, a: string, b: string) {
  return (c.requester_id === a && c.recipient_id === b) || (c.requester_id === b && c.recipient_id === a);
}

async function jobsWithPoster(rows: (Job & { poster: MiniProfile })[], viewerId: string): Promise<JobWithPoster[]> {
  if (!rows.length) return [];
  const s = await sb();
  const refs = check(await s.from("referral_requests").select("*").in("job_id", rows.map((r) => r.id))) as ReferralRequest[];
  return rows.map((j) => ({
    ...j,
    my_referral: refs.find((r) => r.job_id === j.id && r.requester_id === viewerId) ?? null,
    referral_count: refs.filter((r) => r.job_id === j.id).length,
  }));
}

export const supabaseRepo: Repo = {
  async getSettings() {
    const s = await sb();
    const rows = check(await s.from("site_settings").select("key, value")) as { key: keyof SiteSettings; value: never }[];
    const out = structuredClone(defaultSettings);
    for (const r of rows) (out as unknown as Record<string, unknown>)[r.key] = r.value;
    return out;
  },
  async saveSettings(patch) {
    const s = await sb();
    const rows = Object.entries(patch).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    check(await s.from("site_settings").upsert(rows));
  },

  async listPrograms(o) {
    const s = await sb();
    let q = s.from("programs").select("*").order("sort_order");
    if (!o?.all) q = q.eq("is_active", true);
    return check(await q) as Program[];
  },
  async getProgram(slug) {
    const s = await sb();
    return check(await s.from("programs").select("*").eq("slug", slug).eq("is_active", true).maybeSingle()) as Program | null;
  },
  async upsertProgram(p) {
    const s = await sb();
    const { id, ...rest } = p;
    check(await (id ? s.from("programs").update(rest).eq("id", id) : s.from("programs").insert(rest)));
  },
  async deleteProgram(id) { const s = await sb(); check(await s.from("programs").delete().eq("id", id)); },

  async listFaqs(o) {
    const s = await sb();
    let q = s.from("faqs").select("*").order("sort_order");
    if (!o?.all) q = q.eq("is_active", true);
    return check(await q) as Faq[];
  },
  async upsertFaq(f) {
    const s = await sb();
    const { id, ...rest } = f;
    check(await (id ? s.from("faqs").update(rest).eq("id", id) : s.from("faqs").insert(rest)));
  },
  async deleteFaq(id) { const s = await sb(); check(await s.from("faqs").delete().eq("id", id)); },

  async listReviews(o) {
    const s = await sb();
    let q = s.from("member_reviews").select("*").order("sort_order");
    if (!o?.all) q = q.eq("is_active", true);
    return check(await q) as MemberReview[];
  },
  async upsertReview(r) {
    const s = await sb();
    const { id, created_at: _c, ...rest } = r;
    void _c;
    check(await (id ? s.from("member_reviews").update(rest).eq("id", id) : s.from("member_reviews").insert(rest)));
  },
  async deleteReview(id) { const s = await sb(); check(await s.from("member_reviews").delete().eq("id", id)); },

  async createApplication(a) { const s = await sb(); check(await s.from("applications").insert(a)); },
  async createContactMessage(m) { const s = await sb(); check(await s.from("contact_messages").insert(m)); },

  async listEvents({ when, viewerId, includeDrafts, publicOnly }) {
    const s = await sb();
    const nowIso = new Date().toISOString();
    let q = s.from("events").select("*");
    if (!includeDrafts) q = q.eq("status", "published");
    if (publicOnly) q = q.eq("members_only", false);
    if (when === "upcoming") q = q.gte("ends_at", nowIso).order("starts_at");
    else if (when === "past") q = q.lt("ends_at", nowIso).order("starts_at", { ascending: false });
    else q = q.order("starts_at", { ascending: false });
    return withStats(check(await q) as EventItem[], viewerId);
  },
  async getEvent(id, viewerId) {
    const s = await sb();
    const e = check(await s.from("events").select("*").eq("id", id).maybeSingle()) as EventItem | null;
    return e ? (await withStats([e], viewerId))[0] : null;
  },
  async registerForEvent(eventId) { const s = await sb(); check(await s.rpc("register_for_event", { p_event: eventId })); },
  async cancelRegistration(eventId) { const s = await sb(); check(await s.rpc("cancel_registration", { p_event: eventId })); },
  async upsertEvent(e) {
    const s = await sb();
    const { id, created_at: _c, ...rest } = e;
    void _c;
    if (id) { check(await s.from("events").update(rest).eq("id", id)); return id; }
    const row = check(await s.from("events").insert(rest).select("id").single()) as { id: string };
    return row.id;
  },
  async deleteEvent(id) { const s = await sb(); check(await s.from("events").delete().eq("id", id)); },
  async listAttendees(eventId) {
    const s = await sb();
    return check(await s.from("registrations").select(`*, member:profiles!registrations_member_id_fkey(${MINI}, email)`)
      .eq("event_id", eventId).order("created_at")) as AttendeeRow[];
  },
  async checkin(eventId, code) {
    const s = await sb();
    return check(await s.rpc("checkin", { p_event: eventId, p_code: code })) as { ok: true; already: boolean; name: string } | { ok: false };
  },

  async getProfile(id) {
    const s = await sb();
    return check(await s.from("profiles").select("*").eq("id", id).maybeSingle()) as Profile | null;
  },
  async updateProfile(id, patch) { const s = await sb(); check(await s.from("profiles").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id)); },
  async listMembers({ viewerId, q, sector, mentor }) {
    const s = await sb();
    let query = s.from("profiles").select("*").eq("status", "active").neq("id", viewerId).order("created_at", { ascending: false }).limit(200);
    if (sector) query = query.eq("sector", sector);
    if (mentor) query = query.eq("open_to_mentoring", true);
    if (q?.trim()) {
      const t = q.trim().replace(/[%,()]/g, " ");
      query = query.or(`full_name_ar.ilike.%${t}%,full_name_en.ilike.%${t}%,headline.ilike.%${t}%,company.ilike.%${t}%,sector.ilike.%${t}%,city.ilike.%${t}%`);
    }
    const people = check(await query) as Profile[];
    const cons = await connectionsFor(viewerId, people.map((p) => p.id));
    return people.map((p): MemberCard => ({ ...p, connection: cons.find((c) => pairMatch(c, viewerId, p.id)) ?? null }));
  },
  async getMember(id, viewerId) {
    const s = await sb();
    const p = check(await s.from("profiles").select("*").eq("id", id).eq("status", "active").maybeSingle()) as Profile | null;
    if (!p) return null;
    const [c] = await connectionsFor(viewerId, [id]);
    return { ...p, connection: c ?? null };
  },
  async requestConnection(from, to, message) {
    const s = await sb();
    const existing = await connectionsFor(from, [to]);
    if (existing.length || from === to) return;
    check(await s.from("connections").insert({ requester_id: from, recipient_id: to, message }));
  },
  async respondConnection(id, viewerId, accept) {
    const s = await sb();
    check(await s.from("connections").update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
      .eq("id", id).eq("recipient_id", viewerId).eq("status", "pending"));
  },
  async listConnections(viewerId) {
    const s = await sb();
    const rows = check(await s.from("connections")
      .select(`*, requester:profiles!connections_requester_id_fkey(${MINI}), recipient:profiles!connections_recipient_id_fkey(${MINI})`)
      .or(`requester_id.eq.${viewerId},recipient_id.eq.${viewerId}`).order("created_at", { ascending: false })) as
      (Connection & { requester: MiniProfile; recipient: MiniProfile })[];
    return Promise.all(rows.map(async ({ requester, recipient, ...c }): Promise<ConnectionWithPeople> => {
      const incoming = c.recipient_id === viewerId;
      const other = incoming ? requester : recipient;
      let phone: string | null = null;
      if (c.status === "accepted") phone = (check(await s.rpc("connection_phone", { p_other: other.id })) as string | null) ?? null;
      return { ...c, other, direction: incoming ? "incoming" : "outgoing", phone };
    }));
  },

  async listJobs({ viewerId, q, managerialOnly, includeClosed }) {
    const s = await sb();
    let query = s.from("jobs").select(`*, poster:profiles!jobs_posted_by_fkey(${MINI})`).order("created_at", { ascending: false });
    if (!includeClosed) query = query.eq("is_open", true).gt("expires_at", new Date().toISOString());
    if (managerialOnly) query = query.eq("is_managerial", true);
    if (q?.trim()) {
      const t = q.trim().replace(/[%,()]/g, " ");
      query = query.or(`title.ilike.%${t}%,company.ilike.%${t}%,city.ilike.%${t}%`);
    }
    return jobsWithPoster(check(await query) as (Job & { poster: MiniProfile })[], viewerId);
  },
  async getJob(id, viewerId) {
    const s = await sb();
    const j = check(await s.from("jobs").select(`*, poster:profiles!jobs_posted_by_fkey(${MINI})`).eq("id", id).maybeSingle()) as (Job & { poster: MiniProfile }) | null;
    return j ? (await jobsWithPoster([j], viewerId))[0] : null;
  },
  async createJob(viewerId, j) {
    const s = await sb();
    const row = check(await s.from("jobs").insert({ ...j, posted_by: viewerId }).select("id").single()) as { id: string };
    return row.id;
  },
  async setJobOpen(id, viewerId, open, asAdmin) {
    const s = await sb();
    let q = s.from("jobs").update({ is_open: open }).eq("id", id);
    if (!asAdmin) q = q.eq("posted_by", viewerId);
    check(await q);
  },
  async deleteJob(id) { const s = await sb(); check(await s.from("jobs").delete().eq("id", id)); },
  async requestReferral(jobId, viewerId, message, cvUrl) {
    const s = await sb();
    check(await s.from("referral_requests").insert({ job_id: jobId, requester_id: viewerId, message, cv_url: cvUrl ?? null }));
  },
  async listReferralsForJob(jobId) {
    const s = await sb();
    return check(await s.from("referral_requests").select(`*, requester:profiles!referral_requests_requester_id_fkey(${MINI})`)
      .eq("job_id", jobId).order("created_at", { ascending: false })) as ReferralWithRequester[];
  },
  async respondReferral(id, _viewerId, accept) {
    const s = await sb();
    check(await s.from("referral_requests").update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
      .eq("id", id).eq("status", "pending"));
  },

  async listNotifications(viewerId) {
    const s = await sb();
    return check(await s.from("notifications").select("*").eq("member_id", viewerId).order("created_at", { ascending: false }).limit(50)) as Notification[];
  },
  async unreadCount(viewerId) {
    const s = await sb();
    const { count } = await s.from("notifications").select("id", { count: "exact", head: true }).eq("member_id", viewerId).is("read_at", null);
    return count ?? 0;
  },
  async markAllRead(viewerId) {
    const s = await sb();
    check(await s.from("notifications").update({ read_at: new Date().toISOString() }).eq("member_id", viewerId).is("read_at", null));
  },

  async seedDefaults() {
    const s = await sb();
    let added = 0;
    const empty = async (table: string) => ((await s.from(table).select("id", { count: "exact", head: true })).count ?? 0) === 0;
    if (await empty("programs")) {
      check(await s.from("programs").insert(defaultPrograms.map(({ id: _id, ...p }) => p)));
      added += defaultPrograms.length;
    }
    if (await empty("faqs")) {
      check(await s.from("faqs").insert(defaultFaqs.map(({ id: _id, ...f }) => f)));
      added += defaultFaqs.length;
    }
    if (await empty("member_reviews")) {
      check(await s.from("member_reviews").insert(defaultReviews.map(({ id: _id, created_at: _c, ...r }) => r)));
      added += defaultReviews.length;
    }
    const keys = (check(await s.from("site_settings").select("key")) as { key: string }[]).map((r) => r.key);
    // Production default: only real member photos float on the homepage
    const settings = { ...defaultSettings, floatingAvatars: defaultReviews.map((r) => r.photo_url).filter(Boolean) as string[] };
    const missing = Object.entries(settings).filter(([k]) => !keys.includes(k)).map(([key, value]) => ({ key, value }));
    if (missing.length) { check(await s.from("site_settings").insert(missing)); added += missing.length; }
    return added;
  },
  async adminStats() {
    const s = await sb();
    const c = async (table: string, f: (q: ReturnType<ReturnType<typeof s.from>["select"]>) => unknown = (q) => q) => {
      const { count } = (await f(s.from(table).select("id", { count: "exact", head: true }))) as { count: number | null };
      return count ?? 0;
    };
    const nowIso = new Date().toISOString();
    const [members, pending, events, jobs, connections, referrals] = await Promise.all([
      c("profiles", (q) => q.eq("status", "active")),
      c("applications", (q) => q.eq("status", "pending")),
      c("events", (q) => q.eq("status", "published").gt("starts_at", nowIso)),
      c("jobs", (q) => q.eq("is_open", true)),
      c("connections", (q) => q.eq("status", "accepted")),
      c("referral_requests"),
    ]);
    return { members, pending, events, jobs, connections, referrals };
  },
  async listApplications(status) {
    const s = await sb();
    let q = s.from("applications").select("*").order("created_at", { ascending: false });
    if (status) q = q.eq("status", status);
    return check(await q) as Application[];
  },
  async reviewApplication(id, status, note) {
    const s = await sb();
    const { data: auth } = await s.auth.getUser();
    const app = check(await s.from("applications").update({ status, review_note: note, reviewed_at: new Date().toISOString(), reviewed_by: auth.user?.id })
      .eq("id", id).select("*").single()) as Application;
    if (status !== "approved") return;
    // If the applicant already has an account, activate it; otherwise invite them (the signup trigger activates on first login).
    const existing = check(await s.from("profiles").select("id").ilike("email", app.email).maybeSingle()) as { id: string } | null;
    if (existing) {
      check(await s.from("profiles").update({ status: "active" }).eq("id", existing.id));
    } else {
      const admin = supabaseAdmin();
      if (admin) await admin.auth.admin.inviteUserByEmail(app.email, { data: { full_name: app.full_name }, redirectTo: `${SITE_URL}/auth/callback` });
    }
  },
  async listAllMembers() {
    const s = await sb();
    return check(await s.from("profiles").select("*").order("created_at", { ascending: false })) as Profile[];
  },
  async adminUpdateMember(id, patch) { const s = await sb(); check(await s.from("profiles").update(patch).eq("id", id)); },
  async listMessages() {
    const s = await sb();
    return check(await s.from("contact_messages").select("*").order("created_at", { ascending: false })) as ContactMessage[];
  },
  async markMessageReplied(id) { const s = await sb(); check(await s.from("contact_messages").update({ replied_at: new Date().toISOString() }).eq("id", id)); },
  async listAllJobs() {
    const s = await sb();
    const rows = check(await s.from("jobs").select(`*, poster:profiles!jobs_posted_by_fkey(full_name_ar, full_name_en), referral_requests(count)`)
      .order("created_at", { ascending: false })) as (Job & { poster: { full_name_ar: string; full_name_en: string }; referral_requests: { count: number }[] })[];
    return rows.map(({ poster, referral_requests, ...j }) => ({
      ...j, poster_name: poster?.full_name_ar || poster?.full_name_en || "", referral_count: referral_requests?.[0]?.count ?? 0,
    }));
  },
};
