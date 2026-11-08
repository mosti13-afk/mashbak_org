import type {
  Application, Connection, ContactMessage, EventItem, Job, Notification, Profile, ReferralRequest, Registration,
} from "../types";

const DAY = 86_400_000;
function at(days: number, hour: number, minute = 0) {
  const d = new Date(Date.now() + days * DAY);
  d.setUTCHours(hour - 2, minute, 0, 0); // ~Israel local time
  return d.toISOString();
}
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

export const DEMO_MEMBER_ID = "u-yousef";
export const DEMO_ADMIN_ID = "u-nabil";

function p(x: Partial<Profile> & Pick<Profile, "id" | "full_name_ar" | "full_name_en" | "email">): Profile {
  return {
    role: "member",
    status: "active",
    phone: null,
    avatar_url: null,
    headline: null,
    company: null,
    sector: null,
    city: null,
    years_experience: null,
    linkedin_url: null,
    bio: null,
    career_goals: [],
    interests: [],
    open_to_mentoring: false,
    show_phone_to_connections: true,
    locale: "ar",
    created_at: ago(200),
    ...x,
  };
}

export function seedProfiles(): Profile[] {
  return [
    p({
      id: DEMO_MEMBER_ID, full_name_ar: "يوسف نصّار", full_name_en: "Yousef Nassar", email: "yousef@example.com",
      phone: "+972500000005", avatar_url: "/members/m5.jpg", headline: "Senior Data Engineer", company: "Check Point",
      sector: "Data & AI", city: "حيفا", years_experience: 7, bio: "أبني منصّات بيانات على نطاق واسع. أبحث عن خطوتي الأولى في إدارة فريق.",
      career_goals: ["دور إداري", "Data Platform"], interests: ["Spark", "Mentoring"], created_at: ago(120),
    }),
    p({
      id: DEMO_ADMIN_ID, role: "admin", full_name_ar: "نبيل حدّاد", full_name_en: "Nabil Haddad", email: "nabil@example.com",
      phone: "+972500000002", avatar_url: "/members/m2.jpg", headline: "VP R&D", company: "Amdocs", sector: "Software",
      city: "الناصرة", years_experience: 19, bio: "قدت فرق هندسة في ثلاث قارات. أساعد مديرين جدد في سنتهم الأولى.",
      career_goals: ["إرشاد", "شراكات"], interests: ["Leadership", "Architecture"], open_to_mentoring: true, created_at: ago(400),
    }),
    p({
      id: "u-omar", full_name_ar: "عمر خطيب", full_name_en: "Omar Khatib", email: "omar@example.com", phone: "+972500000001",
      avatar_url: "/members/m0.jpg", headline: "Engineering Manager", company: "Wix", sector: "Software", city: "تل أبيب-يافا",
      years_experience: 11, bio: "أدير فريقين في البنية التحتية. انتقلت من مهندس إلى مدير قبل 3 سنوات ويسعدني مشاركة التجربة.",
      career_goals: ["Director", "إرشاد"], interests: ["Platform", "Hiring"], open_to_mentoring: true, created_at: ago(300),
    }),
    p({
      id: "u-lina", full_name_ar: "لينا منصور", full_name_en: "Lina Mansour", email: "lina@example.com", phone: "+972500000003",
      avatar_url: "/members/m1.jpg", headline: "Senior Product Manager", company: "monday.com", sector: "Product",
      city: "رام الله", years_experience: 9, bio: "مديرة منتجات في B2B SaaS. مهتمة بمسارات الانتقال من الهندسة إلى المنتج.",
      career_goals: ["Group PM"], interests: ["B2B", "Growth"], open_to_mentoring: true, created_at: ago(250),
    }),
    p({
      id: "u-rana", full_name_ar: "رنا أبو أحمد", full_name_en: "Rana Abu Ahmad", email: "rana@example.com",
      avatar_url: "/members/m3.jpg", headline: "QA Group Lead", company: "Intel", sector: "Hardware", city: "الطيبة",
      years_experience: 12, bio: "أقود مجموعة جودة في وحدة السيليكون.", career_goals: ["ترقية داخلية"], interests: ["Automation"],
      created_at: ago(180),
    }),
    p({
      id: "u-maya", full_name_ar: "مايا سالم", full_name_en: "Maya Salem", email: "maya@example.com", phone: "+972500000004",
      avatar_url: "/members/m4.jpg", headline: "UX Research Lead", company: "Microsoft", sector: "Design", city: "حيفا",
      years_experience: 8, bio: "أبحاث مستخدمين لمنتجات المؤسسات.", career_goals: ["Design Manager"], interests: ["Research Ops"],
      created_at: ago(160),
    }),
    p({
      id: "u-huda", full_name_ar: "هدى زعبي", full_name_en: "Huda Zoabi", email: "huda@example.com",
      avatar_url: "/members/m6.jpg", headline: "Finance Business Partner", company: "Teva", sector: "Finance", city: "الناصرة",
      years_experience: 10, bio: "شريكة مالية لإدارة العمليات.", career_goals: ["CFO track"], interests: ["FP&A"],
      open_to_mentoring: true, created_at: ago(140),
    }),
    p({
      id: "u-samer", full_name_ar: "سامر عودة", full_name_en: "Samer Odeh", email: "samer@example.com", phone: "+972500000007",
      avatar_url: "/members/m7.jpg", headline: "Founder & CEO", company: "Nuqta Labs", sector: "Startups", city: "شفاعمرو",
      years_experience: 13, bio: "مؤسس شركة ناشئة في مجال البيانات الصحية. نوظّف قريبًا.", career_goals: ["شركاء", "مستثمرون"],
      interests: ["HealthTech"], created_at: ago(90),
    }),
  ];
}

