import type { Locale } from "./config";

const ar = {
  home: "الرئيسية", opportunities: "الفرص", community: "المجتمع", account: "حسابي", activity: "النشاط", mashbakni: "مشبكني",
  jobs: "الوظائف", companies: "الشركات", members: "الأعضاء", asks: "بدّي / بقدر", events: "الفعاليات",
  needsYou: "بانتظارك", sent: "طلباتي", updates: "التحديثات", back: "رجوع",
  acc: {
    myProfile: "ملفي الشخصي", editProfile: "تعديل الملف", requests: "طلباتي", network: "شبكتي", notifications: "الإشعارات", language: "اللغة",
    install: "ثبّت التطبيق على هاتفك", admin: "لوحة الإدارة", logout: "تسجيل الخروج", help: "المساعدة والتواصل", privacy: "الخصوصية", publicSite: "موقع مشبك",
    impact: "أثرك في المجتمع", view: "عرض ملفي كما يراه الأعضاء",
  },
};
type ShellDict = typeof ar;
const en: ShellDict = {
  home: "Home", opportunities: "Opportunities", community: "Community", account: "Account", activity: "Activity", mashbakni: "Mashbakni",
  jobs: "Jobs", companies: "Companies", members: "Members", asks: "Asks & offers", events: "Events",
  needsYou: "Needs you", sent: "My requests", updates: "Updates", back: "Back",
  acc: {
    myProfile: "My profile", editProfile: "Edit profile", requests: "My requests", network: "My network", notifications: "Notifications", language: "Language",
    install: "Install the app on your phone", admin: "Admin dashboard", logout: "Log out", help: "Help & contact", privacy: "Privacy", publicSite: "Mashbak website",
    impact: "Your impact", view: "View my profile as members see it",
  },
};
const he: ShellDict = {
  home: "בית", opportunities: "הזדמנויות", community: "קהילה", account: "החשבון", activity: "פעילות", mashbakni: "משבקני",
  jobs: "משרות", companies: "חברות", members: "חברים", asks: "בקשות והצעות", events: "אירועים",
  needsYou: "מחכה לך", sent: "הבקשות שלי", updates: "עדכונים", back: "חזרה",
  acc: {
    myProfile: "הפרופיל שלי", editProfile: "עריכת פרופיל", requests: "הבקשות שלי", network: "הרשת שלי", notifications: "התראות", language: "שפה",
    install: "התקנת האפליקציה בטלפון", admin: "לוח ניהול", logout: "התנתקות", help: "עזרה ויצירת קשר", privacy: "פרטיות", publicSite: "אתר משבק",
    impact: "ההשפעה שלך", view: "הפרופיל שלי כפי שחברים רואים אותו",
  },
};
export const shellDict: Record<Locale, ShellDict> = { ar, en, he };
export type { ShellDict };
