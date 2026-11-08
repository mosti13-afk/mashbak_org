import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { contact } from "@/lib/settings";
import { SocialRow } from "./Social";

export async function Footer({ locale }: { locale: Locale }) {
  const s = siteDict[locale];
  const c = contact(await repo.getSettings());
  const b = `/${locale}`;
  const links = [[b, s.nav.home], [`${b}/our_programs`, s.nav.programs], [`${b}/events`, s.nav.events], [`${b}/about`, s.footer.aboutLink], [`${b}/contact`, s.nav.contact], [`${b}/policy`, s.footer.policy]];
  return (
    <footer className="bg-navy-deep pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-white lg:pb-0">
      <div className="container-x grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr] md:py-16">
        <div className="max-w-sm">
          <Image src="/brand/logo_footer.png" alt="مشبك · كو-إمباكت" width={152} height={79} className="h-16 w-auto" />
          <p className="mt-5 text-[15px] leading-7 text-white/80">{s.footer.desc}</p>
          <SocialRow c={c} className="mt-5 text-white" />
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 self-start text-[15px]">
          {links.map(([h, l]) => <li key={h}><Link href={h} className="text-white/85 hover:text-mint">{l}</Link></li>)}
        </ul>
        <div className="min-w-0 space-y-4 self-start">
          {c.phoneNumber && (
            <a href={`tel:${c.phoneNumber}`} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25"><Phone className="h-4 w-4" /></span>
              <span><span className="block text-xs text-white/60">{s.contact.phone}</span><span className="font-semibold" dir="ltr">{c.phoneNumber}</span></span>
            </a>
          )}
          {c.email && (
            <a href={`mailto:${c.email}`} className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25"><Mail className="h-4 w-4" /></span>
              <span className="min-w-0"><span className="block text-xs text-white/60">{s.contact.email}</span><span className="block break-all font-semibold" dir="ltr">{c.email}</span></span>
            </a>
          )}
        </div>
      </div>
      <div className="container-x border-t border-white/15 py-5 text-center text-[13px] text-white/70">
        © {new Date().getFullYear()} {s.footer.rights}
      </div>
    </footer>
  );
}
