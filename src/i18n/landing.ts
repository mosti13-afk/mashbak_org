import type { Locale } from "./config";

/* Landing page copy. The hero demo uses illustrative names only (no real people or companies). */
const ar = {
  hero: {
    title: "مجتمع مهني يفتح لك الأبواب",
    sub: "مشبك يجمع مهنيين ومهنيات عربًا يعملون في الشركات الرائدة. اعثر على زملاء في الشركة التي تستهدفها، اطلب توصية مدروسة، وتقدّم بثقة نحو الإدارة والقيادة.",
    apply: "قدّم طلب انضمام", login: "تسجيل الدخول",
    stats: { members: "عضوًا وعضوة", companies: "شركة يعمل فيها أعضاؤنا", since: "سنة التأسيس" },
  },
  demo: {
    mbk: "مشبكني",
    q: "أستهدف وظيفة مديرة منتج في شركة تقنية في يوكنعام. من يمكنه مساعدتي؟",
    thinking: "يبحث بين الأعضاء",
    a: "وجدت 3 أعضاء يعملون هناك ومتاحين للتوصيات",
    people: [
      { n: "سناء", r: "مديرة منتج" },
      { n: "مجد", r: "مهندس برمجيات أول" },
      { n: "تامر", r: "قائد فريق جودة" },
    ],
    open: "متاح للتوصيات",
    ask: "اطلب توصية من مجد", sent: "أُرسل الطلب",
    toast: "مجد وافق على طلب التوصية", toastSub: "وصلك إشعار عبر واتساب والبريد الإلكتروني",
    fair: "يتغيّر ترتيب الأعضاء يوميًا لتوزيع الطلبات بعدل",
  },
  uses: {
    title: "كل ما تحتاجه لخطوتك المهنية التالية",
    sub: "أدوات عملية صُممت حول احتياجات الأعضاء: الوصول إلى الأشخاص المناسبين، ومتابعة كل طلب حتى نتيجته.",
    companies: { t: "زملاء داخل الشركات", d: "صفحة لكل شركة تضم أعضاء مشبك العاملين فيها ووظائفها المفتوحة، مستوردة تلقائيًا من موقع التوظيف الرسمي.", co: "شركة تقنية", members: "5 أعضاء", jobs: "12 وظيفة مفتوحة" },
    referral: { t: "توصيات بمسار واضح", d: "اختر زميلًا، أرفق سيرتك الذاتية، وتابع حالة الطلب من الإرسال حتى المقابلة والتعيين.", steps: ["أُرسل", "قُبل", "مقابلة", "تعيين"] },
    asks: { t: "طلبات وعروض مساعدة", d: "اطلب مقابلة تجريبية أو مراجعة لسيرتك الذاتية، أو اعرض خبرتك على من يحتاجها من الأعضاء.", tag: "بحاجة إلى", text: "مقابلة تجريبية لوظيفة محلل بيانات", replies: "3 ردود" },
    notify: { t: "إشعارات عبر القناة التي تختارها", d: "تصلك طلبات التوصية والردود وتذكيرات الفعاليات في التطبيق، وعبر البريد الإلكتروني وواتساب والرسائل النصية حسب اختيارك.", channels: ["التطبيق", "البريد الإلكتروني", "واتساب", "رسائل نصية"] },
  },
  mbk: {
    title: "مشبكني، مساعدك المهني الذكي",
    sub: "مساعد مبني على بيانات المجتمع الحيّة: الأعضاء والشركات والوظائف والفعاليات. اسأله بالعربية أو العبرية أو الإنجليزية، ويقترح عليك الخطوة التالية.",
    can: [
      "يقترح عليك الأعضاء الأنسب للتواصل في الشركة التي تستهدفها",
      "يساعدك في صياغة طلب توصية واضح ومختصر",
      "يرشّح لك وظائف وفعاليات تلائم أهدافك المهنية",
      "يجيبك عن أسئلة المقابلات والترقية والانتقال المهني",
    ],
    limitsTitle: "مبادئ واضحة",
    limits: ["لا يرسل أي رسالة باسمك دون موافقتك", "لا يشارك معلوماتك خارج مجتمع مشبك", "قرارات القبول والتوصية بيد الأشخاص دائمًا"],
    q: "كيف أستعد لمقابلة لوظيفة إدارية بعد ست سنوات في التطوير؟",
    a: "ابدأ بثلاث تجارب قيادية من عملك الحالي، ثم تحدّث مع سناء: انتقلت إلى الإدارة في الشركة نفسها قبل عامين.",
  },
  how: {
    title: "الانضمام في ثلاث خطوات",
    steps: [
      { t: "قدّم طلبك", d: "نموذج قصير يستغرق دقيقتين: خبرتك ومجالك والقنوات التي تفضّل أن نتواصل معك عبرها." },
      { t: "مراجعة الفريق", d: "يراجع فريق مشبك كل طلب حفاظًا على جودة المجتمع، ويبلغك بالنتيجة عبر البريد الإلكتروني وواتساب." },
      { t: "ابدأ رحلتك", d: "أكمل ملفك، اربطه بشركتك، وابدأ بالتواصل مع الأعضاء والمشاركة في الفعاليات." },
    ],
  },
  cta: { title: "انضم إلى مجتمع يدفعك إلى الأمام", sub: "شبكة من المهنيين العرب الملتزمين بدعم بعضهم في الترقية والقيادة والانتقال المهني.", apply: "قدّم طلب انضمام" },
};

