import type { CompanyInput } from "./data/repo";

/* Starter list of employers where Mashbak members work. Careers URLs are filled where the platform is known;
   admins can add or fix any careers link from the dashboard and press "Sync now". */
type Row = [slug: string, name: string, ar: string, he: string, website: string, sector: string, careers?: string, extra?: string[]];
const ROWS: Row[] = [
  ["amdocs", "Amdocs", "أمدوكس", "אמדוקס", "amdocs.com", "Software", "https://amdocs.wd3.myworkdayjobs.com/Amdocs", ["امدوكس"]],
  ["nvidia", "NVIDIA", "إنفيديا", "אנבידיה", "nvidia.com", "Semiconductors", "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite", ["نفيديا", "انفيديا", "mellanox", "ميلانوكس"]],
  ["intel", "Intel", "إنتل", "אינטל", "intel.com", "Semiconductors", "https://intel.wd1.myworkdayjobs.com/External", ["انتل"]],
  ["salesforce", "Salesforce", "سيلزفورس", "סיילספורס", "salesforce.com", "Software", "https://salesforce.wd12.myworkdayjobs.com/External_Career_Site"],
  ["applied-materials", "Applied Materials", "أبلايد ماتيريالز", "אפלייד מטיריאלס", "appliedmaterials.com", "Semiconductors", "https://amat.wd1.myworkdayjobs.com/External", ["amat"]],
  ["microsoft", "Microsoft", "مايكروسوفت", "מיקרוסופט", "microsoft.com", "Software"],
  ["google", "Google", "غوغل", "גוגל", "google.com", "Software", undefined, ["جوجل"]],
  ["apple", "Apple", "أبل", "אפל", "apple.com", "Hardware", undefined, ["ابل"]],
  ["meta", "Meta", "ميتا", "מטא", "meta.com", "Software", undefined, ["facebook", "فيسبوك"]],
  ["wix", "Wix", "ويكس", "וויקס", "wix.com", "Software"],
  ["monday", "monday.com", "مانداي", "מאנדיי", "monday.com", "Software", undefined, ["monday", "مانداي.كوم"]],
  ["check-point", "Check Point", "تشيك بوينت", "צ'ק פוינט", "checkpoint.com", "Cybersecurity", undefined, ["checkpoint", "צ׳ק פוינט"]],
  ["palo-alto-networks", "Palo Alto Networks", "بالو ألتو نتوركس", "פאלו אלטו", "paloaltonetworks.com", "Cybersecurity", undefined, ["palo alto"]],
  ["cyberark", "CyberArk", "سايبر آرك", "סייברארק", "cyberark.com", "Cybersecurity"],
  ["fiverr", "Fiverr", "فايفر", "פייבר", "fiverr.com", "Software"],
  ["mobileye", "Mobileye", "موبيلاي", "מובילאיי", "mobileye.com", "Automotive tech"],
  ["payoneer", "Payoneer", "بايونير", "פיוניר", "payoneer.com", "Fintech"],
  ["cisco", "Cisco", "سيسكو", "סיסקו", "cisco.com", "Networking"],
  ["hp", "HP", "إتش بي", "HP", "hp.com", "Hardware", undefined, ["hp indigo", "hewlett packard"]],
  ["philips", "Philips", "فيليبس", "פיליפס", "philips.com", "Health tech"],
  ["elbit", "Elbit Systems", "إلبيت", "אלביט מערכות", "elbitsystems.com", "Defense & aerospace", undefined, ["elbit", "אלביט"]],
  ["wolt", "Wolt", "وولت", "וולט", "wolt.com", "Delivery tech"],
  ["teva", "Teva", "تيفع", "טבע", "tevapharm.com", "Pharma", undefined, ["teva pharmaceuticals", "طيفع"]],
  ["strauss", "Strauss", "شتراوس", "שטראוס", "strauss-group.com", "Food", undefined, ["strauss group"]],
  ["electra", "Electra", "إلكترا", "אלקטרה", "electra.co.il", "Industry", undefined, ["الكترا"]],
  ["bank-hapoalim", "Bank Hapoalim", "بنك هبوعليم", "בנק הפועלים", "bankhapoalim.co.il", "Banking", undefined, ["hapoalim", "הפועלים", "بنك العمال"]],
  ["bank-leumi", "Bank Leumi", "بنك لئومي", "בנק לאומי", "leumi.co.il", "Banking", undefined, ["leumi", "לאומי", "بنك لؤمي"]],
  ["discount-bank", "Discount Bank", "بنك ديسكونت", "בנק דיסקונט", "discountbank.co.il", "Banking", undefined, ["discount", "דיסקונט"]],
  ["mizrahi-tefahot", "Mizrahi Tefahot", "بنك مزراحي طفحوت", "מזרחי טפחות", "mizrahi-tefahot.co.il", "Banking", undefined, ["mizrahi", "מזרחי"]],
  ["clalit", "Clalit", "كلاليت", "כללית", "clalit.co.il", "Health", undefined, ["clalit health services", "שירותי בריאות כללית"]],
  ["maccabi", "Maccabi", "مكابي", "מכבי", "maccabi4u.co.il", "Health", undefined, ["maccabi healthcare", "מכבי שירותי בריאות"]],
  ["deloitte", "Deloitte", "ديلويت", "דלויט", "deloitte.com", "Consulting"],
  ["pwc", "PwC", "بي دبليو سي", "PwC", "pwc.com", "Consulting"],
  ["kpmg", "KPMG", "كي بي إم جي", "KPMG", "kpmg.com", "Consulting"],
  ["ey", "EY", "إرنست ويونغ", "EY", "ey.com", "Consulting", undefined, ["ernst & young"]],
  ["co-impact", "Co-Impact", "كو-إمباكت", "קו-אימפקט", "co-impact.org.il", "Nonprofit", undefined, ["كو إمباكت", "coimpact", "קו אימפקט"]],
];

export const defaultCompanies: CompanyInput[] = ROWS.map(([slug, name, ar, he, website, sector, careers, extra]) => ({
  slug, name, name_ar: ar, name_he: he, website: `https://${website}`, sector, careers_url: careers ?? null,
  aliases: [...new Set([name, ar, he, website, ...(extra ?? [])].map((a) => a.toLowerCase()))],
  location_filter: "israel", sync_enabled: true,
}));

/** Logo for a company: its own logo, otherwise the site's icon. */
export function companyLogo(c: { logo_url?: string | null; website?: string | null; name: string }) {
  if (c.logo_url) return c.logo_url;
  if (c.website) {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(c.website).hostname}&sz=128`; } catch { /* fall through */ }
  }
  return null;
}
