import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/i18n";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { contact } from "@/lib/settings";
import { Logo } from "../ui";
import { LanguageSeg } from "../ui/client";
import { SocialRow } from "./Social";

export async function Footer({ locale }: { locale: Locale }) {
  const s = siteDict[locale];
  const c = contact(await repo.getSettings());
  const b = `/${locale}`;
  const links = [[`${b}/our_programs`, s.nav.programs], [`${b}/events`, s.nav.events], [`${b}/about`, s.footer.aboutLink], [`${b}/faq`, s.faq.badge], [`${b}/contact`, s.nav.contact], [`${b}/policy`, s.footer.policy]];
  return (
    <footer className="bg-navy-deep text-white">
      <div className="container-x grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
        <div className="max-w-sm">
          <Logo white height={56} />
          <p className="mt-5 text-[15px] leading-7 text-white/75">{s.footer.desc}</p>
          <SocialRow c={c} className="mt-5 text-white" />
        </div>
        <ul className="grid grid-cols-2 content-start gap-x-6 gap-y-3 text-[15px]">
          {links.map(([h, l]) => <li key={h}><Link href={h} className="text-white/80 hover:text-mint">{l}</Link></li>)}
        </ul>
        <div className="min-w-0 space-y-3">
          {c.phoneNumber && <a href={`tel:${c.phoneNumber}`} className="flex items-center gap-3 text-white/85 hover:text-white"><Phone className="h-4 w-4 text-mint" /><span dir="ltr">{c.phoneNumber}</span></a>}
          {c.email && <a href={`mailto:${c.email}`} className="flex min-w-0 items-center gap-3 text-white/85 hover:text-white"><Mail className="h-4 w-4 shrink-0 text-mint" /><span className="break-all" dir="ltr">{c.email}</span></a>}
          <div className="pt-3"><LanguageSeg locale={locale} dark /></div>
        </div>
      </div>
      <div className="container-x border-t border-white/10 py-5 pb-[calc(20px+env(safe-area-inset-bottom)+72px)] text-center text-[13px] text-white/60 md:pb-5">
        © {new Date().getFullYear()} {s.footer.rights}
      </div>
    </footer>
  );
}