type LandingDict = typeof ar;

const en: LandingDict = {
  hero: {
    title: "The professional community that opens doors",
    sub: "Mashbak brings together Arab professionals working at leading companies. Find colleagues at the company you are targeting, request a thoughtful referral, and advance with confidence toward management and leadership.",
    apply: "Apply to join", login: "Sign in",
    stats: { members: "members", companies: "companies where members work", since: "founded" },
  },
  demo: {
    mbk: "Mashbakni",
    q: "I'm targeting a Product Manager role at a tech company in Yokneam. Who can help me?",
    thinking: "Searching members",
    a: "I found 3 members who work there and are open to referrals",
    people: [
      { n: "Sana", r: "Product Manager" },
      { n: "Majd", r: "Senior Software Engineer" },
      { n: "Tamer", r: "QA Team Lead" },
    ],
    open: "Open to referrals",
    ask: "Ask Majd for a referral", sent: "Request sent",
    toast: "Majd accepted your referral request", toastSub: "You were notified on WhatsApp and by email",
    fair: "Member order changes daily so requests are shared fairly",
  },
  uses: {
    title: "Everything you need for your next career step",
    sub: "Practical tools built around what members need: reaching the right people, and following every request through to its outcome.",
    companies: { t: "Colleagues inside companies", d: "Every company has a page with the Mashbak members who work there and its open roles, imported automatically from its official careers site.", co: "Tech company", members: "5 members", jobs: "12 open roles" },
    referral: { t: "Referrals with a clear path", d: "Choose a colleague, attach your CV, and follow the request from sent to interview and hire.", steps: ["Sent", "Accepted", "Interview", "Hired"] },
    asks: { t: "Asks and offers", d: "Request a mock interview or a CV review, or offer your expertise to members who need it.", tag: "Looking for", text: "A mock interview for a Data Analyst role", replies: "3 replies" },
    notify: { t: "Notifications on the channel you choose", d: "Referral requests, replies and event reminders reach you in the app, and by email, WhatsApp or text message, as you prefer.", channels: ["App", "Email", "WhatsApp", "Text message"] },
  },
  mbk: {
    title: "Mashbakni, your AI career assistant",
    sub: "An assistant built on live community data: members, companies, roles and events. Ask in Arabic, Hebrew or English, and it suggests your next step.",
    can: [
      "Suggests the best members to reach at the company you're targeting",
      "Helps you write a clear, concise referral request",
      "Recommends roles and events that match your goals",
      "Answers questions about interviews, promotion and career moves",
    ],
    limitsTitle: "Clear principles",
    limits: ["Never sends a message on your behalf without your approval", "Never shares your information outside the Mashbak community", "Admission and referral decisions always stay with people"],
    q: "How do I prepare for a management interview after six years in development?",
    a: "Start with three leadership stories from your current role, then talk to Sana: she moved into management at the same company two years ago.",
  },
  how: {
    title: "Joining takes three steps",
    steps: [
      { t: "Apply", d: "A short form that takes two minutes: your experience, your field, and how you prefer us to reach you." },
      { t: "Team review", d: "The Mashbak team reviews every application to keep the community strong, and lets you know by email and WhatsApp." },
      { t: "Get started", d: "Complete your profile, link it to your company, and start connecting with members and joining events." },
    ],
  },
  cta: { title: "Join a community that moves you forward", sub: "A network of Arab professionals committed to helping each other get promoted, lead and change direction.", apply: "Apply to join" },
};

