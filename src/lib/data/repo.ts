import type { L10n } from "@/i18n/config";
import type {
  Application, ApplicationStatus, AttendeeRow, ConnectionWithPeople, ContactMessage, EventItem, EventWithStats, Faq,
  JobType, JobWithPoster, MemberReview, Notification, Profile, Program, ReferralWithRequester, RequestStatus, SiteSettings,
  WorkMode, Connection, Job, DropdownOption, Company, CompanyCard, Insider, MemberStats, AskWithAuthor, AskReply, ReferralFull, ReferralOutcome,
} from "../types";

export interface MemberCard extends Profile {
  connection: Connection | null;
}

export interface ApplicationInput {
  full_name: string; email: string; phone: string; city?: string | null; headline: string; company?: string | null;
  sector?: string | null; years_experience: number; linkedin_url?: string | null; motivation: string;
  referral_source?: string | null; age_confirmed: boolean;
  date_of_birth?: string | null; gender?: "male" | "female" | null; academic_title?: string | null;
  is_manager?: boolean | null; mentoring_participated?: boolean | null; locale?: string;
}
export interface JobInput {
  title: string; company: string; city?: string | null; job_type: JobType; work_mode: WorkMode; is_managerial: boolean;
  description: string; requirements?: string | null; apply_url?: string | null;
  company_id?: string | null; source?: "member" | "link"; external_url?: string | null; location?: string | null;
}
export type ProfilePatch = Partial<Pick<Profile,
  "full_name_ar" | "full_name_en" | "phone" | "avatar_url" | "headline" | "company" | "sector" | "city" | "years_experience" |
  "linkedin_url" | "bio" | "career_goals" | "interests" | "open_to_mentoring" | "show_phone_to_connections" | "locale" | "notify_email" | "notify_whatsapp" |
  "company_id" | "open_to_referrals" | "open_to_chats" | "help_offers" | "cv_url">>;

export interface CompanyInput {
  id?: string; slug: string; name: string; name_ar?: string | null; name_he?: string | null; aliases?: string[];
  logo_url?: string | null; website?: string | null; sector?: string | null; careers_url?: string | null;
  location_filter?: "israel" | "all"; sync_enabled?: boolean;
}
export interface SyncedJobRow {
  external_id: string; title: string; url: string; location: string | null; description?: string | null;
  job_type?: JobType; work_mode?: WorkMode; is_managerial?: boolean;
}

export type CheckinResult = { ok: true; already: boolean; name: string } | { ok: false };

export interface AdminStats {
  members: number; pending: number; events: number; jobs: number; connections: number; referrals: number;
}

export interface PlatformStats {
  members: number; events_upcoming: number; jobs_open: number; connections: number; programs: number;
  companies?: number; referrals?: number; hires?: number;
}

export interface Repo {
  // content
  getSettings(): Promise<SiteSettings>;
  saveSettings(patch: Partial<SiteSettings>): Promise<void>;
  listPrograms(opts?: { all?: boolean }): Promise<Program[]>;
  getProgram(slug: string): Promise<Program | null>;
  upsertProgram(p: Program): Promise<void>;
  deleteProgram(id: string): Promise<void>;
  listFaqs(opts?: { all?: boolean }): Promise<Faq[]>;
  upsertFaq(f: Faq): Promise<void>;
  deleteFaq(id: string): Promise<void>;
  listReviews(opts?: { all?: boolean }): Promise<MemberReview[]>;
  upsertReview(r: MemberReview): Promise<void>;
  deleteReview(id: string): Promise<void>;
  createApplication(a: ApplicationInput): Promise<"ok" | "duplicate">;
  listDropdowns(): Promise<DropdownOption[]>;
  suggestDropdown(type: string, key: string): Promise<void>;
  upsertDropdown(d: Partial<DropdownOption> & { type: string; key: string }): Promise<void>;
  deleteDropdown(id: number): Promise<void>;
  platformStats(): Promise<PlatformStats>;
  createContactMessage(m: Omit<ContactMessage, "id" | "created_at" | "replied_at">): Promise<void>;

  // events
  listEvents(opts: { when: "upcoming" | "past" | "all"; viewerId?: string | null; includeDrafts?: boolean; publicOnly?: boolean }): Promise<EventWithStats[]>;
  getEvent(id: string, viewerId?: string | null): Promise<EventWithStats | null>;
  registerForEvent(eventId: string, viewerId: string): Promise<void>;
  cancelRegistration(eventId: string, viewerId: string): Promise<void>;
  upsertEvent(e: EventItem): Promise<string>;
  deleteEvent(id: string): Promise<void>;
  listAttendees(eventId: string): Promise<AttendeeRow[]>;
  checkin(eventId: string, code: string): Promise<CheckinResult>;

