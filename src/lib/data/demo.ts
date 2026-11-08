import "server-only";
import { defaultDropdowns, defaultFaqs, defaultPrograms, defaultReviews, defaultSettings } from "../content";
import type {
  Application, Connection, ContactMessage, EventItem, EventWithStats, Faq, Job, JobWithPoster, MemberReview, MiniProfile,
  Notification, Profile, Program, ReferralRequest, Registration, SiteSettings, DropdownOption,
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
    };
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
  const poster = db().profiles.find((p) => p.id === j.posted_by)!;
  const refs = db().referrals.filter((r) => r.job_id === j.id);
  return { ...j, poster: mini(poster), my_referral: refs.find((r) => r.requester_id === viewerId) ?? null, referral_count: refs.length };
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
      jobs_open: s.jobs.filter((j) => j.is_open).length, connections: s.connections.filter((c) => c.status === "accepted").length, programs: s.programs.filter((p) => p.is_active).length };
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
  async listMembers({ viewerId, q, sector, mentor }) {
    const needle = q?.trim().toLowerCase();
    return db().profiles
      .filter((p) => p.status === "active" && p.id !== viewerId)
      .filter((p) => !sector || p.sector === sector)
      .filter((p) => !mentor || p.open_to_mentoring)
      .filter((p) => !needle || [p.full_name_ar, p.full_name_en, p.headline, p.company, p.sector, p.city, ...p.interests]
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
      { ar: message, en: message, he: message }, "/app/connections");
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

  async listJobs({ viewerId, q, managerialOnly, includeClosed }) {
    const needle = q?.trim().toLowerCase();
    return db().jobs
      .filter((j) => includeClosed || (j.is_open && Date.parse(j.expires_at) > Date.now()))
      .filter((j) => !managerialOnly || j.is_managerial)
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
      id, city: null, requirements: null, apply_url: null, ...j, posted_by: viewerId, is_open: true,
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
  async requestReferral(jobId, viewerId, message, cvUrl) {
    const j = db().jobs.find((x) => x.id === jobId);
    if (!j || j.posted_by === viewerId || db().referrals.some((r) => r.job_id === jobId && r.requester_id === viewerId)) return;
    db().referrals.push({ id: uid("ref"), job_id: jobId, requester_id: viewerId, message, cv_url: cvUrl ?? null, status: "pending", responded_at: null, created_at: now() });
    const n = nameL10n(viewerId);
    notify(j.posted_by, "referral_request", { ar: `${n.ar} يطلب/تطلب توصية: ${j.title}`, en: `${n.en} asked for a referral: ${j.title}`, he: `${n.he} ביקש/ה המלצה: ${j.title}` },
      { ar: message, en: message, he: message }, `/app/jobs/${jobId}`);
  },
  async listReferralsForJob(jobId) {
    return db().referrals
      .filter((r) => r.job_id === jobId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((r) => ({ ...r, requester: mini(db().profiles.find((p) => p.id === r.requester_id)!) }));
  },
  async respondReferral(id, viewerId, accept) {
    const r = db().referrals.find((x) => x.id === id && x.status === "pending");
    const j = r && db().jobs.find((x) => x.id === r.job_id && x.posted_by === viewerId);
    if (!r || !j) return;
    r.status = accept ? "accepted" : "declined";
    r.responded_at = now();
    if (accept) notify(r.requester_id, "referral_accepted",
      { ar: `تمت الموافقة على طلب التوصية: ${j.title}`, en: `Your referral request was accepted: ${j.title}`, he: `בקשת ההמלצה אושרה: ${j.title}` }, {}, `/app/jobs/${j.id}`);
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
      .map((j) => ({ ...j, poster_name: nameOf(j.posted_by), referral_count: db().referrals.filter((r) => r.job_id === j.id).length }));
  },
};