const he: LandingDict = {
  hero: {
    title: "הקהילה המקצועית שפותחת דלתות",
    sub: "משבק מחברת בין אנשי ונשות מקצוע ערבים שעובדים בחברות המובילות. מוצאים עמיתים בחברה שאליה מכוונים, מבקשים המלצה מבוססת ומתקדמים בביטחון לתפקידי ניהול והובלה.",
    apply: "הגשת בקשת הצטרפות", login: "כניסה",
    stats: { members: "חברות וחברים", companies: "חברות שבהן עובדים חברינו", since: "שנת הייסוד" },
  },
  demo: {
    mbk: "משבקני",
    q: "אני מכוונת לתפקיד מנהלת מוצר בחברת טכנולוגיה ביקנעם. מי יכול לעזור לי?",
    thinking: "מחפש בין החברים",
    a: "מצאתי 3 חברים שעובדים שם ופתוחים להמלצות",
    people: [
      { n: "סנאא", r: "מנהלת מוצר" },
      { n: "מג'ד", r: "מהנדס תוכנה בכיר" },
      { n: "תאמר", r: "ראש צוות QA" },
    ],
    open: "פתוח/ה להמלצות",
    ask: "בקשת המלצה ממג'ד", sent: "הבקשה נשלחה",
    toast: "מג'ד אישר את בקשת ההמלצה", toastSub: "קיבלת התראה בוואטסאפ ובמייל",
    fair: "סדר החברים מתחלף מדי יום כדי לחלק את הבקשות בהוגנות",
  },
  uses: {
    title: "כל מה שצריך לצעד המקצועי הבא",
    sub: "כלים מעשיים שנבנו סביב הצרכים של החברים: להגיע לאנשים הנכונים, ולעקוב אחרי כל בקשה עד התוצאה.",
    companies: { t: "עמיתים בתוך החברות", d: "לכל חברה עמוד עם חברי משבק שעובדים בה והמשרות הפתוחות שלה, שמיובאות אוטומטית מאתר הקריירה הרשמי.", co: "חברת טכנולוגיה", members: "5 חברים", jobs: "12 משרות פתוחות" },
    referral: { t: "המלצות במסלול ברור", d: "בוחרים עמית/ה, מצרפים קורות חיים ועוקבים אחרי הבקשה מהשליחה ועד הראיון והגיוס.", steps: ["נשלח", "אושר", "ראיון", "גיוס"] },
    asks: { t: "בקשות והצעות עזרה", d: "מבקשים ראיון דמה או מעבר על קורות החיים, או מציעים את הניסיון שלכם לחברים שצריכים אותו.", tag: "מחפש/ת", text: "ראיון דמה לתפקיד אנליסט/ית נתונים", replies: "3 תגובות" },
    notify: { t: "התראות בערוץ שבחרתם", d: "בקשות המלצה, תגובות ותזכורות לאירועים מגיעות באפליקציה, ובמייל, בוואטסאפ או במסרון, לפי הבחירה שלכם.", channels: ["אפליקציה", "מייל", "וואטסאפ", "מסרון"] },
  },
  mbk: {
    title: "משבקני, העוזר המקצועי החכם שלך",
    sub: "עוזר שנבנה על נתוני הקהילה העדכניים: חברים, חברות, משרות ואירועים. שואלים בערבית, בעברית או באנגלית, והוא מציע את הצעד הבא.",
    can: [
      "מציע את החברים המתאימים ביותר לפנייה בחברה שאליה אתם מכוונים",
      "עוזר לנסח בקשת המלצה ברורה ותמציתית",
      "ממליץ על משרות ואירועים שמתאימים למטרות שלכם",
      "עונה על שאלות בנושא ראיונות, קידום ומעבר קריירה",
    ],
    limitsTitle: "עקרונות ברורים",
    limits: ["לא שולח שום הודעה בשמכם בלי אישור", "לא משתף את המידע שלכם מחוץ לקהילת משבק", "החלטות קבלה והמלצה נשארות תמיד בידי אנשים"],
    q: "איך להתכונן לראיון לתפקיד ניהולי אחרי שש שנים בפיתוח?",
    a: "התחילו משלוש חוויות הובלה מהתפקיד הנוכחי, ואז דברו עם סנאא: היא עברה לניהול באותה חברה לפני שנתיים.",
  },
  how: {
    title: "ההצטרפות בשלושה צעדים",
    steps: [
      { t: "מגישים בקשה", d: "טופס קצר של שתי דקות: הניסיון, התחום והערוצים שבהם נוח לכם שניצור קשר." },
      { t: "בדיקת הצוות", d: "צוות משבק בודק כל בקשה כדי לשמור על איכות הקהילה, ומעדכן אתכם במייל ובוואטסאפ." },
      { t: "יוצאים לדרך", d: "משלימים פרופיל, מקשרים אותו לחברה ומתחילים ליצור קשרים ולהשתתף באירועים." },
    ],
  },
  cta: { title: "הצטרפו לקהילה שמקדמת אתכם", sub: "רשת של אנשי ונשות מקצוע ערבים שמחויבים לעזור זה לזה להתקדם, להוביל ולשנות כיוון.", apply: "הגשת בקשת הצטרפות" },
};

export const landingDict: Record<Locale, LandingDict> = { ar, en, he };
export type { LandingDict };