  // members & connections
  getProfile(id: string): Promise<Profile | null>;
  updateProfile(id: string, patch: ProfilePatch): Promise<void>;
  listMembers(opts: { viewerId: string; q?: string; sector?: string; mentor?: boolean; companyId?: string; chats?: boolean }): Promise<MemberCard[]>;
  memberStats(ids: string[]): Promise<Record<string, MemberStats>>;
  getMember(id: string, viewerId: string): Promise<MemberCard | null>;
  requestConnection(from: string, to: string, message: string): Promise<void>;
  respondConnection(id: string, viewerId: string, accept: boolean): Promise<void>;
  listConnections(viewerId: string): Promise<ConnectionWithPeople[]>;

  // jobs & referrals
  listJobs(opts: { viewerId: string; q?: string; managerialOnly?: boolean; includeClosed?: boolean; companyId?: string; companyIds?: string[]; source?: "member" | "careers"; mine?: boolean; limit?: number }): Promise<JobWithPoster[]>;
  getJob(id: string, viewerId: string): Promise<JobWithPoster | null>;
  createJob(viewerId: string, j: JobInput): Promise<string>;
  setJobOpen(id: string, viewerId: string, open: boolean, asAdmin?: boolean): Promise<void>;
  deleteJob(id: string): Promise<void>;
  requestReferral(jobId: string, viewerId: string, message: string, cvUrl: string | null, insiderId: string | null): Promise<void>;
  listReferralsForJob(jobId: string): Promise<ReferralWithRequester[]>;
  respondReferral(id: string, viewerId: string, accept: boolean, note?: string | null): Promise<void>;
  withdrawReferral(id: string, viewerId: string): Promise<void>;
  referralOutcome(id: string, viewerId: string, outcome: ReferralOutcome): Promise<void>;
  listMyReferrals(viewerId: string): Promise<ReferralFull[]>;

  // companies & insiders
  listCompanies(opts: { viewerId: string; q?: string }): Promise<CompanyCard[]>;
  getCompany(idOrSlug: string): Promise<Company | null>;
  companyInsiders(companyId: string): Promise<Insider[]>;
  followCompany(viewerId: string, companyId: string, on: boolean): Promise<void>;
  followedCompanyIds(viewerId: string): Promise<string[]>;
  upsertCompany(c: CompanyInput, viewerId: string): Promise<string>;
  deleteCompany(id: string): Promise<void>;
  listCompaniesAll(): Promise<Company[]>;
  /** Stores jobs imported from a careers site; closes jobs that disappeared. Uses the service role when available. */
  saveSyncedJobs(company: Company, jobs: SyncedJobRow[], status: string): Promise<{ added: number; updated: number; closed: number }>;

  // asks & offers
  listAsks(opts: { viewerId: string; kind?: "ask" | "offer"; mine?: boolean; includeClosed?: boolean }): Promise<AskWithAuthor[]>;
  getAsk(id: string, viewerId: string): Promise<{ ask: AskWithAuthor; replies: AskReply[] } | null>;
  createAsk(viewerId: string, a: { kind: "ask" | "offer"; title: string; body: string; tags: string[] }): Promise<string>;
  setAskStatus(id: string, viewerId: string, status: "open" | "closed"): Promise<void>;
  replyAsk(askId: string, viewerId: string, message: string): Promise<void>;

  // notifications
  listNotifications(viewerId: string): Promise<Notification[]>;
  unreadCount(viewerId: string): Promise<number>;
  markAllRead(viewerId: string): Promise<void>;

  // admin
  /** Installs default programs, FAQs, testimonials and settings into empty tables. Returns rows added. */
  seedDefaults(): Promise<number>;
  adminStats(): Promise<AdminStats>;
  listApplications(status?: ApplicationStatus): Promise<Application[]>;
  reviewApplication(id: string, status: ApplicationStatus, note: string | null, rejectReason?: string | null): Promise<Application | null>;
  getApplication(id: string): Promise<Application | null>;
  listAllMembers(): Promise<Profile[]>;
  addNotifications(memberIds: string[], kind: string, title: L10n, body: L10n, link: string | null): Promise<void>;
  adminUpdateMember(id: string, patch: Partial<Pick<Profile, "role" | "status">>): Promise<void>;
  listMessages(): Promise<ContactMessage[]>;
  markMessageReplied(id: string): Promise<void>;
  listAllJobs(): Promise<(Job & { poster_name: string; referral_count: number })[]>;
}

export type { RequestStatus };
