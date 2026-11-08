import type { Locale } from "./config";

/* Copy for the V2 member area. Arabic first; English and Hebrew mirror it. */
const ar = {
  nav: { home: "الرئيسية", jobs: "الوظائف", companies: "الشركات", requests: "الطلبات", asks: "بدّي / بقدر", members: "الأعضاء", events: "الفعاليات", mashbakni: "مشبكني", profile: "ملفي", network: "شبكتي", notifications: "الإشعارات" },
  home: {
    hello: "أهلًا {name}", sub: "ما خطوتك المهنية التالية؟ هنا الأشخاص الذين يمكنهم مساعدتك والفرص التي تناسبك.",
    setup: "ساعد الأعضاء في إيجادك", setupSub: "3 خطوات تُمكّن الأعضاء من طلب مساعدتك وتقديم مساعدتهم لك.",
    stepCompany: "اربط ملفك بشركتك", stepHelp: "اكتب بماذا يمكنك المساعدة", stepCv: "أضف رابط سيرتك الذاتية", complete: "أكمل ملفك",
    waiting: "بانتظار ردّك", waitingSub: "أعضاء طلبوا مساعدتك. كل رد يُحدث فرقًا، حتى الاعتذار بلطف.", jobsFollow: "وظائف في شركات تتابعها", jobsLatest: "وظائف جديدة",
    noFollow: "تابع شركات لتصلك وظائفها هنا.", meet: "أشخاص يستحق أن تتعرف عليهم", meetSub: "تتغيّر الاقتراحات كل يوم.", asks: "هل يحتاج أحد مساعدتك؟", events: "فعاليات قريبة",
    pulse: "نبض مشبك", members: "عضو", companies: "شركة", referrals: "توصية", hires: "تعيين", jobsOpen: "وظيفة مفتوحة", seeAll: "عرض الكل",
  },
  jobs: {
    title: "الوظائف", sub: "وظائف ينشرها الأعضاء ووظائف نستوردها من مواقع الشركات. ولكل وظيفة: من من أعضاء مشبك يعمل هناك.",
    all: "الكل", members: "من الأعضاء", careers: "من مواقع الشركات", following: "شركات أتابعها", mine: "وظائفي", search: "ابحث عن وظيفة، شركة أو مدينة",
    managerial: "أدوار إدارية فقط", share: "شارك وظيفة", insiders: "{n} من مشبك هناك", noInsiders: "لا أعضاء هناك بعد", fromCareers: "من موقع الشركة",
    postedBy: "نشرها {name}", asked: "طلبت توصية", accepted: "تمّت التوصية", empty: "لا وظائف هنا حاليًا.", apply: "التقديم على موقع الشركة", details: "عن الوظيفة",
    managerialTag: "دور إداري", closed: "مغلقة", close: "إغلاق الوظيفة", reopen: "إعادة فتح", posted: "تم نشر الوظيفة. أعضاء مشبك سيرونها الآن.",
  },
  job: {
    insidersTitle: "من يستطيع مساعدتك في {company}؟", insidersSub: "رتّبنا الأسماء بشكل عادل: الترتيب يختلف لكل عضو ويتجدد يوميًا، ويعطي الأولوية لمن عنده طلبات أقل.",
    showMore: "عرض أسماء أخرى", ask: "اطلب توصية", choose: "اختر لمن ترسل الطلب", message: "رسالتك", messagePh: "عرّف بنفسك باختصار ولماذا تناسب الوظيفة…",
    draft: "اكتب لي مسودة مع مشبكني", drafting: "يكتب…", cv: "رابط السيرة الذاتية", cvHint: "يُرفق مع الطلب. يمكنك حفظه في ملفك.", send: "إرسال الطلب",
    sent: "أرسلنا طلبك. ستصلك رسالة فور الرد.", status: "حالة طلبك", waitingFor: "بانتظار رد {name}", acceptedBy: "{name} وافق على توصيتك", declinedBy: "{name} اعتذر هذه المرة",
    askAnother: "اطلب من عضو آخر", withdraw: "سحب الطلب", none: "لا أحد من مشبك يعمل في {company} بعد.", noneSub: "اسأل المجتمع، أحدهم يعرف شخصًا هناك.", askCommunity: "اسأل المجتمع",
    signals: { new: "عضو جديد في الشبكة", responsive: "عادة يرد بسرعة", busy: "عنده طلبات كثيرة حاليًا", steady: "يساعد أعضاء" },
    helped: "ساعد {n}", poster: "ناشر الوظيفة", requests: "طلبات التوصية على وظيفتك", manage: "إدارة الطلبات", chat: "دردشة 20 دقيقة",
  },
  share: {
    title: "شارك وظيفة", sub: "الصق رابط الوظيفة من موقع الشركة وسنعبّئ التفاصيل تلقائيًا، أو اكتبها بنفسك.", link: "رابط الوظيفة", fetch: "اجلب التفاصيل",
    fetching: "نقرأ الصفحة…", fetched: "عبّأنا التفاصيل. راجعها قبل النشر.", failed: "لم نستطع قراءة الصفحة. أكمل التفاصيل يدويًا.", manual: "أو اكتب التفاصيل",
    jobTitle: "المسمى الوظيفي", company: "الشركة", location: "المكان", type: "نوع الوظيفة", mode: "طريقة العمل", managerial: "دور إداري", description: "الوصف",
    requirements: "المتطلبات", apply: "رابط التقديم", publish: "نشر الوظيفة", note: "أنت تظهر كجهة اتصال لهذه الوظيفة، وتصلك طلبات التوصية عليها.",
  },
  companies: {
    title: "الشركات", sub: "اعرف أين يعمل أعضاء مشبك، وتابع الشركات لتصلك وظائفها.", search: "ابحث عن شركة", following: "أتابعها", follow: "متابعة", unfollow: "إلغاء المتابعة",
    members: "{n} أعضاء", jobs: "{n} وظائف", add: "أضف شركة", addSub: "لم تجد شركتك؟ أضفها، وإذا أضفت رابط صفحة الوظائف نستورد وظائفها تلقائيًا.",
    name: "اسم الشركة", website: "الموقع", careers: "رابط صفحة الوظائف (اختياري)", sector: "القطاع", mine: "أعمل في هذه الشركة", save: "إضافة",
    insiders: "أعضاء من مشبك في {company}", openJobs: "وظائف مفتوحة", noJobs: "لا وظائف مفتوحة حاليًا.", noMembers: "لا أعضاء هنا بعد.", visit: "موقع الشركة", careersPage: "صفحة الوظائف",
    synced: "تتحدث الوظائف تلقائيًا من موقع الشركة", empty: "لا نتائج.", yourCompany: "شركتك",
  },
  requests: {
    title: "الطلبات", sub: "طلبات التوصية والدردشة، الواردة والمرسلة، في مكان واحد.", incoming: "طلبات لي", sent: "طلباتي", history: "السجل",
    referral: "طلب توصية", chat: "طلب دردشة", for: "لوظيفة", accept: "موافق", decline: "اعتذار", note: "ملاحظة أو نصيحة (اختياري)", notePh: "مثلًا: أرسل لي سيرتك على البريد، أو: الفريق لا يوظف حاليًا لكن جرّب قسم X",
    pending: "بانتظار الرد", accepted: "تمت الموافقة", declined: "اعتذار", withdrawn: "مسحوب", outcome: "ماذا حصل بعدها؟", outcomeSub: "يساعدنا نعرف أثر التوصيات ونشكر من ساعد.",
    outcomes: { interview: "وصلت لمقابلة", offer: "حصلت على عرض", hired: "تم توظيفي!", no_news: "لا جديد", rejected: "لم أُقبل" },
    whatsapp: "تواصل عبر واتساب", empty: "لا طلبات هنا.", cv: "السيرة الذاتية", openJob: "الوظيفة", from: "من", to: "إلى",
  },
  asks: {
    title: "بدّي / بقدر", sub: "اطلب مساعدة محددة أو اعرض ما يمكنك تقديمه. مكان للأشياء التي تضيع في مجموعة الواتساب.",
    asks: "طلبات", offers: "عروض", mine: "منشوراتي", newAsk: "أحتاج مساعدة", newOffer: "أستطيع المساعدة", replies: "{n} ردود", reply: "ردّ",
    replyPh: "اكتب كيف تقدر تساعد أو لماذا أنت مهتم…", replied: "وصل ردك. سيتواصل معك صاحب المنشور.", youReplied: "رددت على هذا", close: "إغلاق (تم حلها)", reopen: "إعادة فتح",
    closed: "مغلق", repliesTitle: "الردود", noReplies: "لا ردود بعد. سنبلغك عند وصول رد.", privateReplies: "الردود يراها صاحب المنشور فقط.",
    formTitleAsk: "بماذا تحتاج المساعدة؟", formTitleOffer: "ماذا يمكنك أن تقدّم؟", titlePh: "مثلًا: أبحث عن شخص انتقل من الهندسة إلى المنتج", bodyPh: "تفاصيل تساعد الآخرين على معرفة إن كانوا يستطيعون المساعدة",
    tags: "وسوم (مفصولة بفواصل)", publish: "نشر", empty: "لا منشورات هنا بعد.", connect: "تواصل",
  },
  members: {
    title: "الأعضاء", sub: "مهنيون عرب قريبون ومستعدون للمساعدة.", search: "ابحث بالاسم، المسمى، الشركة أو المهارة", chats: "متاحون لدردشة", mentors: "مرشدون",
    canHelp: "يمكنني المساعدة في", helped: "ساعد {n} أعضاء", requestChat: "اطلب دردشة 20 دقيقة", chatPh: "عن ماذا تودّ أن تتحدثا؟ مثلًا: كيف انتقلت إلى دور إداري؟", empty: "لا نتائج.",
    sendChat: "إرسال", chatSent: "أرسلنا طلب الدردشة.", connected: "متصلون", pendingChat: "الطلب بانتظار الرد",
  },
  badges: { referrer: "موصٍ", connector: "صانع روابط", helper: "سند", hire: "صنع تعيينًا", mentor: "مرشد" },
  profile: {
    help: "بماذا يمكنك أن تساعد؟", helpHint: "مفصولة بفواصل، مثلًا: مقابلات تقنية، الانتقال لدور إداري، CV", referrals: "أنا مستعد لتلقي طلبات توصية في شركتي",
    chats: "أنا متاح لدردشات قصيرة مع أعضاء", cv: "رابط السيرة الذاتية (Google Drive أو غيره)", company: "الشركة", companyHint: "اختر من القائمة لتظهر كعضو في صفحة الشركة.",
    impact: "أثرك في المجتمع",
  },
  pitchFallback: "",
};

