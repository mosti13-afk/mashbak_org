import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Dict, Locale } from "@/i18n";
import { repo } from "@/lib/data";
import { Logo } from "../ui";

export async function Footer({ locale, t }: { locale: Locale; t: Dict }) {
  const s = await repo.getSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="mesh relative overflow-hidden text-white">
      <div className="grid-lines absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo white height={46} />
          <p className="mt-4 max-w-sm text-white/70">{t.about.lead}</p>
          <p className="mt-6 text-lg font-black text-mint">{t.common.tagline}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-white/50">{t.common.brand}</p>
          <ul className="space-y-2 font-semibold">
            {[["programs", t.nav.programs], ["events", t.nav.events], ["about", t.nav.about], ["faq", t.nav.faq], ["contact", t.nav.contact]].map(([h, l]) => (
              <li key={h}><Link href={`/${locale}/${h}`} className="text-white/85 hover:text-mint">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-white/50">{t.nav.contact}</p>
          <ul className="space-y-2 font-semibold">
            {s.contact.email && <li><a href={`mailto:${s.contact.email}`} className="text-white/85 hover:text-mint" dir="ltr">{s.contact.email}</a></li>}
            {s.contact.instagram && <li><a href={s.contact.instagram} className="text-white/85 hover:text-mint" target="_blank" rel="noreferrer">Instagram</a></li>}
            {s.contact.linkedin && <li><a href={s.contact.linkedin} className="text-white/85 hover:text-mint" target="_blank" rel="noreferrer">LinkedIn</a></li>}
            <li><Link href={`/${locale}/apply`} className="inline-flex items-center gap-1 text-mint hover:text-white">{t.common.apply} <ArrowRight className="flip-rtl h-4 w-4" /></Link></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-white/50">
          <span>© {year} Mashbak · Co Impact, {t.common.rights}</span>
          <Link href={`/${locale}/privacy`} className="hover:text-white">{t.common.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
