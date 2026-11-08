import type { L10n, Locale } from "@/i18n/config";

export type UserRole = "member" | "admin";
export type MemberStatus = "pending" | "active" | "suspended";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type RequestStatus = "pending" | "accepted" | "declined" | "withdrawn";
export type RegistrationStatus = "registered" | "waitlist" | "cancelled" | "attended";
export type JobType = "full_time" | "part_time" | "contract" | "freelance";
export type WorkMode = "onsite" | "hybrid" | "remote";
export type EventStatus = "draft" | "published" | "cancelled";

export interface Profile {
  id: string;
  role: UserRole;
  status: MemberStatus;
  full_name_ar: string;
  full_name_en: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  headline: string | null;
  company: string | null;
  sector: string | null;
  city: string | null;
  years_experience: number | null;
  linkedin_url: string | null;
  bio: string | null;
  career_goals: string[];
  interests: string[];
  open_to_mentoring: boolean;
  show_phone_to_connections: boolean;
  locale: Locale;
  created_at: string;
  gender?: string | null;
  date_of_birth?: string | null;
  academic_title?: string | null;
  is_manager?: boolean | null;
  current_interests?: string[];
  top_career_challenges?: string[];
  interested_opportunities?: string[];
  interested_in_mentoring?: string[];
  cv_url?: string | null;
  company_id?: string | null;
  open_to_referrals?: boolean;
  open_to_chats?: boolean;
  help_offers?: string[];
  onboarded_at?: string | null;
  notify_email?: boolean;
  notify_whatsapp?: boolean;
  notify_sms?: boolean;
  notify_prefs?: import("./notify/prefs").NotifyPrefs | null;
  phone_verified_at?: string | null;
}

export interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string | null;
  headline: string;
  company: string | null;
  sector: string | null;
  years_experience: number;
  linkedin_url: string | null;
  motivation: string;
  referral_source: string | null;
  age_confirmed: boolean;
  date_of_birth: string | null;
  gender: "male" | "female" | null;
  academic_title: string | null;
  is_manager: boolean | null;
  mentoring_participated: boolean | null;
  reject_reason: string | null;
  flagged: boolean;
  locale: Locale;
  status: ApplicationStatus;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: L10n;
  description: L10n;
  cover_url: string | null;
  location: L10n;
  is_online: boolean;
  online_url: string | null;
  starts_at: string;
  ends_at: string;
  capacity: number | null;
  status: EventStatus;
  members_only: boolean;
  created_at: string;
  registration_ends_at?: string | null;
  waitlist_enabled?: boolean;
}

export interface EventWithStats extends EventItem {
  registered_count: number;
  my_registration: Registration | null;
}

export interface Registration {
  id: string;
  event_id: string;
  member_id: string;
  status: RegistrationStatus;
  checkin_code: string;
  checked_in_at: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  city: string | null;
  job_type: JobType;
  work_mode: WorkMode;
  is_managerial: boolean;
  description: string;
  requirements: string | null;
  apply_url: string | null;
  industry?: string | null;
  seniority?: string | null;
  notes_for_members?: string | null;
  archived?: boolean;
  posted_by: string | null;
  company_id?: string | null;
  source?: "member" | "careers" | "link";
  external_url?: string | null;
  location?: string | null;
  is_open: boolean;
  expires_at: string;
  created_at: string;
}

export interface JobWithPoster extends Job {
  poster: Pick<Profile, "id" | "full_name_ar" | "full_name_en" | "avatar_url" | "headline" | "company"> | null;
  my_referral: ReferralRequest | null;
  referral_count: number;
  company_ref?: Pick<Company, "id" | "slug" | "name" | "name_ar" | "name_he" | "logo_url"> | null;
  insiders_count?: number;
}

export interface ReferralRequest {
  id: string;
  job_id: string;
  requester_id: string;
  message: string;
  cv_url: string | null;
  status: RequestStatus;
  responded_at: string | null;
  created_at: string;
  insider_id?: string | null;
  insider_note?: string | null;
  outcome?: ReferralOutcome | null;
  outcome_at?: string | null;
}

export type ReferralOutcome = "interview" | "offer" | "hired" | "no_news" | "rejected";

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  message: string;
  status: RequestStatus;
  responded_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  member_id: string;
  kind: string;
  title: L10n;
  body: L10n;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Program {
  id: string;
  slug: string;
  title: L10n;
  summary: L10n;
  body: L10n;
  target_audience: L10n[];
  benefits: L10n[];
  icon_url: string | null;
  image_url: string | null;
  sessions_count: number | null;
  duration_months: number | null;
  color: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface Faq {
  id: string;
  question: L10n;
  answer: L10n;
  sort_order: number;
  is_active: boolean;
}

export interface MemberReview {
  id: string;
  name: L10n;
  role_title: L10n;
  organization: string | null;
  photo_url: string | null;
  quote: L10n;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  replied_at: string | null;
  created_at: string;
}

/** Site settings keyed like the live platform (HERO_SECTION, HOW_IT_WORKS_SECTION, CONTACT_INFO ...). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SiteSettings = Record<string, any>;

export interface DropdownOption {
  id: number;
  type: string;
  key: string;
  label: L10n;
  sort_order: number;
  is_active: boolean;
  status: "approved" | "pending";
}

export type MiniProfile = Pick<Profile, "id" | "full_name_ar" | "full_name_en" | "avatar_url" | "headline" | "company">;

export interface Company {
  id: string;
  slug: string;
  name: string;
  name_ar: string | null;
  name_he: string | null;
  aliases: string[];
  logo_url: string | null;
  website: string | null;
  sector: string | null;
  careers_url: string | null;
  location_filter: "israel" | "all";
  sync_enabled: boolean;
  last_synced_at: string | null;
  last_sync_status: string | null;
  last_sync_count: number | null;
  created_at: string;
}
export interface CompanyCard extends Company { members: number; jobs: number; following: boolean }

/** A member who works at a company, with load figures used for fair rotation. */
export interface Insider extends MiniProfile {
  pending: number; accepted: number; answered: number; total: number; last_asked: string | null;
  sector?: string | null; open_to_chats?: boolean;
}
export interface MemberStats { referrals: number; chats: number; answers: number; hires: number }

export interface Ask {
  id: string; member_id: string; kind: "ask" | "offer"; title: string; body: string; tags: string[];
  status: "open" | "closed"; created_at: string; closed_at: string | null;
}
export interface AskWithAuthor extends Ask { author: MiniProfile; replies: number; my_reply: boolean }
export interface AskReply { id: string; ask_id: string; member_id: string; message: string; created_at: string; author: MiniProfile }

export interface ReferralFull extends ReferralRequest {
  job: Pick<Job, "id" | "title" | "company" | "company_id" | "external_url" | "apply_url">;
  requester: MiniProfile;
  insider: MiniProfile | null;
  direction: "incoming" | "outgoing";
}

export interface ConnectionWithPeople extends Connection {
  other: MiniProfile;
  direction: "incoming" | "outgoing";
  phone: string | null;
}

export interface ReferralWithRequester extends ReferralRequest {
  requester: MiniProfile;
}

export interface AttendeeRow extends Registration {
  member: MiniProfile & { email: string };
}
