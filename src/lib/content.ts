// Default CMS content. Used by demo mode and to generate supabase/seed.sql.
import type { Faq, MemberReview, Program, SiteSettings } from "./types";

export const defaultPrograms: Program[] = [
  {
    id: "prog-career-boost",
    slug: "career-boost",
    title: { ar: "دفعة مهنية", en: "Career Boost", he: "דחיפה מקצועית" },
    summary: {
      ar: "برنامج مكثّف لتسريع الترقية والانتقال إلى الدور التالي.",
      en: "An intensive track to accelerate your promotion or next move.",
      he: "מסלול אינטנסיבי להאצת קידום או המעבר לתפקיד הבא.",
    },
    body: {
      ar: "نعمل معك على قصتك المهنية، خطة الترقية، المقابلات والتفاوض، مع مرشدين من الشبكة سبقوك إلى نفس الطريق.",
      en: "Work on your professional story, promotion plan, interviews and negotiation, with mentors from the network who've walked the same road.",
      he: "עבודה על הסיפור המקצועי, תוכנית הקידום, ראיונות ומשא ומתן, עם מנטורים מהרשת שעשו את אותה הדרך.",
    },
    for_who: {
      ar: "محترفون في منتصف مسيرتهم يسعون للترقية",
      en: "Mid-career professionals going for promotion",
      he: "אנשי מקצוע באמצע הקריירה שמכוונים לקידום",
    },
    duration: { ar: "3 أشهر", en: "3 months", he: "3 חודשים" },
    sessions: { ar: "12 لقاء", en: "12 sessions", he: "12 מפגשים" },
    benefits: [
      { ar: "ورشات مهنية تطبيقية", en: "Hands-on career workshops", he: "סדנאות קריירה מעשיות" },
      { ar: "جلسات إرشاد فردية", en: "1:1 mentoring sessions", he: "מפגשי חניכה אישיים" },
      { ar: "تحضير للمقابلات والتفاوض", en: "Interview and negotiation prep", he: "הכנה לראיונות ולמשא ומתן" },
    ],
    color: "#117286",
    icon: "rocket",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "prog-nexecutives",
    slug: "nexecutives",
    title: { ar: "NEXecutives, القادة التنفيذيون", en: "NEXecutives", he: "NEXecutives" },
    summary: {
      ar: "ملتقى حصري للمديرين والقادة التنفيذيين لتوسيع التأثير.",
      en: "An exclusive circle for managers and executives to widen their impact.",
      he: "מעגל בלעדי למנהלים ובכירים להרחבת ההשפעה.",
    },
    body: {
      ar: "لقاءات مغلقة مع قيادات من الصناعة، تبادل تحديات حقيقية، وبناء شراكات استراتيجية بين الأعضاء.",
      en: "Closed-door sessions with industry leaders, real challenges shared in confidence, and strategic partnerships between members.",
      he: "מפגשים סגורים עם מובילי תעשייה, שיתוף אתגרים אמיתיים ובניית שותפויות אסטרטגיות בין החברים.",
    },
    for_who: { ar: "مديرون وقادة", en: "Managers and leaders", he: "מנהלים ומובילים" },
    duration: { ar: "6 أشهر", en: "6 months", he: "6 חודשים" },
    sessions: { ar: "لقاءان شهريًا", en: "Twice a month", he: "פעמיים בחודש" },
    benefits: [
      { ar: "ملتقيات تنفيذية مغلقة", en: "Closed executive roundtables", he: "שולחנות עגולים סגורים לבכירים" },
      { ar: "تبادل خبرات بين الأقران", en: "Peer advisory exchange", he: "ייעוץ עמיתים" },
      { ar: "فرص شراكة واستثمار", en: "Partnership and investment opportunities", he: "הזדמנויות לשותפות ולהשקעה" },
    ],
    color: "#4e8c74",
    icon: "crown",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "prog-hightech-club",
    slug: "hightech-club",
    title: { ar: "نادي الهايتك", en: "HighTech Club", he: "מועדון ההייטק" },
    summary: {
      ar: "لقاءات شهرية لمحترفي التكنولوجيا: محتوى تقني، علاقات ووظائف.",
      en: "Monthly meetups for tech professionals: technical depth, relationships and roles.",
      he: "מפגשים חודשיים לאנשי טכנולוגיה: עומק טכני, קשרים ומשרות.",
    },
    body: {
      ar: "محاضرات من مهندسين وقادة تقنيين، جلسات عرض مشاريع، وتعارف مع فرق توظّف الآن.",
      en: "Talks from engineers and tech leads, project show-and-tells, and introductions to teams that are hiring now.",
      he: "הרצאות של מהנדסים ומובילים טכנולוגיים, הצגת פרויקטים והיכרות עם צוותים שמגייסים עכשיו.",
    },
    for_who: { ar: "مهندسون ومطوّرون ومديرو منتجات", en: "Engineers, developers and product people", he: "מהנדסים, מפתחים ואנשי מוצר" },
    duration: { ar: "مستمر", en: "Ongoing", he: "מתמשך" },
    sessions: { ar: "شهريًا", en: "Monthly", he: "חודשי" },
    benefits: [
      { ar: "محاضرات تقنية متخصصة", en: "Specialist tech talks", he: "הרצאות טכנולוגיות" },
      { ar: "تعارف مع فرق توظّف", en: "Meet teams that are hiring", he: "היכרות עם צוותים מגייסים" },
      { ar: "توصيات داخلية للوظائف", en: "Internal referrals to roles", he: "המלצות פנימיות למשרות" },
    ],
    color: "#6795a8",
    icon: "cpu",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "prog-women-lead",
    slug: "women-lead",
    title: { ar: "قيادات نسائية", en: "Women Lead", he: "נשים מובילות" },
    summary: {
      ar: "برنامج تمكين للنساء في مواقع قيادية أو في الطريق إليها.",
      en: "An empowerment track for women in, or heading to, leadership.",
      he: "מסלול העצמה לנשים בתפקידי הובלה או בדרך אליהם.",
    },
    body: {
      ar: "إرشاد من قياديات في الشبكة، ورشات قيادة وحضور، وشبكة دعم مستمرة بعد البرنامج.",
      en: "Mentoring from women leaders in the network, leadership and presence workshops, and a support circle that continues after the program.",
      he: "חניכה ממובילות ברשת, סדנאות מנהיגות ונוכחות, ומעגל תמיכה שממשיך גם אחרי התוכנית.",
    },
    for_who: { ar: "نساء في مواقع قيادية أو يسعين إليها", en: "Women leading or aspiring to lead", he: "נשים מובילות או שואפות להוביל" },
    duration: { ar: "4 أشهر", en: "4 months", he: "4 חודשים" },
    sessions: { ar: "16 لقاء", en: "16 sessions", he: "16 מפגשים" },
    benefits: [
      { ar: "إرشاد من قياديات", en: "Mentoring by women leaders", he: "חניכה ממובילות" },
      { ar: "ورشات قيادة", en: "Leadership workshops", he: "סדנאות מנהיגות" },
      { ar: "شبكة دعم مستمرة", en: "An ongoing support circle", he: "מעגל תמיכה מתמשך" },
    ],
    color: "#80a69e",
    icon: "sparkles",
    sort_order: 4,
    is_active: true,
  },
];

