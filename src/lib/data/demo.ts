import "server-only";
import { defaultDropdowns, defaultFaqs, defaultPrograms, defaultReviews, defaultSettings } from "../content";
import type {
  Application, Connection, ContactMessage, EventItem, EventWithStats, Faq, Job, JobWithPoster, MemberReview, MiniProfile,
  Notification, Profile, Program, ReferralRequest, Registration, SiteSettings, DropdownOption,
  Company, CompanyCard, Insider, MemberStats, Ask, AskReply, AskWithAuthor, ReferralFull,
} from "../types";
import type { L10n } from "@/i18n/config";
import * as seed from "./demo-seed";
import type { MemberCard, Repo } from "./repo";

interface Store {
  settings: SiteSettings;
  programs: Program[];
  faqs: Faq[];
  reviews: MemberReview[];
  profiles: Profile[];
  applications: Application[];
  events: EventItem[];
  registrations: Registration[];
  jobs: Job[];
  referrals: ReferralRequest[];
  connections: Connection[];
  notifications: Notification[];
  messages: ContactMessage[];
  dropdowns: DropdownOption[];
  companies: Company[];
  follows: { member_id: string; company_id: string }[];
  asks: Ask[];
  askReplies: AskReply[];
}

function matchCompany(list: Company[], text?: string | null) {
  const t = text?.trim().toLowerCase();
  if (!t) return null;
  return list.find((c) => c.name.toLowerCase() === t || c.aliases.includes(t) || c.name_ar?.toLowerCase() === t || c.name_he?.toLowerCase() === t)?.id ?? null;
}

