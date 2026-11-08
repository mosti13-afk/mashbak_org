import clsx from "clsx";
import { ChevronLeft, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/* Page building blocks for the member app: one large title, one primary action, quiet structure. */

export function PageTitle({ title, sub, action, back }: { title: string; sub?: string; action?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <header className="mb-5 sm:mb-7">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex h-9 items-center gap-1 rounded-full pe-3 text-[14px] text-mist hover:text-navy">
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          <span className="-ms-0.5">{back.label}</span>
        </Link>
      )}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="t-h1">{title}</h1>
          {sub && <p className="mt-1 max-w-2xl text-[15px] leading-7 text-ink-2">{sub}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex h-9 items-center gap-1 rounded-full pe-3 text-[14px] text-mist hover:text-navy">
      <ChevronLeft className="h-5 w-5 rtl:rotate-180" /><span className="-ms-0.5">{label}</span>
    </Link>
  );
}

/** Switches between sibling pages of one section (e.g. Jobs | Companies). */
export function SectionTabs({ items, className }: { items: { href: string; label: string; active: boolean; count?: number }[]; className?: string }) {
  return (
    <nav className={clsx("seg mb-5", className)}>
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={i.active ? "page" : undefined}>
          {i.label}{!!i.count && <span className="dot">{i.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

/** Small filter pills under a search box. */
export function FilterChips({ items }: { items: { href: string; label: string; on: boolean }[] }) {
  return (
    <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {items.map((i) => <Link key={i.href} href={i.href} aria-pressed={i.on} className="chip">{i.label}</Link>)}
    </div>
  );
}

export function SearchBox({ name = "q", defaultValue, placeholder, hidden }: { name?: string; defaultValue?: string; placeholder: string; hidden?: Record<string, string> }) {
  return (
    <form className="mb-3" role="search">
      {Object.entries(hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <label className="relative block">
        <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mist" />
        <input name={name} defaultValue={defaultValue} placeholder={placeholder} className="search" enterKeyHint="search" />
      </label>
    </form>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[24px] border border-dashed border-line bg-white px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-mint-soft text-navy"><MessageCircle className="h-7 w-7" strokeWidth={1.7} /></span>
      <p className="mt-4 text-[17px] font-bold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-[14px] leading-6 text-mist">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionHeader({ title, href, more }: { title: string; href?: string; more?: string }) {
  return (
    <div className="mb-3 mt-8 flex items-center justify-between gap-3 first:mt-0">
      <h2 className="t-h2">{title}</h2>
      {href && more && <Link href={href} className="shrink-0 whitespace-nowrap text-[14px] text-navy hover:underline">{more}</Link>}
    </div>
  );
}

export const Chevron = () => <ChevronLeft className="h-5 w-5 shrink-0 text-line ltr:rotate-180" />;