function ev(x: Omit<EventItem, "status" | "created_at" | "cover_url" | "online_url"> & Partial<EventItem>): EventItem {
  return { status: "published", created_at: ago(30), cover_url: null, online_url: null, ...x };
}

export function seedEvents(): EventItem[] {
  return [
    ev({
      id: "ev-leaders-dinner",
      title: { ar: "عشاء القادة: من مهندس إلى مدير", en: "Leaders' dinner: from engineer to manager", he: "ארוחת מובילים: ממהנדס למנהל" },
      description: {
        ar: "أمسية صغيرة لـ30 عضوًا مع مديرين انتقلوا مؤخرًا لأدوار إدارية. أسئلة صريحة، بدون شرائح.",
        en: "A small evening for 30 members with managers who recently stepped into leadership. Honest questions, no slides.",
        he: "ערב אינטימי ל-30 חברים עם מנהלים שעברו לאחרונה לתפקידי ניהול. שאלות כנות, בלי מצגות.",
      },
      location: { ar: "حيفا، مجمّع مَتام", en: "Haifa, MATAM park", he: "חיפה, פארק מת״ם" },
      is_online: false, starts_at: at(9, 19), ends_at: at(9, 22), capacity: 30, members_only: true,
    }),
    ev({
      id: "ev-referrals-webinar",
      title: { ar: "كيف تطلب توصية تُقرأ؟", en: "How to ask for a referral that gets read", he: "איך לבקש המלצה שקוראים" },
      description: {
        ar: "ورشة أونلاين لمدة ساعة: صياغة طلب التوصية، السيرة الذاتية المختصرة، وما يبحث عنه المُوصي.",
        en: "A one-hour online workshop: writing the request, the short CV, and what referrers look for.",
        he: "סדנה מקוונת של שעה: ניסוח הבקשה, קו״ח קצרים ומה ממליצים מחפשים.",
      },
      location: { ar: "Zoom", en: "Zoom", he: "Zoom" },
      is_online: true, online_url: "https://zoom.us/", starts_at: at(4, 20), ends_at: at(4, 21), capacity: 200, members_only: true,
    }),
    ev({
      id: "ev-hightech-meetup",
      title: { ar: "لقاء نادي الهايتك، نوفمبر", en: "HighTech Club meetup, November", he: "מפגש מועדון ההייטק, נובמבר" },
      description: {
        ar: "محاضرتان قصيرتان عن منصّات البيانات وGenAI في الإنتاج، ثم تشبيك مفتوح.",
        en: "Two short talks on data platforms and GenAI in production, then open networking.",
        he: "שתי הרצאות קצרות על פלטפורמות דאטה ו-GenAI בפרודקשן, ואחריהן נטוורקינג.",
      },
      location: { ar: "الناصرة، مركز الأعمال", en: "Nazareth, Business Center", he: "נצרת, מרכז העסקים" },
      is_online: false, starts_at: at(16, 18, 30), ends_at: at(16, 21), capacity: 80, members_only: false,
    }),
    ev({
      id: "ev-women-lead-circle",
      title: { ar: "دائرة قيادات نسائية", en: "Women Lead circle", he: "מעגל נשים מובילות" },
      description: {
        ar: "لقاء مغلق للعضوات حول التفاوض على الراتب والترقية.",
        en: "A closed session for women members on salary and promotion negotiation.",
        he: "מפגש סגור לחברות על משא ומתן על שכר וקידום.",
      },
      location: { ar: "رام الله", en: "Ramallah", he: "רמאללה" },
      is_online: false, starts_at: at(23, 18), ends_at: at(23, 20), capacity: 2, members_only: true,
    }),
    ev({
      id: "ev-past-summit",
      title: { ar: "ملتقى مشبك السنوي", en: "Mashbak annual summit", he: "כנס משבק השנתי" },
      description: { ar: "يوم كامل من المحاضرات والتشبيك.", en: "A full day of talks and networking.", he: "יום שלם של הרצאות ונטוורקינג." },
      location: { ar: "حيفا", en: "Haifa", he: "חיפה" },
      is_online: false, starts_at: at(-35, 9), ends_at: at(-35, 17), capacity: 250, members_only: false,
    }),
    ev({
      id: "ev-past-cv",
      title: { ar: "عيادة السيرة الذاتية", en: "CV clinic", he: "קליניקת קורות חיים" },
      description: { ar: "مراجعات فردية للسير الذاتية.", en: "One-on-one CV reviews.", he: "סקירות קו״ח אישיות." },
      location: { ar: "Zoom", en: "Zoom", he: "Zoom" },
      is_online: true, starts_at: at(-12, 19), ends_at: at(-12, 21), capacity: 40, members_only: true,
    }),
  ];
}