const g = globalThis as unknown as { __mashbakDemo?: Store };
function db(): Store {
  if (!g.__mashbakDemo) {
    g.__mashbakDemo = {
      settings: structuredClone(defaultSettings),
      programs: structuredClone(defaultPrograms),
      faqs: structuredClone(defaultFaqs),
      reviews: structuredClone(defaultReviews),
      profiles: seed.seedProfiles(),
      applications: seed.seedApplications(),
      events: seed.seedEvents(),
      registrations: seed.seedRegistrations(),
      jobs: seed.seedJobs(),
      referrals: seed.seedReferrals(),
      connections: seed.seedConnections(),
      notifications: seed.seedNotifications(),
      messages: seed.seedMessages(),
      dropdowns: structuredClone(defaultDropdowns),
      companies: seed.seedCompanies(),
      follows: [{ member_id: seed.DEMO_MEMBER_ID, company_id: "co-nvidia" }, { member_id: seed.DEMO_MEMBER_ID, company_id: "co-amdocs" }],
      asks: seed.seedAsks(),
      askReplies: seed.seedAskReplies(),
    };
    const st = g.__mashbakDemo;
    st.profiles.push(...seed.seedMoreProfiles());
    st.jobs.push(...seed.seedCareerJobs());
    for (const pr of st.profiles) { pr.company_id = matchCompany(st.companies, pr.company); pr.open_to_referrals ??= true; pr.open_to_chats ??= true; pr.help_offers ??= []; }
    for (const j of st.jobs) { j.company_id ??= matchCompany(st.companies, j.company); j.source ??= "member"; }
    for (const r of st.referrals) r.insider_id ??= st.jobs.find((j) => j.id === r.job_id)?.posted_by ?? null;
  }
  return g.__mashbakDemo;
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();
const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;
function upsert<T extends { id: string }>(list: T[], item: T) {
  const i = list.findIndex((x) => x.id === item.id);
  if (i >= 0) list[i] = item;
  else list.push(item);
}
function mini(p: Profile): MiniProfile {
  return { id: p.id, full_name_ar: p.full_name_ar, full_name_en: p.full_name_en, avatar_url: p.avatar_url, headline: p.headline, company: p.company };
}
function nameOf(id: string) {
  const p = db().profiles.find((x) => x.id === id);
  return p ? p.full_name_ar || p.full_name_en : "";
}
function nameL10n(id: string): L10n {
  const p = db().profiles.find((x) => x.id === id);
  return { ar: p?.full_name_ar || p?.full_name_en, en: p?.full_name_en || p?.full_name_ar, he: p?.full_name_en || p?.full_name_ar };
}
function notify(member_id: string, kind: string, title: L10n, body: L10n, link: string | null) {
  db().notifications.unshift({ id: uid("n"), member_id, kind, title, body, link, read_at: null, created_at: now() });
}

function withStats(e: EventItem, viewerId?: string | null): EventWithStats {
  const regs = db().registrations.filter((r) => r.event_id === e.id && (r.status === "registered" || r.status === "attended"));
  const mine = viewerId ? db().registrations.find((r) => r.event_id === e.id && r.member_id === viewerId && r.status !== "cancelled") ?? null : null;
  return { ...e, registered_count: regs.length, my_registration: mine };
}

function connectionBetween(a: string, b: string) {
  return db().connections.find((c) => (c.requester_id === a && c.recipient_id === b) || (c.requester_id === b && c.recipient_id === a)) ?? null;
}

function jobWithPoster(j: Job, viewerId: string): JobWithPoster {
  const poster = j.posted_by ? db().profiles.find((p) => p.id === j.posted_by) : undefined;
  const refs = db().referrals.filter((r) => r.job_id === j.id && r.requester_id === viewerId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const c = j.company_id ? db().companies.find((x) => x.id === j.company_id) : undefined;
  return {
    ...j, poster: poster ? mini(poster) : null, my_referral: refs[0] ?? null, referral_count: refs.length,
    company_ref: c ? { id: c.id, slug: c.slug, name: c.name, name_ar: c.name_ar, name_he: c.name_he, logo_url: c.logo_url } : null,
    insiders_count: j.company_id ? db().profiles.filter((p) => p.company_id === j.company_id && p.status === "active" && p.open_to_referrals !== false && p.id !== viewerId).length : 0,
  };
}
function insidersOf(companyId: string): Insider[] {
  return db().profiles.filter((p) => p.company_id === companyId && p.status === "active" && p.open_to_referrals !== false).map((p) => {
    const rs = db().referrals.filter((r) => r.insider_id === p.id);
    return {
      ...mini(p), sector: p.sector, open_to_chats: p.open_to_chats, pending: rs.filter((r) => r.status === "pending").length,
      accepted: rs.filter((r) => r.status === "accepted").length, answered: rs.filter((r) => r.status === "accepted" || r.status === "declined").length,
      total: rs.length, last_asked: rs.map((r) => r.created_at).sort().at(-1) ?? null,
    };
  });
}
function askWith(a: Ask, viewerId: string): AskWithAuthor {
  const reps = db().askReplies.filter((r) => r.ask_id === a.id);
  return { ...a, author: mini(db().profiles.find((p) => p.id === a.member_id)!), replies: reps.length, my_reply: reps.some((r) => r.member_id === viewerId) };
}

export const demoRepo: Repo = {
  async getSettings() { return db().settings; },
  async saveSettings(patch) { db().settings = { ...db().settings, ...patch }; },

  async listPrograms(o) { return db().programs.filter((p) => o?.all || p.is_active).sort(bySort); },
  async getProgram(slug) { return db().programs.find((p) => p.slug === slug && p.is_active) ?? null; },
  async upsertProgram(p) { upsert(db().programs, { ...p, id: p.id || uid("prog") }); },
  async deleteProgram(id) { db().programs = db().programs.filter((p) => p.id !== id); },

  async listFaqs(o) { return db().faqs.filter((f) => o?.all || f.is_active).sort(bySort); },
  async upsertFaq(f) { upsert(db().faqs, { ...f, id: f.id || uid("faq") }); },
  async deleteFaq(id) { db().faqs = db().faqs.filter((f) => f.id !== id); },

  async listReviews(o) { return db().reviews.filter((r) => o?.all || r.is_active).sort(bySort); },
  async upsertReview(r) { upsert(db().reviews, { ...r, id: r.id || uid("rev"), created_at: r.created_at || now() }); },
  async deleteReview(id) { db().reviews = db().reviews.filter((r) => r.id !== id); },

  async createApplication(a) {
    if (db().applications.some((x) => x.email.toLowerCase() === a.email.toLowerCase() && x.status === "pending")) return "duplicate";
    db().applications.unshift({
      id: uid("app"), city: null, company: null, sector: null, linkedin_url: null, referral_source: null, date_of_birth: null, gender: null,
      academic_title: null, is_manager: null, mentoring_participated: null, reject_reason: null, flagged: false, ...a, locale: (a.locale ?? "ar") as "ar",
      status: "pending", review_note: null, reviewed_at: null, created_at: now(),
    });
    return "ok";
  },
  async listDropdowns() { return db().dropdowns; },
  async suggestDropdown(type, key) {
    if (db().dropdowns.some((d) => d.type === type && d.key === key)) return;
    db().dropdowns.push({ id: Date.now(), type, key, label: {}, sort_order: 999, is_active: false, status: "pending" });
  },
  async upsertDropdown(d) {
    const ex = d.id ? db().dropdowns.find((x) => x.id === d.id) : undefined;
    if (ex) Object.assign(ex, d);
    else db().dropdowns.push({ id: Date.now(), label: {}, sort_order: 0, is_active: true, status: "approved", ...d });
  },
  async deleteDropdown(id) { db().dropdowns = db().dropdowns.filter((x) => x.id !== id); },
  async platformStats() {
    const s = db(); const t = Date.now();
    return { members: s.profiles.filter((p) => p.status === "active").length, events_upcoming: s.events.filter((e) => e.status === "published" && Date.parse(e.starts_at) > t).length,
      jobs_open: s.jobs.filter((j) => j.is_open).length, connections: s.connections.filter((c) => c.status === "accepted").length, programs: s.programs.filter((p) => p.is_active).length,
      companies: new Set(s.profiles.filter((p) => p.company_id).map((p) => p.company_id)).size, referrals: s.referrals.filter((r) => r.status === "accepted").length,
      hires: s.referrals.filter((r) => r.outcome === "hired").length };
  },
  async getApplication(id) { return db().applications.find((a) => a.id === id) ?? null; },
  async createContactMessage(m) { db().messages.unshift({ ...m, id: uid("msg"), replied_at: null, created_at: now() }); },

  async listEvents({ when, viewerId, includeDrafts, publicOnly }) {
    const t = Date.now();
    return db().events
      .filter((e) => includeDrafts || e.status === "published")
      .filter((e) => !publicOnly || !e.members_only)
      .filter((e) => when === "all" || (when === "upcoming" ? Date.parse(e.ends_at) >= t : Date.parse(e.ends_at) < t))
      .sort((a, b) => (when === "past" ? -1 : 1) * (Date.parse(a.starts_at) - Date.parse(b.starts_at)))
      .map((e) => withStats(e, viewerId));
  },
  async getEvent(id, viewerId) {
    const e = db().events.find((x) => x.id === id);
    return e ? withStats(e, viewerId) : null;
  },
  async registerForEvent(eventId, viewerId) {
    const e = db().events.find((x) => x.id === eventId);
    if (!e) return;
    const existing = db().registrations.find((r) => r.event_id === eventId && r.member_id === viewerId);
    const count = withStats(e).registered_count;
    const status = e.capacity && count >= e.capacity ? "waitlist" : "registered";
    if (existing) { existing.status = status; existing.created_at = now(); return; }
    db().registrations.push({ id: uid("reg"), event_id: eventId, member_id: viewerId, status, checkin_code: uid("tk").slice(3), checked_in_at: null, created_at: now() });
  },
  async cancelRegistration(eventId, viewerId) {
    const r = db().registrations.find((x) => x.event_id === eventId && x.member_id === viewerId);
    if (!r) return;
    const wasSeat = r.status === "registered";
    r.status = "cancelled";
    if (wasSeat) {
      const next = db().registrations.filter((x) => x.event_id === eventId && x.status === "waitlist").sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
      if (next) {
        next.status = "registered";
        const e = db().events.find((x) => x.id === eventId)!;
        notify(next.member_id, "event_reminder",
          { ar: `حصلت على مقعد: ${e.title.ar}`, en: `You got a seat: ${e.title.en}`, he: `קיבלת מקום: ${e.title.he}` }, {}, `/app/events/${eventId}`);
      }
    }
  },
  async upsertEvent(e) {
    const id = e.id || uid("ev");
    upsert(db().events, { ...e, id, created_at: e.created_at || now() });
    return id;
  },
  async deleteEvent(id) {
    db().events = db().events.filter((e) => e.id !== id);
    db().registrations = db().registrations.filter((r) => r.event_id !== id);
  },
  async listAttendees(eventId) {
    return db().registrations
      .filter((r) => r.event_id === eventId)
      .map((r) => {
        const p = db().profiles.find((x) => x.id === r.member_id)!;
        return { ...r, member: { ...mini(p), email: p.email } };
      })
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  },
  async checkin(eventId, code) {
    const r = db().registrations.find((x) => x.event_id === eventId && x.checkin_code === code.trim() && x.status !== "cancelled");
    if (!r) return { ok: false };
    const already = !!r.checked_in_at;
    if (!already) { r.checked_in_at = now(); r.status = "attended"; }
    return { ok: true, already, name: nameOf(r.member_id) };
  },

  async getProfile(id) { return db().profiles.find((p) => p.id === id) ?? null; },
  async updateProfile(id, patch) {
    const p = db().profiles.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
  },
  async listMembers({ viewerId, q, sector, mentor, companyId, chats }) {
    const needle = q?.trim().toLowerCase();
    return db().profiles
      .filter((p) => p.status === "active" && p.id !== viewerId)
      .filter((p) => !sector || p.sector === sector)
      .filter((p) => !mentor || p.open_to_mentoring)
      .filter((p) => !companyId || p.company_id === companyId)
      .filter((p) => !chats || p.open_to_chats !== false)
      .filter((p) => !needle || [p.full_name_ar, p.full_name_en, p.headline, p.company, p.sector, p.city, ...p.interests, ...(p.help_offers ?? [])]
        .some((s) => s?.toLowerCase().includes(needle)))
      .map((p): MemberCard => ({ ...p, connection: connectionBetween(viewerId, p.id) }));
  },
  async getMember(id, viewerId) {
    const p = db().profiles.find((x) => x.id === id && x.status === "active");
    return p ? { ...p, connection: connectionBetween(viewerId, id) } : null;
  },
  async requestConnection(from, to, message) {
    if (from === to || connectionBetween(from, to)) return;
    db().connections.push({ id: uid("c"), requester_id: from, recipient_id: to, message, status: "pending", responded_at: null, created_at: now() });
    const n = nameL10n(from);
    notify(to, "connection_request", { ar: `${n.ar} أرسل/ت لك طلب تواصل`, en: `${n.en} sent you a connection request`, he: `${n.he} שלח/ה לך בקשת קשר` },
      { ar: message, en: message, he: message }, "/app/requests");
  },
  async respondConnection(id, viewerId, accept) {
    const c = db().connections.find((x) => x.id === id && x.recipient_id === viewerId && x.status === "pending");
    if (!c) return;
    c.status = accept ? "accepted" : "declined";
    c.responded_at = now();
    if (accept) {
      const n = nameL10n(viewerId);
      notify(c.requester_id, "connection_accepted", { ar: `${n.ar} وافق/ت على طلب التواصل`, en: `${n.en} accepted your connection request`, he: `${n.he} אישר/ה את בקשת הקשר` }, {}, "/app/connections");
    }
  },
  async listConnections(viewerId) {
    return db().connections
      .filter((c) => c.requester_id === viewerId || c.recipient_id === viewerId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((c) => {
        const incoming = c.recipient_id === viewerId;
        const other = db().profiles.find((p) => p.id === (incoming ? c.requester_id : c.recipient_id))!;
        const phone = c.status === "accepted" && other.show_phone_to_connections ? other.phone : null;
        return { ...c, other: mini(other), direction: incoming ? "incoming" : "outgoing", phone };
      });
  },

  async listJobs({ viewerId, q, managerialOnly, includeClosed, companyId, companyIds, source, mine, limit }) {
    const needle = q?.trim().toLowerCase();
    return db().jobs
      .filter((j) => includeClosed || (j.is_open && Date.parse(j.expires_at) > Date.now()))
      .filter((j) => !managerialOnly || j.is_managerial)
      .filter((j) => !companyId || j.company_id === companyId)
      .filter((j) => !companyIds || (j.company_id ? companyIds.includes(j.company_id) : false))
      .filter((j) => !source || (source === "careers" ? j.source === "careers" : j.source !== "careers"))
      .filter((j) => !mine || j.posted_by === viewerId)
      .slice(0, limit ?? 300)
      .filter((j) => !needle || [j.title, j.company, j.city, j.description].some((s) => s?.toLowerCase().includes(needle)))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((j) => jobWithPoster(j, viewerId));
  },
  async getJob(id, viewerId) {
    const j = db().jobs.find((x) => x.id === id);
    return j ? jobWithPoster(j, viewerId) : null;
  },
  async createJob(viewerId, j) {
    const id = uid("job");
    db().jobs.unshift({
      id, city: null, requirements: null, apply_url: null, ...j, company_id: j.company_id ?? matchCompany(db().companies, j.company), posted_by: viewerId, is_open: true,
      expires_at: new Date(Date.now() + 45 * 86_400_000).toISOString(), created_at: now(),
    });
    return id;
  },
  async setJobOpen(id, viewerId, open, asAdmin) {
    const j = db().jobs.find((x) => x.id === id && (asAdmin || x.posted_by === viewerId));
    if (j) j.is_open = open;
  },
  async deleteJob(id) {
    db().jobs = db().jobs.filter((j) => j.id !== id);
    db().referrals = db().referrals.filter((r) => r.job_id !== id);
  },
  async requestReferral(jobId, viewerId, message, cvUrl, insiderId) {
    const j = db().jobs.find((x) => x.id === jobId);
    const target = insiderId ?? j?.posted_by ?? null;
    if (!j || !target || target === viewerId || db().referrals.some((r) => r.job_id === jobId && r.requester_id === viewerId && r.status === "pending")) return;
    db().referrals.push({ id: uid("ref"), job_id: jobId, requester_id: viewerId, insider_id: target, message, cv_url: cvUrl ?? null, status: "pending", responded_at: null, created_at: now() });
    const n = nameL10n(viewerId);
    notify(target, "referral_request", { ar: `${n.ar} يطلب/تطلب توصية: ${j.title}`, en: `${n.en} asked you for a referral: ${j.title}`, he: `${n.he} ביקש/ה ממך המלצה: ${j.title}` },
      { ar: message, en: message, he: message }, "/app/requests");
  },
  async listReferralsForJob(jobId) {
    return db().referrals
      .filter((r) => r.job_id === jobId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((r) => ({ ...r, requester: mini(db().profiles.find((p) => p.id === r.requester_id)!) }));
  },
  async respondReferral(id, viewerId, accept, note) {
    const r = db().referrals.find((x) => x.id === id && x.status === "pending" && (x.insider_id === viewerId || (!x.insider_id && db().jobs.find((j) => j.id === x.job_id)?.posted_by === viewerId)));
    if (!r) return;
    const j = db().jobs.find((x) => x.id === r.job_id)!;
    r.status = accept ? "accepted" : "declined";
    r.insider_note = note?.trim() || null;
    r.responded_at = now();
    notify(r.requester_id, accept ? "referral_accepted" : "referral_declined",
      accept ? { ar: `تمت الموافقة على طلب التوصية: ${j.title}`, en: `Your referral request was accepted: ${j.title}`, he: `בקשת ההמלצה אושרה: ${j.title}` }
        : { ar: `تحديث على طلب التوصية: ${j.title}`, en: `Update on your referral request: ${j.title}`, he: `עדכון לגבי בקשת ההמלצה: ${j.title}` },
      { ar: r.insider_note ?? "", en: r.insider_note ?? "", he: r.insider_note ?? "" }, "/app/requests");
  },
  async withdrawReferral(id, viewerId) {
    const r = db().referrals.find((x) => x.id === id && x.requester_id === viewerId && x.status === "pending");
    if (r) { r.status = "withdrawn"; r.responded_at = now(); }
  },
  async referralOutcome(id, viewerId, outcome) {
    const r = db().referrals.find((x) => x.id === id && x.requester_id === viewerId && x.status === "accepted");
    if (r) { r.outcome = outcome; r.outcome_at = now(); }
  },
  async listMyReferrals(viewerId) {
    return db().referrals.flatMap((r): ReferralFull[] => {
      const j = db().jobs.find((x) => x.id === r.job_id);
      if (!j) return [];
      const target = r.insider_id ?? j.posted_by;
      const direction = r.requester_id === viewerId ? "outgoing" : target === viewerId ? "incoming" : null;
      if (!direction) return [];
      const ins = target ? db().profiles.find((p) => p.id === target) : undefined;
      return [{ ...r, direction, job: { id: j.id, title: j.title, company: j.company, company_id: j.company_id ?? null, external_url: j.external_url ?? null, apply_url: j.apply_url },
        requester: mini(db().profiles.find((p) => p.id === r.requester_id)!), insider: ins ? mini(ins) : null }];
    }).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async listCompanies({ viewerId, q }) {
    const needle = q?.trim().toLowerCase();
    const open = (j: Job) => j.is_open && Date.parse(j.expires_at) > Date.now();
    return db().companies
      .filter((c) => !needle || [c.name, c.name_ar, c.name_he, c.sector, ...c.aliases].some((x) => x?.toLowerCase().includes(needle)))
      .map((c): CompanyCard => ({
        ...c, members: db().profiles.filter((p) => p.company_id === c.id && p.status === "active").length,
        jobs: db().jobs.filter((j) => j.company_id === c.id && open(j)).length,
        following: db().follows.some((f) => f.member_id === viewerId && f.company_id === c.id),
      })).sort((a, b) => a.name.localeCompare(b.name));
  },
  async getCompany(idOrSlug) { return db().companies.find((c) => c.id === idOrSlug || c.slug === idOrSlug) ?? null; },
  async companyInsiders(companyId) { return insidersOf(companyId); },
  async followCompany(viewerId, companyId, on) {
    db().follows = db().follows.filter((f) => !(f.member_id === viewerId && f.company_id === companyId));
    if (on) db().follows.push({ member_id: viewerId, company_id: companyId });
  },
  async followedCompanyIds(viewerId) { return db().follows.filter((f) => f.member_id === viewerId).map((f) => f.company_id); },
  async upsertCompany(c) {
    const ex = c.id ? db().companies.find((x) => x.id === c.id) : undefined;
    const aliases = (c.aliases ?? []).map((a) => a.trim().toLowerCase()).filter(Boolean);
    if (ex) { Object.assign(ex, { ...c, aliases }); return ex.id; }
    const id = uid("co");
    db().companies.push({ id, slug: c.slug, name: c.name, name_ar: c.name_ar ?? null, name_he: c.name_he ?? null, aliases, logo_url: c.logo_url ?? null, website: c.website ?? null,
      sector: c.sector ?? null, careers_url: c.careers_url ?? null, location_filter: c.location_filter ?? "israel", sync_enabled: c.sync_enabled ?? true,
      last_synced_at: null, last_sync_status: null, last_sync_count: null, created_at: now() });
    for (const pr of db().profiles) if (!pr.company_id) pr.company_id = matchCompany(db().companies, pr.company);
    return id;
  },
  async deleteCompany(id) { db().companies = db().companies.filter((c) => c.id !== id); },
  async listCompaniesAll() { return db().companies; },
  async saveSyncedJobs(company, jobs, status) {
    const existing = db().jobs.filter((j) => j.company_id === company.id && j.source === "careers");
    let added = 0;
    for (const sj of jobs) {
      const ex = existing.find((e) => e.external_url === sj.url || e.id === `cj-${company.slug}-${sj.external_id}`);
      if (ex) { Object.assign(ex, { title: sj.title, location: sj.location, is_open: true }); continue; }
      added++;
      db().jobs.push({ id: `cj-${company.slug}-${sj.external_id}`.slice(0, 80), title: sj.title, company: company.name, company_id: company.id, city: null, location: sj.location,
        job_type: sj.job_type ?? "full_time", work_mode: sj.work_mode ?? "onsite", is_managerial: !!sj.is_managerial, description: sj.description ?? "", requirements: null,
        apply_url: sj.url, external_url: sj.url, source: "careers", posted_by: null, is_open: true, expires_at: new Date(Date.now() + 30 * 864e5).toISOString(), created_at: now() });
    }
    Object.assign(company, { last_synced_at: now(), last_sync_status: status, last_sync_count: jobs.length });
    return { added, updated: jobs.length - added, closed: 0 };
  },

  async listAsks({ viewerId, kind, mine, includeClosed }) {
    return db().asks.filter((a) => (!kind || a.kind === kind) && (!mine || a.member_id === viewerId) && (includeClosed || a.status === "open"))
      .sort((a, b) => b.created_at.localeCompare(a.created_at)).map((a) => askWith(a, viewerId));
  },
  async getAsk(id, viewerId) {
    const a = db().asks.find((x) => x.id === id);
    if (!a) return null;
    const replies = db().askReplies.filter((r) => r.ask_id === id && (a.member_id === viewerId || r.member_id === viewerId))
      .map((r) => ({ ...r, author: mini(db().profiles.find((p) => p.id === r.member_id)!) }));
    return { ask: askWith(a, viewerId), replies };
  },
  async createAsk(viewerId, a) {
    const id = uid("ask");
    db().asks.unshift({ id, member_id: viewerId, ...a, status: "open", created_at: now(), closed_at: null });
    return id;
  },
  async setAskStatus(id, viewerId, status) {
    const a = db().asks.find((x) => x.id === id && x.member_id === viewerId);
    if (a) { a.status = status; a.closed_at = status === "closed" ? now() : null; }
  },
  async replyAsk(askId, viewerId, message) {
    const a = db().asks.find((x) => x.id === askId);
    if (!a || a.member_id === viewerId || db().askReplies.some((r) => r.ask_id === askId && r.member_id === viewerId)) return;
    db().askReplies.push({ id: uid("ar"), ask_id: askId, member_id: viewerId, message, created_at: now(), author: mini(db().profiles.find((p) => p.id === viewerId)!) });
    const n = nameL10n(viewerId);
    notify(a.member_id, "ask_reply", a.kind === "ask"
      ? { ar: `${n.ar} يعرض المساعدة: ${a.title}`, en: `${n.en} offered to help: ${a.title}`, he: `${n.he} מציע/ה לעזור: ${a.title}` }
      : { ar: `${n.ar} مهتم/ة بعرضك: ${a.title}`, en: `${n.en} is interested in your offer: ${a.title}`, he: `${n.he} מתעניין/ת בהצעה שלך: ${a.title}` },
      { ar: message, en: message, he: message }, `/app/asks/${askId}`);
  },
  async memberStats(ids) {
    const out: Record<string, MemberStats> = {};
    for (const id of ids) out[id] = {
      referrals: db().referrals.filter((r) => r.insider_id === id && r.status === "accepted").length,
      chats: db().connections.filter((c) => c.recipient_id === id && c.status === "accepted").length,
      answers: db().askReplies.filter((r) => r.member_id === id).length,
      hires: db().referrals.filter((r) => r.insider_id === id && r.outcome === "hired").length,
    };
    return out;
  },

  async listNotifications(viewerId) { return db().notifications.filter((n) => n.member_id === viewerId).slice(0, 50); },
  async unreadCount(viewerId) { return db().notifications.filter((n) => n.member_id === viewerId && !n.read_at).length; },
  async markAllRead(viewerId) { db().notifications.forEach((n) => { if (n.member_id === viewerId && !n.read_at) n.read_at = now(); }); },

  async seedDefaults() { return 0; },
  async addNotifications(ids, kind, title, body, link) { ids.forEach((id) => notify(id, kind, title, body, link)); },
  async adminStats() {
    const s = db();
    const t = Date.now();
    return {
      members: s.profiles.filter((p) => p.status === "active").length,
      pending: s.applications.filter((a) => a.status === "pending").length,
      events: s.events.filter((e) => e.status === "published" && Date.parse(e.starts_at) > t).length,
      jobs: s.jobs.filter((j) => j.is_open).length,
      connections: s.connections.filter((c) => c.status === "accepted").length,
      referrals: s.referrals.length,
    };
  },
  async listApplications(status) {
    return db().applications.filter((a) => !status || a.status === status).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async reviewApplication(id, status, note, rejectReason) {
    const a = db().applications.find((x) => x.id === id);
    if (!a) return null;
    a.status = status;
    a.review_note = note;
    a.reject_reason = rejectReason ?? null;
    a.reviewed_at = now();
    if (status === "approved" && !db().profiles.some((p) => p.email === a.email)) {
      db().profiles.push({
        id: uid("u"), role: "member", status: "active", full_name_ar: a.full_name, full_name_en: a.full_name, email: a.email,
        phone: a.phone, avatar_url: null, headline: a.headline, company: a.company, sector: a.sector, city: a.city,
        years_experience: a.years_experience, linkedin_url: a.linkedin_url, bio: null, career_goals: [], interests: [],
        open_to_mentoring: false, show_phone_to_connections: true, locale: "ar", created_at: now(),
      });
    }
    return a;
  },
  async listAllMembers() { return [...db().profiles].sort((a, b) => b.created_at.localeCompare(a.created_at)); },
  async adminUpdateMember(id, patch) {
    const p = db().profiles.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
  },
  async listMessages() { return db().messages; },
  async markMessageReplied(id) {
    const m = db().messages.find((x) => x.id === id);
    if (m) m.replied_at = now();
  },
  async listAllJobs() {
    return [...db().jobs]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((j) => ({ ...j, poster_name: j.posted_by ? nameOf(j.posted_by) : j.company, referral_count: db().referrals.filter((r) => r.job_id === j.id).length }));
  },
};