export const defaultFaqs: Faq[] = [
  {
    id: "faq-1",
    question: { ar: "من يمكنه التقديم لشبكة مشبك؟", en: "Who can apply to Mashbak?", he: "מי יכול להגיש בקשה למשבק?" },
    answer: {
      ar: "محترفون عرب بعمر 18 عامًا فأكثر، مع خبرة مهنية 4 سنوات فأكثر في الغالب، ويسعون للتقدّم، ترقية، دور إداري أو انتقال، ومستعدون لمساعدة غيرهم.",
      en: "Arab professionals aged 18+, usually with 4+ years of experience, who are working toward their next step, promotion, a managerial role or a move, and are willing to help others.",
      he: "אנשי מקצוע ערבים בני 18 ומעלה, לרוב עם 4+ שנות ניסיון, שעובדים לקראת הצעד הבא, קידום, תפקיד ניהולי או מעבר, ומוכנים לעזור לאחרים.",
    },
    sort_order: 1,
    is_active: true,
  },
  {
    id: "faq-2",
    question: { ar: "هل العضوية مجانية؟", en: "Is membership free?", he: "האם החברות בתשלום?" },
    answer: {
      ar: "نعم، العضوية مجانية. بعض البرامج المكثّفة قد تتطلب التزامًا بالحضور.",
      en: "Yes, membership is free. Some intensive programs ask for an attendance commitment.",
      he: "החברות חינם. חלק מהתוכניות האינטנסיביות דורשות התחייבות להשתתפות.",
    },
    sort_order: 2,
    is_active: true,
  },
  {
    id: "faq-3",
    question: { ar: "كم تستغرق مراجعة الطلب؟", en: "How long does the review take?", he: "כמה זמן לוקחת הבדיקה?" },
    answer: {
      ar: "نراجع الطلبات أسبوعيًا. إذا كان طلبك مناسبًا، سنتواصل معك لمكالمة تعارف قصيرة.",
      en: "We review applications weekly. If it's a fit, we'll reach out for a short welcome call.",
      he: "אנחנו בודקים בקשות מדי שבוע. אם יש התאמה, ניצור קשר לשיחת היכרות קצרה.",
    },
    sort_order: 3,
    is_active: true,
  },
  {
    id: "faq-4",
    question: { ar: "كيف تعمل التوصيات؟", en: "How do referrals work?", he: "איך עובדות ההמלצות?" },
    answer: {
      ar: "كل وظيفة ينشرها عضو تظهر للأعضاء فورًا. تطلب التوصية من العضو الذي نشرها، وإذا وافق يوصي بك مباشرة في شركته.",
      en: "Any role a member posts is visible to members immediately. You ask the member who posted it for a referral, and if they accept, they refer you directly at their company.",
      he: "כל משרה שחבר/ה מפרסם/ת גלויה מיד לחברים. מבקשים המלצה ממי שפרסם, ואם מאשרים, הוא/היא ממליצים עליכם ישירות בחברה.",
    },
    sort_order: 4,
    is_active: true,
  },
  {
    id: "faq-5",
    question: { ar: "كيف أتواصل مع عضو آخر؟", en: "How do I reach another member?", he: "איך יוצרים קשר עם חבר/ה?" },
    answer: {
      ar: "من ملفه الشخصي، أرسل طلبًا قصيرًا تشرح فيه ما تريد أن تسأل. بعد الموافقة يظهر زر لمتابعة المحادثة على واتساب.",
      en: "From their profile, send a short request explaining what you'd like to ask. Once they accept, a button appears to continue on WhatsApp.",
      he: "מהפרופיל, שולחים בקשה קצרה עם מה שרוצים לשאול. לאחר אישור מופיע כפתור להמשך בוואטסאפ.",
    },
    sort_order: 5,
    is_active: true,
  },
  {
    id: "faq-6",
    question: { ar: "هل الفعاليات للأعضاء فقط؟", en: "Are events members-only?", he: "האם האירועים לחברים בלבד?" },
    answer: {
      ar: "معظمها نعم. بعض الفعاليات المفتوحة تُعلن على الموقع ويمكن لأي شخص حضورها.",
      en: "Most are. Some open events are announced on the site and anyone can attend.",
      he: "רובם כן. חלק מהאירועים פתוחים לציבור ומפורסמים באתר.",
    },
    sort_order: 6,
    is_active: true,
  },
];