function reg(id: string, event_id: string, member_id: string, status: Registration["status"] = "registered"): Registration {
  return { id, event_id, member_id, status, checkin_code: `demo-${id}`, checked_in_at: status === "attended" ? ago(12) : null, created_at: ago(5) };
}

export function seedRegistrations(): Registration[] {
  return [
    reg("r1", "ev-referrals-webinar", DEMO_MEMBER_ID),
    reg("r2", "ev-leaders-dinner", "u-omar"),
    reg("r3", "ev-leaders-dinner", "u-lina"),
    reg("r4", "ev-leaders-dinner", "u-samer"),
    reg("r5", "ev-women-lead-circle", "u-lina"),
    reg("r6", "ev-women-lead-circle", "u-maya"),
    reg("r7", "ev-past-cv", DEMO_MEMBER_ID, "attended"),
    reg("r8", "ev-hightech-meetup", "u-rana"),
  ];
}

function job(x: Omit<Job, "is_open" | "expires_at" | "requirements" | "apply_url" | "city"> & Partial<Job>): Job {
  return { is_open: true, expires_at: at(40, 12), requirements: null, apply_url: null, city: null, ...x };
}

export function seedJobs(): Job[] {
  return [
    job({
      id: "job-em-infra", title: "Engineering Manager, Infrastructure", company: "Wix", city: "تل أبيب-يافا",
      job_type: "full_time", work_mode: "hybrid", is_managerial: true, posted_by: "u-omar", created_at: ago(2),
      description: "Lead a team of 7 backend engineers owning our deployment and observability platform. You'll hire, coach and set technical direction together with staff engineers.",
      requirements: "5+ years backend experience, 1+ years leading people or acting as a tech lead. Kubernetes and cloud experience.",
    }),
    job({
      id: "job-gpm", title: "Group Product Manager", company: "monday.com", city: "تل أبيب-يافا",
      job_type: "full_time", work_mode: "hybrid", is_managerial: true, posted_by: "u-lina", created_at: ago(4),
      description: "Own a product area with 3 PMs reporting to you. Strong B2B SaaS background required.",
      requirements: "7+ years in product, 2+ managing PMs.",
    }),
    job({
      id: "job-data-lead", title: "Data Engineering Team Lead", company: "Check Point", city: "حيفا",
      job_type: "full_time", work_mode: "hybrid", is_managerial: true, posted_by: DEMO_MEMBER_ID, created_at: ago(6),
      description: "New team in Haifa building our threat-intelligence data lake. First-line manager role, hands-on.",
      requirements: "Spark, Airflow, a cloud warehouse. Experience mentoring engineers.",
    }),
    job({
      id: "job-cofounder", title: "Founding CTO / Tech Partner", company: "Nuqta Labs", city: "شفاعمرو",
      job_type: "full_time", work_mode: "remote", is_managerial: true, posted_by: "u-samer", created_at: ago(9),
      description: "Looking for a technical partner with equity to lead product engineering in a funded HealthTech startup.",
    }),
    job({
      id: "job-fpna", title: "Senior FP&A Manager", company: "Teva", city: "بيتح تكفا",
      job_type: "full_time", work_mode: "onsite", is_managerial: true, posted_by: "u-huda", created_at: ago(12),
      description: "Lead planning and forecasting for the operations division.",
    }),
  ];
}

