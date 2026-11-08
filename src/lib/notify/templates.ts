import type { L10n } from "@/i18n/config";

/**
 * Built-in notification texts. Every template exists in Arabic, English and Hebrew.
 * Placeholders use {name} style and are filled from the vars passed to notify().
 * Admins can override subject/body per template from the dashboard (notification_templates table).
 *
 * `wa` lists the WhatsApp template body parameters, in order. The approved WhatsApp template
 * in Meta must have exactly that many {{n}} variables (see WHATSAPP_TEMPLATES.md).
 */
export interface Template {
  subject: L10n;
  body: L10n;
  cta?: { label: L10n; path: string };
  wa?: string[];
  audience: "member" | "admin" | "public";
}

const L = (ar: string, en: string, he: string): L10n => ({ ar, en, he });

export const TEMPLATES = {
  application_received: {
    audience: "public",
    subject: L("استلمنا طلب انضمامك إلى مشبك", "We received your application to Mashbak", "קיבלנו את בקשת ההצטרפות שלך למשבק"),
    body: L(
      "أهلًا {name}،\n\nشكرًا لاهتمامك بالانضمام إلى مجتمع مشبك. وصلنا طلبك وسيقوم فريقنا بمراجعته خلال الأيام القريبة.\n\nسنرسل لك رسالة فور اتخاذ القرار. في هذه الأثناء يمكنك التعرّف على برامجنا.",
      "Hi {name},\n\nThank you for applying to join the Mashbak community. Your application reached us and our team will review it in the coming days.\n\nWe will message you as soon as there is a decision. Meanwhile, feel free to explore our programs.",
      "שלום {name},\n\nתודה על ההתעניינות בהצטרפות לקהילת משבק. הבקשה שלך התקבלה והצוות שלנו יבחן אותה בימים הקרובים.\n\nנעדכן אותך ברגע שתתקבל החלטה. בינתיים אפשר להכיר את התוכניות שלנו.",
    ),
    cta: { label: L("تعرّف على البرامج", "Explore programs", "לתוכניות שלנו"), path: "/our_programs" },
    wa: ["name"],
  },
  application_approved: {
    audience: "public",
    subject: L("أهلًا بك في مشبك! تمّت الموافقة على طلبك", "Welcome to Mashbak! Your application was approved", "ברוכים הבאים למשבק! הבקשה שלך אושרה"),
    body: L(
      "مبروك {name}!\n\nيسعدنا إبلاغك بأن طلب انضمامك إلى مشبك قد تمّت الموافقة عليه. أصبحت الآن جزءًا من مجتمع مهنيين عرب يدعمون بعضهم البعض.\n\nادخل إلى المنصة باستخدام هذا البريد الإلكتروني، أكمل ملفك الشخصي، وابدأ بالتواصل مع الأعضاء والتسجيل للفعاليات.",
      "Congratulations {name}!\n\nWe are happy to let you know that your application to Mashbak was approved. You are now part of a community of Arab professionals who support each other.\n\nSign in with this email address, complete your profile and start connecting with members and joining events.",
      "מזל טוב {name}!\n\nשמחים לבשר שבקשת ההצטרפות שלך למשבק אושרה. מעכשיו את/ה חלק מקהילה של אנשי מקצוע ערבים שתומכים זה בזה.\n\nהתחבר/י עם כתובת המייל הזו, השלם/י את הפרופיל והתחל/י ליצור קשרים ולהירשם לאירועים.",
    ),
    cta: { label: L("الدخول إلى المنصة", "Sign in to Mashbak", "כניסה למשבק"), path: "/login" },
    wa: ["name"],
  },
  application_rejected: {
    audience: "public",
    subject: L("بخصوص طلب انضمامك إلى مشبك", "About your Mashbak application", "לגבי בקשת ההצטרפות שלך למשבק"),
    body: L(
      "أهلًا {name}،\n\nشكرًا على اهتمامك بمشبك. بعد مراجعة طلبك قررنا عدم قبوله في هذه المرحلة.\n\n{reason}\n\nنرحّب بتقديم طلب جديد مستقبلًا، ونتمنى لك كل التوفيق في مسيرتك.",
      "Hi {name},\n\nThank you for your interest in Mashbak. After reviewing your application we decided not to accept it at this stage.\n\n{reason}\n\nYou are welcome to apply again in the future. We wish you all the best in your career.",
      "שלום {name},\n\nתודה על ההתעניינות במשבק. לאחר בחינת הבקשה החלטנו שלא לקבל אותה בשלב זה.\n\n{reason}\n\nנשמח שתגיש/י בקשה חדשה בעתיד. מאחלים לך הצלחה רבה בדרך המקצועית.",
    ),
    wa: ["name"],
  },
  contact_received: {
    audience: "public",
    subject: L("وصلتنا رسالتك", "We got your message", "קיבלנו את ההודעה שלך"),
    body: L(
      "أهلًا {name}،\n\nشكرًا على تواصلك مع مشبك. وصلتنا رسالتك وسنعود إليك في أقرب وقت خلال أيام العمل.",
      "Hi {name},\n\nThanks for contacting Mashbak. Your message reached us and we will get back to you as soon as possible during working days.",
      "שלום {name},\n\nתודה שפנית למשבק. ההודעה שלך התקבלה ונחזור אליך בהקדם בימי העבודה.",
    ),
  },
  contact_reply: {
    audience: "public",
    subject: L("ردّ من فريق مشبك", "A reply from the Mashbak team", "תשובה מצוות משבק"),
    body: L("أهلًا {name}،\n\n{message}\n\nفريق مشبك", "Hi {name},\n\n{message}\n\nThe Mashbak team", "שלום {name},\n\n{message}\n\nצוות משבק"),
  },
  connection_request: {
    audience: "member",
    subject: L("{from} يريد التواصل معك على مشبك", "{from} wants to connect with you on Mashbak", "{from} רוצה ליצור איתך קשר במשבק"),
    body: L(
      "أهلًا {name}،\n\nأرسل لك {from} طلب تواصل:\n\n“{message}”\n\nيمكنك قبول الطلب أو رفضه من صفحة التواصل.",
      "Hi {name},\n\n{from} sent you a connection request:\n\n“{message}”\n\nYou can accept or decline it from your connections page.",
      "שלום {name},\n\n{from} שלח/ה לך בקשת קשר:\n\n“{message}”\n\nאפשר לאשר או לדחות את הבקשה בעמוד הקשרים.",
    ),
    cta: { label: L("عرض الطلب", "View request", "לצפייה בבקשה"), path: "/app/connections" },
    wa: ["name", "from"],
  },
  connection_accepted: {
    audience: "member",
    subject: L("{from} قبل طلب التواصل", "{from} accepted your connection request", "{from} אישר/ה את בקשת הקשר"),
    body: L(
      "أهلًا {name}،\n\nخبر جيد: {from} قبل طلب التواصل. يمكنك الآن رؤية تفاصيل التواصل والبدء بالحديث.",
      "Hi {name},\n\nGood news: {from} accepted your connection request. You can now see their contact details and start talking.",
      "שלום {name},\n\nחדשות טובות: {from} אישר/ה את בקשת הקשר. עכשיו אפשר לראות את פרטי הקשר ולהתחיל לדבר.",
    ),
    cta: { label: L("عرض الملف", "View profile", "לפרופיל"), path: "/app/members/{fromId}" },
    wa: ["name", "from"],
  },
  job_application: {
    audience: "member",
    subject: L("طلب جديد على وظيفة {job}", "New application for {job}", "מועמדות חדשה למשרה {job}"),
    body: L(
      "أهلًا {name}،\n\nقدّم {from} طلبًا على الوظيفة التي نشرتها: {job}.\n\n“{message}”\n\nراجع الطلب واقبله أو ارفضه من صفحة الوظيفة.",
      "Hi {name},\n\n{from} applied to the job you posted: {job}.\n\n“{message}”\n\nReview it and accept or decline from the job page.",
      "שלום {name},\n\n{from} הגיש/ה מועמדות למשרה שפרסמת: {job}.\n\n“{message}”\n\nאפשר לבחון ולאשר או לדחות מעמוד המשרה.",
    ),
    cta: { label: L("عرض الطلب", "Review application", "לצפייה במועמדות"), path: "/app/jobs/{jobId}" },
    wa: ["name", "from", "job"],
  },
  job_application_update: {
    audience: "member",
    subject: L("تحديث على طلبك لوظيفة {job}", "Update on your application for {job}", "עדכון לגבי המועמדות למשרה {job}"),
    body: L(
      "أهلًا {name}،\n\n{status}\n\nالوظيفة: {job}",
      "Hi {name},\n\n{status}\n\nJob: {job}",
      "שלום {name},\n\n{status}\n\nמשרה: {job}",
    ),
    cta: { label: L("عرض الوظيفة", "View job", "למשרה"), path: "/app/jobs/{jobId}" },
    wa: ["name", "job"],
  },
  event_registered: {
    audience: "member",
    subject: L("تم تسجيلك: {event}", "You're registered: {event}", "נרשמת: {event}"),
    body: L(
      "أهلًا {name}،\n\nتم تسجيلك بنجاح إلى {event}.\n\nالموعد: {when}\nالمكان: {where}\n\nتذكرتك مع رمز الدخول (QR) موجودة في المنصة.",
      "Hi {name},\n\nYou are registered for {event}.\n\nWhen: {when}\nWhere: {where}\n\nYour ticket with the entry QR code is waiting in the platform.",
      "שלום {name},\n\nנרשמת בהצלחה ל{event}.\n\nמתי: {when}\nאיפה: {where}\n\nהכרטיס שלך עם קוד הכניסה (QR) מחכה במערכת.",
    ),
    cta: { label: L("عرض التذكرة", "View ticket", "לכרטיס"), path: "/app/events/{eventId}" },
    wa: ["name", "event", "when"],
  },
  event_waitlisted: {
    audience: "member",
    subject: L("أنت على قائمة الانتظار: {event}", "You're on the waitlist: {event}", "את/ה ברשימת ההמתנה: {event}"),
    body: L(
      "أهلًا {name}،\n\nالفعالية {event} ممتلئة حاليًا، لذا أضفناك إلى قائمة الانتظار. سنبلغك فورًا إذا تحرر مكان.",
      "Hi {name},\n\n{event} is full right now, so we added you to the waitlist. We will let you know right away if a seat opens.",
      "שלום {name},\n\nהאירוע {event} מלא כרגע, לכן הוספנו אותך לרשימת ההמתנה. נעדכן מיד אם יתפנה מקום.",
    ),
    cta: { label: L("تفاصيل الفعالية", "Event details", "פרטי האירוע"), path: "/app/events/{eventId}" },
    wa: ["name", "event"],
  },
  event_promoted: {
    audience: "member",
    subject: L("تحرر مكان! أنت مسجل الآن: {event}", "A seat opened! You're in: {event}", "התפנה מקום! נרשמת: {event}"),
    body: L(
      "أهلًا {name}،\n\nتحرر مكان في {event} وانتقلت من قائمة الانتظار إلى المسجلين.\n\nالموعد: {when}",
      "Hi {name},\n\nA seat opened at {event} and you moved from the waitlist to registered.\n\nWhen: {when}",
      "שלום {name},\n\nהתפנה מקום ב{event} ועברת מרשימת ההמתנה לרשימת הנרשמים.\n\nמתי: {when}",
    ),
    cta: { label: L("عرض التذكرة", "View ticket", "לכרטיס"), path: "/app/events/{eventId}" },
    wa: ["name", "event", "when"],
  },
  event_reminder: {
    audience: "member",
    subject: L("تذكير: {event} {soon}", "Reminder: {event} {soon}", "תזכורת: {event} {soon}"),
    body: L(
      "أهلًا {name}،\n\nنذكّرك بأن {event} سيبدأ {soon}.\n\nالموعد: {when}\nالمكان: {where}\n\nنراك هناك!",
      "Hi {name},\n\nA reminder that {event} starts {soon}.\n\nWhen: {when}\nWhere: {where}\n\nSee you there!",
      "שלום {name},\n\nתזכורת: {event} מתחיל {soon}.\n\nמתי: {when}\nאיפה: {where}\n\nנתראה שם!",
    ),
    cta: { label: L("عرض التذكرة", "View ticket", "לכרטיס"), path: "/app/events/{eventId}" },
    wa: ["name", "event", "when"],
  },
  broadcast: {
    audience: "member",
    subject: L("{title}", "{title}", "{title}"),
    body: L("أهلًا {name}،\n\n{message}", "Hi {name},\n\n{message}", "שלום {name},\n\n{message}"),
    cta: { label: L("فتح المنصة", "Open Mashbak", "לפתיחת משבק"), path: "/app" },
    wa: ["name", "title"],
  },
  admin_new_application: {
    audience: "admin",
    subject: L("طلب انضمام جديد: {applicant}", "New application: {applicant}", "בקשת הצטרפות חדשה: {applicant}"),
    body: L(
      "طلب انضمام جديد بانتظار المراجعة.\n\nالاسم: {applicant}\nالمسمى: {headline}\nالشركة: {company}\nالخبرة: {years}\nالبريد: {email}\nالهاتف: {phone}",
      "A new application is waiting for review.\n\nName: {applicant}\nTitle: {headline}\nCompany: {company}\nExperience: {years}\nEmail: {email}\nPhone: {phone}",
      "בקשת הצטרפות חדשה ממתינה לבדיקה.\n\nשם: {applicant}\nתפקיד: {headline}\nחברה: {company}\nניסיון: {years}\nמייל: {email}\nטלפון: {phone}",
    ),
    cta: { label: L("مراجعة الطلب", "Review application", "לבדיקת הבקשה"), path: "/admin/applications" },
  },
  admin_new_contact: {
    audience: "admin",
    subject: L("رسالة جديدة من {from}", "New message from {from}", "הודעה חדשה מ{from}"),
    body: L(
      "رسالة جديدة من نموذج التواصل.\n\nالاسم: {from}\nالبريد: {email}\nالهاتف: {phone}\nالموضوع: {subject}\n\n{message}",
      "New message from the contact form.\n\nName: {from}\nEmail: {email}\nPhone: {phone}\nSubject: {subject}\n\n{message}",
      "הודעה חדשה מטופס יצירת הקשר.\n\nשם: {from}\nמייל: {email}\nטלפון: {phone}\nנושא: {subject}\n\n{message}",
    ),
    cta: { label: L("فتح الرسائل", "Open messages", "להודעות"), path: "/admin/messages" },
  },
} satisfies Record<string, Template>;

export type TemplateKey = keyof typeof TEMPLATES;
export const TEMPLATE_KEYS = Object.keys(TEMPLATES) as TemplateKey[];

/** Default WhatsApp template name in Meta for each key (overridable from the dashboard). */
export const waName = (key: TemplateKey) => `mashbak_${key}`;
