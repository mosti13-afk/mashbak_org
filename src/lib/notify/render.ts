import type { Locale } from "@/i18n/config";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function fill(text: string, vars: Record<string, string | number | null | undefined>) {
  return text
    .replace(/\{(\w+)\}/g, (_, k) => (vars[k] === null || vars[k] === undefined ? "" : String(vars[k])))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const FOOTER = {
  ar: "تصلك هذه الرسالة لأنك على تواصل مع مجتمع مشبك. يمكنك تغيير تفضيلات الإشعارات من ملفك الشخصي.",
  en: "You are receiving this because you are in touch with the Mashbak community. You can change notification preferences from your profile.",
  he: "קיבלת הודעה זו כי את/ה בקשר עם קהילת משבק. אפשר לשנות את העדפות ההתראות בפרופיל.",
};

/** Branded, table-based HTML email that renders well in Gmail, Outlook and Apple Mail, RTL aware. */
export function emailHtml(opts: { locale: Locale; subject: string; body: string; cta?: { label: string; url: string }; site: string }) {
  const rtl = opts.locale !== "en";
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";
  const font = rtl ? "'Noto Kufi Arabic',Tahoma,Arial,sans-serif" : "Fredoka,'Segoe UI',Arial,sans-serif";
  const paras = esc(opts.body)
    .split(/\n\n/)
    .map((p) => `<p dir="auto" style="margin:0 0 16px;line-height:1.8;font-size:16px;color:#1e1f24">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  const button = opts.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px"><tr><td style="background:#0b486d;border-radius:14px;border-bottom:3px solid #08334d">
        <a href="${esc(opts.cta.url)}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-weight:700;font-size:16px;text-decoration:none;font-family:${font}">${esc(opts.cta.label)}</a>
      </td></tr></table>`
    : "";
  return `<!doctype html><html lang="${opts.locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.subject)}</title></head>
<body style="margin:0;padding:0;background:#f1f9f5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f9f5;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e8e8e8" dir="${dir}">
    <tr><td style="background:#0b486d;padding:22px 28px" align="${align}">
      <img src="${opts.site}/brand/logo_footer.png" alt="Mashbak" height="44" style="display:block;height:44px;border:0">
    </td></tr>
    <tr><td style="height:4px;background:#77be98;line-height:4px;font-size:0">&nbsp;</td></tr>
    <tr><td style="padding:32px 28px 24px;font-family:${font};text-align:${align}" dir="${dir}">
      <h1 style="margin:0 0 20px;font-size:22px;line-height:1.5;color:#0b486d">${esc(opts.subject)}</h1>
      ${paras}
      ${button}
    </td></tr>
    <tr><td style="padding:18px 28px 26px;border-top:1px solid #e8e8e8;font-family:${font};text-align:${align}" dir="${dir}">
      <p style="margin:0 0 6px;font-size:12px;line-height:1.7;color:#8c8c8c">${FOOTER[opts.locale]}</p>
      <p style="margin:0;font-size:12px;color:#8c8c8c"><a href="${opts.site}" style="color:#0b486d;text-decoration:none">mashbak.org</a> · <a href="mailto:info@mashbak.org" style="color:#0b486d;text-decoration:none">info@mashbak.org</a></p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}