type MemberDict = typeof ar;

const en: MemberDict = {
  nav: { home: "Home", jobs: "Jobs", companies: "Companies", requests: "Requests", asks: "Asks & offers", members: "Members", events: "Events", mashbakni: "Mashbakni", profile: "Profile", network: "My network", notifications: "Notifications" },
  home: {
    hello: "Hi {name}", sub: "What's your next career step? Here are the people who can help and the opportunities that fit you.",
    setup: "Help people find you", setupSub: "3 steps so members can ask you for help and offer theirs.",
    stepCompany: "Link your profile to your company", stepHelp: "Say what you can help with", stepCv: "Add a link to your CV", complete: "Complete profile",
    waiting: "Waiting for your reply", waitingSub: "Members asked for your help. Every reply matters, even a kind no.", jobsFollow: "Jobs at companies you follow", jobsLatest: "New jobs",
    noFollow: "Follow companies to see their jobs here.", meet: "People worth meeting", meetSub: "Suggestions change every day.", asks: "Can you help someone?", events: "Upcoming events",
    pulse: "Mashbak pulse", members: "members", companies: "companies", referrals: "referrals", hires: "hires", jobsOpen: "open jobs", seeAll: "See all",
  },
  jobs: {
    title: "Jobs", sub: "Jobs posted by members and jobs imported from company career sites. For every job: who from Mashbak works there.",
    all: "All", members: "From members", careers: "From career sites", following: "Companies I follow", mine: "My posts", search: "Search a job, company or city",
    managerial: "Management roles only", share: "Share a job", insiders: "{n} from Mashbak there", noInsiders: "No members there yet", fromCareers: "From the company site",
    postedBy: "Posted by {name}", asked: "Referral requested", accepted: "Referred", empty: "No jobs here right now.", apply: "Apply on the company site", details: "About the job",
    managerialTag: "Management", closed: "Closed", close: "Close job", reopen: "Reopen", posted: "Your job is live. Mashbak members can see it now.",
  },
  job: {
    insidersTitle: "Who can help you at {company}?", insidersSub: "The order is fair: it's different for every member, refreshes daily, and puts people with fewer open requests first.",
    showMore: "Show other names", ask: "Ask for a referral", choose: "Choose who to ask", message: "Your message", messagePh: "Introduce yourself briefly and why you fit the role…",
    draft: "Draft it with Mashbakni", drafting: "Writing…", cv: "CV link", cvHint: "Sent with your request. You can save it in your profile.", send: "Send request",
    sent: "Request sent. We'll message you as soon as they reply.", status: "Your request", waitingFor: "Waiting for {name}", acceptedBy: "{name} agreed to refer you", declinedBy: "{name} couldn't this time",
    askAnother: "Ask another member", withdraw: "Withdraw", none: "Nobody from Mashbak works at {company} yet.", noneSub: "Ask the community, someone may know a person there.", askCommunity: "Ask the community",
    signals: { new: "New in the network", responsive: "Usually replies fast", busy: "Has many requests right now", steady: "Helps members" },
    helped: "Helped {n}", poster: "Job poster", requests: "Referral requests on your job", manage: "Manage requests", chat: "20-min chat",
  },
  share: {
    title: "Share a job", sub: "Paste the job link from the company site and we'll fill in the details, or write them yourself.", link: "Job link", fetch: "Fetch details",
    fetching: "Reading the page…", fetched: "Details filled in. Review before publishing.", failed: "We couldn't read the page. Fill in the details manually.", manual: "Or write the details",
    jobTitle: "Job title", company: "Company", location: "Location", type: "Job type", mode: "Work mode", managerial: "Management role", description: "Description",
    requirements: "Requirements", apply: "Apply link", publish: "Publish job", note: "You appear as the contact for this job and receive its referral requests.",
  },
  companies: {
    title: "Companies", sub: "See who from Mashbak works where, and follow companies to get their jobs.", search: "Search a company", following: "Following", follow: "Follow", unfollow: "Unfollow",
    members: "{n} members", jobs: "{n} jobs", add: "Add a company", addSub: "Can't find your company? Add it. With a careers page link we import its jobs automatically.",
    name: "Company name", website: "Website", careers: "Careers page link (optional)", sector: "Sector", mine: "I work at this company", save: "Add",
    insiders: "Mashbak members at {company}", openJobs: "Open jobs", noJobs: "No open jobs right now.", noMembers: "No members here yet.", visit: "Company site", careersPage: "Careers page",
    synced: "Jobs update automatically from the company site", empty: "No results.", yourCompany: "Your company",
  },
  requests: {
    title: "Requests", sub: "Referral and chat requests, incoming and sent, in one place.", incoming: "To me", sent: "Sent", history: "History",
    referral: "Referral request", chat: "Chat request", for: "for", accept: "Accept", decline: "Decline", note: "Note or tip (optional)", notePh: "e.g. Email me your CV, or: the team isn't hiring now but try group X",
    pending: "Pending", accepted: "Accepted", declined: "Declined", withdrawn: "Withdrawn", outcome: "What happened next?", outcomeSub: "Helps us measure referrals and thank the people who helped.",
    outcomes: { interview: "Got an interview", offer: "Got an offer", hired: "I was hired!", no_news: "No news", rejected: "Not accepted" },
    whatsapp: "Message on WhatsApp", empty: "No requests here.", cv: "CV", openJob: "Job", from: "From", to: "To",
  },
  asks: {
    title: "Asks & offers", sub: "Ask for specific help or offer what you can give. For the things that get lost in the WhatsApp group.",
    asks: "Asks", offers: "Offers", mine: "My posts", newAsk: "I need help", newOffer: "I can help", replies: "{n} replies", reply: "Reply",
    replyPh: "Say how you can help or why you're interested…", replied: "Reply sent. The author will reach out.", youReplied: "You replied", close: "Close (solved)", reopen: "Reopen",
    closed: "Closed", repliesTitle: "Replies", noReplies: "No replies yet. We'll tell you when one arrives.", privateReplies: "Only the author sees replies.",
    formTitleAsk: "What do you need?", formTitleOffer: "What can you offer?", titlePh: "e.g. Looking for someone who moved from engineering to product", bodyPh: "Details that help people know if they can help",
    tags: "Tags (comma separated)", publish: "Publish", empty: "Nothing here yet.", connect: "Connect",
  },
  members: {
    title: "Members", sub: "Arab professionals who are close and happy to help.", search: "Search by name, title, company or skill", chats: "Open to chat", mentors: "Mentors",
    canHelp: "Can help with", helped: "Helped {n} members", requestChat: "Request a 20-min chat", chatPh: "What would you like to talk about? e.g. How did you move into management?", empty: "No results.",
    sendChat: "Send", chatSent: "Chat request sent.", connected: "Connected", pendingChat: "Request pending",
  },
  badges: { referrer: "Referrer", connector: "Connector", helper: "Helper", hire: "Made a hire", mentor: "Mentor" },
  profile: {
    help: "What can you help with?", helpHint: "Comma separated, e.g. technical interviews, moving into management, CV", referrals: "I'm open to referral requests at my company",
    chats: "I'm open to short chats with members", cv: "CV link (Google Drive or similar)", company: "Company", companyHint: "Pick from the list to appear on the company page.",
    impact: "Your impact",
  },
  pitchFallback: "",
};

