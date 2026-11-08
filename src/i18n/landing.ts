import type { Locale } from "./config";

/* Landing page copy. The conversation in the hero is illustrative (no real people). */
const ar = {
  hero: {
    title: "شبكتك المهنية من الداخل",
    sub: "مجتمع مهنيين عرب منذ 2017. اعثر على أعضاء يعملون في الشركة التي تطمح إليها، واطلب منهم توصية أو محادثة قصيرة.",
    apply: "قدّم طلب انضمام", login: "لديك حساب؟ ادخل", members: "عضوًا وعضوة",
  },
  convo: {
    q: "وجدت وظيفة مديرة منتج في شركة تقنية بيوكنعام. من يعمل هناك؟",
    a: "3 أعضاء من مشبك يعملون هناك",
    people: [
      { n: "سناء", r: "مديرة منتج" },
      { n: "مجد", r: "مهندس برمجيات" },
      { n: "تامر", r: "قائد فريق جودة" },
    ],
    ask: "اطلب توصية",
    fair: "الترتيب يتغيّر كل يوم، كي لا يُثقل على أحد",
    reply: "مجد وافق على توصيتك",
  },
  fit: {
    title: "يكمّل لينكدإن ومجموعة الواتساب",
    items: [
      { k: "linkedin", t: "لينكدإن", d: "ملفك العلني والتواصل مع الغرباء" },
      { k: "whatsapp", t: "مجموعة الواتساب", d: "إعلانات ومحادثات سريعة" },
      { k: "mashbak", t: "مشبك", d: "أشخاص قريبون يساعدونك فعلًا، وطلبات تُتابَع حتى النتيجة" },
    ],
  },
  features: {
    title: "ماذا تفعل داخل مشبك",
    items: [
      { k: "companies", t: "اعرف من يعمل أين", d: "لكل شركة صفحة تعرض أعضاء مشبك فيها ووظائفها المفتوحة، مستوردة تلقائيًا من موقع الشركة." },
      { k: "referral", t: "اطلب توصية وتابعها", d: "اختر عضوًا، أرفق سيرتك الذاتية، وتابع الطلب خطوة بخطوة حتى المقابلة.", steps: ["أُرسل", "وافق", "مقابلة", "تعيين"] },
      { k: "asks", t: "اطلب مساعدة أو قدّمها", d: "مقابلة تجريبية، مراجعة سيرة ذاتية، أو تجربة انتقال مهني. اكتب ما تحتاجه أو ما تجيده." },
    ],
  },
  how: {
    title: "الانضمام في ثلاث خطوات",
    steps: [
      { t: "قدّم طلبًا قصيرًا", d: "دقيقتان: خبرتك ومجالك ومكان عملك اليوم." },
      { t: "نراجع طلبك", d: "يراجع فريق مشبك كل طلب، وتصلك الإجابة بالبريد الإلكتروني وواتساب." },
      { t: "ابدأ", d: "اربط ملفك بشركتك، اطلب توصية أو محادثة، وساعد غيرك." },
    ],
  },
  cta: { title: "خطوتك المهنية القادمة أقرب مما تظن", sub: "انضم إلى مهنيين عرب يساعد بعضهم بعضًا على الترقية والإدارة وتغيير المسار.", apply: "قدّم طلب انضمام" },
};

type LandingDict = typeof ar;

