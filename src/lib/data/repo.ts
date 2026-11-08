import type { L10n } from "@/i18n/config";
import type {
  Application, ApplicationStatus, AttendeeRow, ConnectionWithPeople, ContactMessage, EventItem, EventWithStats, Faq,
  JobType, JobWithPoster, MemberReview, Notification, Profile, Program, ReferralWithRequester, RequestStatus, SiteSettings,
  WorkMode, Connection, Job, DropdownOption,
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
}
export type ProfilePatch = Partial<Pick<Profile,
  "full_name_ar" | "full_name_en" | "phone" | "avatar_url" | "headline" | "company" | "sector" | "city" | "years_experience" |
  "linkedin_url" | "bio" | "career_goals" | "interests" | "open_to_mentoring" | "show_phone_to_connections" | "locale" | "notify_email" | "notify_whatsapp">>;

export type CheckinResult = { ok: true; already: boolean; name: string } | { ok: false };

export interface AdminStats {
  members: number; pending: number; events: number; jobs: number; connections: number; referrals: number;
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
  platformStats(): Promise<{ members: number; events_upcoming: number; jobs_open: number; connections: number; programs: number }>;
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
  listMembers(opts: { viewerId: string; q?: string; sector?: string; mentor?: boolean }): Promise<MemberCard[]>;
  getMember(id: string, viewerId: string): Promise<MemberCard | null>;
  requestConnection(from: string, to: string, message: string): Promise<void>;
  respondConnection(id: string, viewerId: string, accept: boolean): Promise<void>;
  listConnections(viewerId: string): Promise<ConnectionWithPeople[]>;

  // jobs & referrals
  listJobs(opts: { viewerId: string; q?: string; managerialOnly?: boolean; includeClosed?: boolean }): Promise<JobWithPoster[]>;
  getJob(id: string, viewerId: string): Promise<JobWithPoster | null>;
  createJob(viewerId: string, j: JobInput): Promise<string>;
  setJobOpen(id: string, viewerId: string, open: boolean, asAdmin?: boolean): Promise<void>;
  deleteJob(id: string): Promise<void>;
  requestReferral(jobId: string, viewerId: string, message: string, cvUrl?: string | null): Promise<void>;
  listReferralsForJob(jobId: string): Promise<ReferralWithRequester[]>;
  respondReferral(id: string, viewerId: string, accept: boolean): Promise<void>;

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