const he: MemberDict = {
  nav: { home: "בית", jobs: "משרות", companies: "חברות", requests: "בקשות", asks: "בקשות והצעות", members: "חברים", events: "אירועים", mashbakni: "משבקני", profile: "פרופיל", network: "הרשת שלי", notifications: "התראות" },
  home: {
    hello: "שלום {name}", sub: "מה הצעד הבא בקריירה שלך? הנה האנשים שיכולים לעזור וההזדמנויות שמתאימות לך.",
    setup: "עזרו לאנשים למצוא אתכם", setupSub: "3 צעדים כדי שחברים יוכלו לבקש ממך עזרה ולהציע את שלהם.",
    stepCompany: "קשרו את הפרופיל לחברה שלכם", stepHelp: "כתבו במה אתם יכולים לעזור", stepCv: "הוסיפו קישור לקורות חיים", complete: "השלמת פרופיל",
    waiting: "מחכים לתשובה שלך", waitingSub: "חברים ביקשו את עזרתך. כל תשובה חשובה, גם סירוב בנימוס.", jobsFollow: "משרות בחברות שאת/ה עוקב/ת", jobsLatest: "משרות חדשות",
    noFollow: "עקבו אחרי חברות כדי לראות כאן את המשרות שלהן.", meet: "אנשים ששווה להכיר", meetSub: "ההצעות מתחלפות כל יום.", asks: "אפשר לעזור למישהו?", events: "אירועים קרובים",
    pulse: "הדופק של משבק", members: "חברים", companies: "חברות", referrals: "המלצות", hires: "גיוסים", jobsOpen: "משרות פתוחות", seeAll: "הכל",
  },
  jobs: {
    title: "משרות", sub: "משרות שחברים מפרסמים ומשרות שמיובאות מאתרי החברות. לכל משרה: מי ממשבק עובד שם.",
    all: "הכל", members: "מחברים", careers: "מאתרי חברות", following: "חברות שאני עוקב/ת", mine: "המשרות שלי", search: "חיפוש משרה, חברה או עיר",
    managerial: "תפקידי ניהול בלבד", share: "שיתוף משרה", insiders: "{n} ממשבק שם", noInsiders: "עדיין אין חברים שם", fromCareers: "מאתר החברה",
    postedBy: "פורסם ע\"י {name}", asked: "ביקשת המלצה", accepted: "הומלצת", empty: "אין משרות כרגע.", apply: "הגשה באתר החברה", details: "על המשרה",
    managerialTag: "ניהול", closed: "סגורה", close: "סגירת משרה", reopen: "פתיחה מחדש", posted: "המשרה פורסמה. חברי משבק רואים אותה עכשיו.",
  },
  job: {
    insidersTitle: "מי יכול לעזור לך ב-{company}?", insidersSub: "הסדר הוגן: הוא שונה לכל חבר/ה, מתחדש כל יום ומקדם מי שיש לו פחות בקשות פתוחות.",
    showMore: "שמות נוספים", ask: "בקשת המלצה", choose: "בחרו למי לשלוח", message: "ההודעה שלך", messagePh: "הציגו את עצמכם בקצרה ולמה אתם מתאימים…",
    draft: "טיוטה עם משבקני", drafting: "כותב…", cv: "קישור לקורות חיים", cvHint: "נשלח עם הבקשה. אפשר לשמור אותו בפרופיל.", send: "שליחת בקשה",
    sent: "הבקשה נשלחה. נעדכן ברגע שתתקבל תשובה.", status: "הבקשה שלך", waitingFor: "מחכים ל-{name}", acceptedBy: "{name} הסכים/ה להמליץ עליך", declinedBy: "{name} לא יכול/ה הפעם",
    askAnother: "לבקש מחבר/ה אחר/ת", withdraw: "ביטול בקשה", none: "עדיין אף אחד ממשבק לא עובד ב-{company}.", noneSub: "שאלו את הקהילה, אולי מישהו מכיר שם מישהו.", askCommunity: "לשאול את הקהילה",
    signals: { new: "חדש/ה ברשת", responsive: "בדרך כלל עונה מהר", busy: "יש הרבה בקשות כרגע", steady: "עוזר/ת לחברים" },
    helped: "עזר/ה ל-{n}", poster: "מפרסם/ת המשרה", requests: "בקשות המלצה למשרה שלך", manage: "ניהול בקשות", chat: "שיחה של 20 דקות",
  },
  share: {
    title: "שיתוף משרה", sub: "הדביקו קישור למשרה מאתר החברה ונמלא את הפרטים, או כתבו אותם בעצמכם.", link: "קישור למשרה", fetch: "משיכת פרטים",
    fetching: "קוראים את העמוד…", fetched: "מילאנו את הפרטים. בדקו לפני פרסום.", failed: "לא הצלחנו לקרוא את העמוד. מלאו ידנית.", manual: "או כתבו את הפרטים",
    jobTitle: "שם המשרה", company: "חברה", location: "מיקום", type: "סוג משרה", mode: "אופן עבודה", managerial: "תפקיד ניהולי", description: "תיאור",
    requirements: "דרישות", apply: "קישור להגשה", publish: "פרסום משרה", note: "את/ה מופיע/ה כאיש קשר למשרה ומקבל/ת את בקשות ההמלצה עליה.",
  },
  companies: {
    title: "חברות", sub: "מי ממשבק עובד איפה, ומעקב אחרי חברות כדי לקבל את המשרות שלהן.", search: "חיפוש חברה", following: "במעקב", follow: "מעקב", unfollow: "הפסקת מעקב",
    members: "{n} חברים", jobs: "{n} משרות", add: "הוספת חברה", addSub: "לא מצאתם את החברה שלכם? הוסיפו אותה. עם קישור לעמוד המשרות נייבא את המשרות אוטומטית.",
    name: "שם החברה", website: "אתר", careers: "קישור לעמוד המשרות (אופציונלי)", sector: "תחום", mine: "אני עובד/ת בחברה הזו", save: "הוספה",
    insiders: "חברי משבק ב-{company}", openJobs: "משרות פתוחות", noJobs: "אין משרות פתוחות כרגע.", noMembers: "עדיין אין חברים כאן.", visit: "אתר החברה", careersPage: "עמוד המשרות",
    synced: "המשרות מתעדכנות אוטומטית מאתר החברה", empty: "אין תוצאות.", yourCompany: "החברה שלך",
  },
  requests: {
    title: "בקשות", sub: "בקשות המלצה ושיחה, נכנסות ויוצאות, במקום אחד.", incoming: "אליי", sent: "ששלחתי", history: "היסטוריה",
    referral: "בקשת המלצה", chat: "בקשת שיחה", for: "למשרה", accept: "אישור", decline: "סירוב", note: "הערה או טיפ (אופציונלי)", notePh: "למשל: שלח/י לי קו\"ח למייל, או: הצוות לא מגייס כרגע אבל נסו את קבוצה X",
    pending: "ממתין", accepted: "אושר", declined: "סורב", withdrawn: "בוטל", outcome: "מה קרה אחר כך?", outcomeSub: "עוזר לנו למדוד את ההמלצות ולהודות למי שעזר.",
    outcomes: { interview: "הגעתי לראיון", offer: "קיבלתי הצעה", hired: "התקבלתי!", no_news: "אין חדש", rejected: "לא התקבלתי" },
    whatsapp: "הודעה בוואטסאפ", empty: "אין בקשות כאן.", cv: "קורות חיים", openJob: "משרה", from: "מאת", to: "אל",
  },
  asks: {
    title: "בקשות והצעות", sub: "בקשו עזרה ספציפית או הציעו מה שאתם יכולים לתת. לדברים שהולכים לאיבוד בקבוצת הוואטסאפ.",
    asks: "בקשות", offers: "הצעות", mine: "הפוסטים שלי", newAsk: "אני צריך/ה עזרה", newOffer: "אני יכול/ה לעזור", replies: "{n} תגובות", reply: "תגובה",
    replyPh: "כתבו איך אתם יכולים לעזור או למה זה מעניין אתכם…", replied: "התגובה נשלחה. כותב/ת הפוסט ייצור/תיצור קשר.", youReplied: "הגבת", close: "סגירה (נפתר)", reopen: "פתיחה מחדש",
    closed: "סגור", repliesTitle: "תגובות", noReplies: "עדיין אין תגובות. נעדכן כשתגיע תגובה.", privateReplies: "רק כותב/ת הפוסט רואה את התגובות.",
    formTitleAsk: "מה את/ה צריך/ה?", formTitleOffer: "מה את/ה יכול/ה להציע?", titlePh: "למשל: מחפש/ת מישהו שעבר מהנדסה למוצר", bodyPh: "פרטים שיעזרו לאנשים לדעת אם הם יכולים לעזור",
    tags: "תגיות (מופרדות בפסיקים)", publish: "פרסום", empty: "עדיין אין כאן כלום.", connect: "יצירת קשר",
  },
  members: {
    title: "חברים", sub: "אנשי ונשות מקצוע ערבים, קרובים ושמחים לעזור.", search: "חיפוש לפי שם, תפקיד, חברה או מיומנות", chats: "פתוחים לשיחה", mentors: "מנטורים",
    canHelp: "יכול/ה לעזור ב", helped: "עזר/ה ל-{n} חברים", requestChat: "בקשת שיחה של 20 דקות", chatPh: "על מה תרצו לדבר? למשל: איך עברת לתפקיד ניהולי?", empty: "אין תוצאות.",
    sendChat: "שליחה", chatSent: "בקשת השיחה נשלחה.", connected: "מחוברים", pendingChat: "הבקשה ממתינה",
  },
  badges: { referrer: "ממליץ/ה", connector: "מחבר/ת", helper: "עוזר/ת", hire: "הביא/ה לגיוס", mentor: "מנטור/ית" },
  profile: {
    help: "במה את/ה יכול/ה לעזור?", helpHint: "מופרד בפסיקים, למשל: ראיונות טכניים, מעבר לניהול, קו\"ח", referrals: "אני פתוח/ה לבקשות המלצה בחברה שלי",
    chats: "אני פתוח/ה לשיחות קצרות עם חברים", cv: "קישור לקורות חיים (Google Drive או דומה)", company: "חברה", companyHint: "בחרו מהרשימה כדי להופיע בעמוד החברה.",
    impact: "ההשפעה שלך",
  },
  pitchFallback: "",
};

export const memberDict: Record<Locale, MemberDict> = { ar, en, he };
export type { MemberDict };
export const fmt = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