const en: LandingDict = {
  hero: {
    title: "Your professional network, from the inside",
    sub: "A community of Arab professionals since 2017. Find members who work at the company you're aiming for, and ask them for a referral or a short chat.",
    apply: "Apply to join", login: "Have an account? Log in", members: "members",
  },
  convo: {
    q: "I found a Product Manager role at a tech company in Yokneam. Who works there?",
    a: "3 Mashbak members work there",
    people: [
      { n: "Sana", r: "Product Manager" },
      { n: "Majd", r: "Software Engineer" },
      { n: "Tamer", r: "QA Team Lead" },
    ],
    ask: "Ask for a referral",
    fair: "The order changes every day, so nobody gets flooded",
    reply: "Majd agreed to refer you",
  },
  fit: {
    title: "It completes LinkedIn and the WhatsApp group",
    items: [
      { k: "linkedin", t: "LinkedIn", d: "Your public profile and cold outreach" },
      { k: "whatsapp", t: "The WhatsApp group", d: "Announcements and quick chats" },
      { k: "mashbak", t: "Mashbak", d: "People close to you who actually help, and requests tracked to the outcome" },
    ],
  },
  features: {
    title: "What you do inside Mashbak",
    items: [
      { k: "companies", t: "See who works where", d: "Every company has a page with its Mashbak members and open jobs, imported automatically from its careers site." },
      { k: "referral", t: "Ask for a referral and follow it", d: "Pick a member, attach your CV, and follow the request step by step until the interview.", steps: ["Sent", "Accepted", "Interview", "Hired"] },
      { k: "asks", t: "Ask for help, or offer it", d: "A mock interview, a CV review, a career move you've made. Post what you need or what you're good at." },
    ],
  },
  how: {
    title: "Joining takes three steps",
    steps: [
      { t: "Send a short application", d: "Two minutes: your experience, your field and where you work today." },
      { t: "We review it", d: "The Mashbak team reviews every application. You'll hear back by email and WhatsApp." },
      { t: "Get started", d: "Link your profile to your company, ask for a referral or a chat, and help others." },
    ],
  },
  cta: { title: "Your next career step is closer than you think", sub: "Join Arab professionals who help each other get promoted, lead teams and switch fields.", apply: "Apply to join" },
};

const he: LandingDict = {
  hero: {
    title: "הרשת המקצועית שלך, מבפנים",
    sub: "קהילה של אנשי ונשות מקצוע ערבים מאז 2017. מוצאים חברים שעובדים בחברה שאליה שואפים, ומבקשים מהם המלצה או שיחה קצרה.",
    apply: "הגשת בקשת הצטרפות", login: "יש לך חשבון? כניסה", members: "חברות וחברים",
  },
  convo: {
    q: "מצאתי משרת מנהלת מוצר בחברת טכנולוגיה ביקנעם. מי עובד שם?",
    a: "3 חברי משבק עובדים שם",
    people: [
      { n: "סנאא", r: "מנהלת מוצר" },
      { n: "מג'ד", r: "מהנדס תוכנה" },
      { n: "תאמר", r: "ראש צוות QA" },
    ],
    ask: "בקשת המלצה",
    fair: "הסדר מתחלף כל יום, כדי שאף אחד לא יוצף",
    reply: "מג'ד הסכים להמליץ עליך",
  },
  fit: {
    title: "משלימה את לינקדאין ואת קבוצת הוואטסאפ",
    items: [
      { k: "linkedin", t: "לינקדאין", d: "הפרופיל הציבורי ופניות קרות" },
      { k: "whatsapp", t: "קבוצת הוואטסאפ", d: "הודעות ושיחות מהירות" },
      { k: "mashbak", t: "משבק", d: "אנשים קרובים שבאמת עוזרים, ובקשות שנעקבות עד התוצאה" },
    ],
  },
  features: {
    title: "מה עושים בתוך משבק",
    items: [
      { k: "companies", t: "לדעת מי עובד איפה", d: "לכל חברה עמוד עם חברי משבק שעובדים בה והמשרות הפתוחות שלה, שמיובאות אוטומטית מאתר הקריירה." },
      { k: "referral", t: "לבקש המלצה ולעקוב", d: "בוחרים חבר/ה, מצרפים קו\"ח, ועוקבים אחרי הבקשה שלב אחר שלב עד הראיון.", steps: ["נשלח", "אושר", "ראיון", "גיוס"] },
      { k: "asks", t: "לבקש עזרה או להציע", d: "ראיון דמה, מעבר על קו\"ח, ניסיון במעבר קריירה. כותבים מה צריך או במה אתם טובים." },
    ],
  },
  how: {
    title: "ההצטרפות בשלושה צעדים",
    steps: [
      { t: "שולחים בקשה קצרה", d: "שתי דקות: הניסיון, התחום ואיפה אתם עובדים היום." },
      { t: "אנחנו בודקים", d: "צוות משבק בודק כל בקשה. התשובה מגיעה במייל ובוואטסאפ." },
      { t: "מתחילים", d: "מקשרים את הפרופיל לחברה, מבקשים המלצה או שיחה, ועוזרים לאחרים." },
    ],
  },
  cta: { title: "הצעד המקצועי הבא קרוב יותר ממה שנדמה", sub: "הצטרפו לאנשי ונשות מקצוע ערבים שעוזרים זה לזה להתקדם, לנהל ולהחליף מסלול.", apply: "הגשת בקשת הצטרפות" },
};

export const landingDict: Record<Locale, LandingDict> = { ar, en, he };
export type { LandingDict };
