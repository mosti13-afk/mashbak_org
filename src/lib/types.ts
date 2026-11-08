import type { L10n, Locale } from "@/i18n/config";

export type UserRole = "member" | "admin";
export type MemberStatus = "pending" | "active" | "suspended";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type RequestStatus = "pending" | "accepted" | "declined";
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
  posted_by: string;
  is_open: boolean;
  expires_at: string;
  created_at: string;
}

export interface JobWithPoster extends Job {
  poster: Pick<Profile, "id" | "full_name_ar" | "full_name_en" | "avatar_url" | "headline" | "company">;
  my_referral: ReferralRequest | null;
  referral_count: number;
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
}

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
  for_who: L10n;
  duration: L10n;
  sessions: L10n;
  benefits: L10n[];
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

export interface SiteSettings {
  hero: { eyebrow: L10n; title: L10n; highlight: L10n; sub: L10n };
  floatingAvatars: string[];
  stats: { members: number; companies: number; events: number };
  contact: { email: string; whatsapp: string; instagram: string; linkedin: string };
}

export type MiniProfile = Pick<Profile, "id" | "full_name_ar" | "full_name_en" | "avatar_url" | "headline" | "company">;

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