export const defaultReviews: MemberReview[] = [
  {
    id: "rev-sahar",
    name: { ar: "سحر فارس", en: "Sahar Fares", he: "סחר פארס" },
    role_title: { ar: "QA Technical Lead", en: "QA Technical Lead", he: "QA Technical Lead" },
    organization: "Toluna",
    photo_url: "/members/sahar.jpg",
    quote: {
      ar: "أكتر إشي بميّز مشبك بالنسبة إلي هو الناس. مجتمع بيجمع أشخاص عندهم الشغف يتعلّموا، يدعموا بعض ويخلقوا فرص جديدة. مشبك أعطاني فرصة أطلع من إطار شغلي اليومي، أجرّب أشياء جديدة، وأكتشف جوانب من شخصيتي وقدراتي ما كنت منتبهة إلها قبل. والأحلى إنه العلاقات اللي بنيتها ما وقفت عند التعارف، بل تحوّلت لصداقات حقيقية وفرص ومبادرات إلها أثر، مش بس على مسيرتي المهنية، بل كمان على المستوى الشخصي.",
      en: "What sets Mashbak apart for me is the people. It brings together people with a passion to learn, support each other and create new opportunities. Mashbak gave me the chance to step outside my daily work, try new things, and discover sides of my personality and abilities I hadn't noticed before. Best of all, the relationships I built didn't stop at an introduction, they became real friendships, opportunities and initiatives with impact, not only on my career but personally too.",
      he: "מה שמייחד את משבק בשבילי הם האנשים. היא מחברת אנשים עם תשוקה ללמוד, לתמוך זה בזה וליצור הזדמנויות חדשות. משבק נתנה לי הזדמנות לצאת מהמסגרת של העבודה היומיומית, לנסות דברים חדשים ולגלות צדדים באישיות וביכולות שלי שלא שמתי לב אליהם קודם. והכי יפה, הקשרים שבניתי לא נעצרו בהיכרות, אלא הפכו לחברויות אמיתיות, הזדמנויות ויוזמות עם השפעה, לא רק על הקריירה שלי אלא גם ברמה האישית.",
    },
    sort_order: 1,
    is_active: true,
    created_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "rev-mahmoud",
    name: { ar: "محمود عرابي", en: "Mahmoud Arabi", he: "מחמוד ערבי" },
    role_title: { ar: "Industrial Engineer · SMB Consultant", en: "Industrial Engineer · SMB Consultant", he: "Industrial Engineer · SMB Consultant" },
    organization: null,
    photo_url: "/members/mahmoud.jpg",
    quote: {
      ar: "مشبك إلي أكتر من شبكة علاقات، هو مساحة بتوسّع الأفق وبتفتح أبواب. من خلاله تعرّفت على ناس من مجالات مختلفة، وكل واحد فيهم أضافلي إشي، والمحاضرات الغنية ساعدتني أتطوّر وأكبر. وبالنسبة إلي، هاي هي قوة مشبك: إنّه بيقوّي مجتمعنا العربي ومواهبه، وبيعطي كل واحد فينا مكان ينمو ويدعم غيره.",
      en: "For me Mashbak is more than a network, it's a space that widens your horizons and opens doors. Through it I met people from different fields, each of whom added something to me, and the rich lectures helped me develop and grow. To me, that's Mashbak's strength: it strengthens our Arab community and its talent, and gives each of us a place to grow and support others.",
      he: "בשבילי משבק היא יותר מרשת קשרים, היא מרחב שמרחיב אופקים ופותח דלתות. דרכה הכרתי אנשים מתחומים שונים, וכל אחד מהם הוסיף לי משהו, וההרצאות העשירות עזרו לי להתפתח ולצמוח. בעיניי זה הכוח של משבק: היא מחזקת את החברה הערבית ואת הכישרונות שלה, ונותנת לכל אחד מאיתנו מקום לצמוח ולתמוך באחרים.",
    },
    sort_order: 2,
    is_active: true,
    created_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "rev-manar",
    name: { ar: "منار سرحان", en: "Manar Sarhan", he: "מנאר סרחאן" },
    role_title: { ar: "مديرة حسابات وموجّهة مجموعات", en: "Accounts Manager & Group Facilitator", he: "מנהלת חשבונות ומנחת קבוצות" },
    organization: null,
    photo_url: "/members/manar.jpg",
    quote: {
      ar: "بالنسبة إلي، مشبك بيتي وأعضاء مشبك عيلتي. من خلال مشبك تعرفت على أشخاص مهنيين بفتخر فيهم، ناس بعطوا أمل وبأكدوا إنه مجتمعنا مليان طاقات وقدرات، وإنه رغم كل التحديات لسه في خير كثير. مشبك كانت مساحة للنمو والتطور، اكتسبت من خلالها مهارات جديدة، واكتشفت قدرات وجوانب بشخصيتي ما كنت أعرفها، وطورت من نفسي. والأهم إنها أعطتني مساحة أكون مبادرة، أشارك بمشاريع ومبادرات مجتمعية، وأكون ع قدّ التحدي. بالنسبة إلي، مشبك مش بس شبكة علاقات، هي بيت بنكبر فيه مع بعض وبنؤمن بقدرات بعض.",
      en: "For me, Mashbak is my home and its members are my family. Through Mashbak I met professionals I am proud of, people who give hope and prove that our community is full of energy and ability, and that despite all the challenges there is still so much good. Mashbak has been a space for growth and development. Through it I gained new skills, discovered abilities and sides of my personality I didn't know, and developed myself. Most importantly, it gave me room to take initiative, to take part in community projects and initiatives, and to rise to the challenge. For me, Mashbak is not just a network of relationships, it is a home where we grow together and believe in each other's abilities.",
      he: "בשבילי, משבק היא הבית שלי וחברי משבק הם המשפחה שלי. דרך משבק הכרתי אנשי מקצוע שאני גאה בהם, אנשים שנותנים תקווה ומוכיחים שהחברה שלנו מלאה באנרגיות וביכולות, ושלמרות כל האתגרים עדיין יש הרבה טוב. משבק הייתה מרחב לצמיחה ולהתפתחות. דרכה רכשתי מיומנויות חדשות, גיליתי יכולות וצדדים באישיות שלי שלא הכרתי, ופיתחתי את עצמי. והכי חשוב, היא נתנה לי מקום ליזום, לקחת חלק בפרויקטים וביוזמות קהילתיות, ולעמוד באתגר. בשבילי, משבק היא לא רק רשת קשרים, היא בית שבו אנחנו גדלים יחד ומאמינים זה ביכולות של זה.",
    },
    sort_order: 3,
    is_active: true,
    created_at: "2026-10-01T00:00:00Z",
  },
];

export const defaultSettings: SiteSettings = {
  hero: { eyebrow: {}, title: {}, highlight: {}, sub: {} },
  floatingAvatars: [
    "/members/sahar.jpg",
    "/members/m0.jpg",
    "/members/manar.jpg",
    "/members/m4.jpg",
    "/members/mahmoud.jpg",
    "/members/m7.jpg",
  ],
  stats: { members: 300, companies: 120, events: 24 },
  contact: { email: "info@mashbak.org", whatsapp: "", instagram: "", linkedin: "" },
};