export function seedReferrals(): ReferralRequest[] {
  return [
    { id: "ref1", job_id: "job-data-lead", requester_id: "u-rana", status: "pending", cv_url: null, responded_at: null, created_at: ago(1),
      message: "مرحبًا يوسف، أقود اليوم فريق أتمتة بيانات في Intel وأبحث عن دور قيادي في البيانات. سأكون ممتنّة لتوصيتك." },
    { id: "ref2", job_id: "job-em-infra", requester_id: DEMO_MEMBER_ID, status: "pending", cv_url: null, responded_at: null, created_at: ago(1),
      message: "Hi Omar, I lead our ingestion platform informally and I'm ready for a first EM role. Would love your referral." },
  ];
}

export function seedConnections(): Connection[] {
  return [
    { id: "c1", requester_id: DEMO_MEMBER_ID, recipient_id: "u-lina", status: "accepted", responded_at: ago(20), created_at: ago(21),
      message: "مرحبا لينا، أفكر بالانتقال للمنتج وأحب أسمع تجربتك." },
    { id: "c2", requester_id: "u-samer", recipient_id: DEMO_MEMBER_ID, status: "pending", responded_at: null, created_at: ago(1),
      message: "مرحبا يوسف، نبني منصّة بيانات صحية ونبحث عن استشارة حول المعمارية. عندك 15 دقيقة؟" },
    { id: "c3", requester_id: DEMO_MEMBER_ID, recipient_id: "u-maya", status: "pending", responded_at: null, created_at: ago(2),
      message: "Hi Maya, curious how your team runs research ops at scale." },
  ];
}

export function seedNotifications(): Notification[] {
  return [
    { id: "n1", member_id: DEMO_MEMBER_ID, kind: "connection_request", link: "/app/connections", read_at: null, created_at: ago(1),
      title: { ar: "سامر عودة أرسل/ت لك طلب تواصل", en: "Samer Odeh sent you a connection request", he: "סאמר עודה שלח/ה לך בקשת קשר" }, body: {} },
    { id: "n2", member_id: DEMO_MEMBER_ID, kind: "referral_request", link: "/app/jobs/job-data-lead", read_at: null, created_at: ago(1),
      title: { ar: "رنا أبو أحمد تطلب توصية: Data Engineering Team Lead", en: "Rana Abu Ahmad asked for a referral: Data Engineering Team Lead", he: "ראנה אבו אחמד ביקשה המלצה: Data Engineering Team Lead" }, body: {} },
    { id: "n3", member_id: DEMO_MEMBER_ID, kind: "connection_accepted", link: "/app/connections", read_at: ago(19), created_at: ago(20),
      title: { ar: "لينا منصور وافقت على طلب التواصل", en: "Lina Mansour accepted your connection request", he: "לינה מנסור אישרה את בקשת הקשר" }, body: {} },
  ];
}

export function seedApplications(): Application[] {
  const base = { city: null, company: null, sector: null, linkedin_url: null, referral_source: null, age_confirmed: true, review_note: null, reviewed_at: null,
    date_of_birth: "1992-04-11", gender: null, academic_title: "bachelor", is_manager: false, mentoring_participated: false, reject_reason: null, flagged: false, locale: "ar" } as const;
  return [
    { ...base, id: "app1", full_name: "أحمد زيدان", email: "ahmad.z@example.com", phone: "+972500000101", headline: "Senior Backend Engineer",
      company: "Nvidia", sector: "Software", city: "يافة الناصرة", years_experience: 6, status: "pending", created_at: ago(1), referral_source: "Instagram",
      motivation: "أريد الانتقال لدور Tech Lead وأبحث عن أشخاص سبقوني. أستطيع المساعدة في التحضير لمقابلات الأنظمة الموزّعة." },
    { ...base, id: "app2", full_name: "Reem Haj", email: "reem.h@example.com", phone: "+972500000102", headline: "Marketing Manager",
      company: "Fiverr", sector: "Marketing", years_experience: 8, status: "pending", created_at: ago(3), referral_source: "Friend",
      motivation: "Looking for a director-level move and happy to mentor junior marketers." },
    { ...base, id: "app3", full_name: "خالد مصاروة", email: "khaled.m@example.com", phone: "+972500000103", headline: "Software Engineer",
      years_experience: 2, status: "rejected", created_at: ago(10), reviewed_at: ago(8), review_note: "أقل من 4 سنوات خبرة، شجّعناه على التقديم لاحقًا.",
      motivation: "أريد التعرّف على أشخاص في المجال." },
  ];
}

export function seedMessages(): ContactMessage[] {
  return [
    { id: "msg1", name: "Dana Levi", email: "dana@example.com", phone: null, subject: "Partnership", replied_at: null, created_at: ago(2),
      message: "We'd love to host one of your HighTech Club meetups at our Haifa office." },
  ];
}
