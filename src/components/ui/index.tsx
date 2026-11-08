import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { initials } from "@/lib/format";

export function Logo({ white = false, className = "", height = 40 }: { white?: boolean; className?: string; height?: number }) {
  // The live mashbak.org logo (speech bubble with "مشبك"), crisp at any size
  const src = white ? "/brand/logo_footer.png" : "/brand/nav_logo.png";
  const ratio = white ? 760 / 396 : 1688 / 875;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="مشبك، Mashbak" width={Math.round(height * ratio)} height={height} className={clsx("select-none", className)} style={{ height, width: "auto" }} />;
}

const avatarTones = ["#117286", "#4e8c74", "#6795a8", "#80a69e", "#a5b683", "#0a476d"];

export function Avatar({ src, name, size = 44, className = "", ring = false }: { src?: string | null; name: string; size?: number; className?: string; ring?: boolean }) {
  const tone = avatarTones[(name.charCodeAt(0) || 0) % avatarTones.length];
  return (
    <span
      className={clsx("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-mint-soft font-bold text-white", ring && "ring-4 ring-white", className)}
      style={{ width: size, height: size, background: src ? undefined : tone, fontSize: size * 0.36 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
}

export function PageHeader({ title, sub, actions }: { eyebrow?: string; title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="t-h1">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-[15px] leading-7 text-ink-2">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 border-dashed px-6 py-12 text-center text-ink-2 shadow-none">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint-soft text-green-deep" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 11l7.6-4M8.2 13l7.6 4" /></svg>
      </span>
      <div>{children}</div>
      {action}
    </div>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={clsx("block", className)}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="hint block">{hint}</span>}
    </label>
  );
}

export function Check({ name, label, defaultChecked, required }: { name: string; label: string; defaultChecked?: boolean; required?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} required={required} className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-navy" />
      <span>{label}</span>
    </label>
  );
}

export function Notice({ tone = "mint", children }: { tone?: "mint" | "amber" | "red"; children: ReactNode }) {
  const cls = { mint: "border-mint/40 bg-mint-soft text-green-deep", amber: "border-[#f0dca0] bg-[#fdf6e3] text-[#6b5000]", red: "border-[#f3c4bf] bg-[#fdeceb] text-[#8f1e18]" }[tone];
  return <div className={clsx("mb-5 rounded-xl border px-4 py-3 text-sm font-semibold", cls)}>{children}</div>;
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const tone =
    { approved: "badge-mint", active: "badge-mint", accepted: "badge-mint", registered: "badge-mint", attended: "badge-navy", published: "badge-mint",
      pending: "badge-amber", waitlist: "badge-amber", draft: "badge-gray", rejected: "badge-red", declined: "badge-red", suspended: "badge-red", cancelled: "badge-gray" }[status] ?? "badge-gray";
  return <span className={clsx("badge", tone)}>{label}</span>;
}

export function Tabs({ items }: { items: { href: string; label: string; active: boolean; count?: number }[] }) {
  return (
    <nav className="mb-5 flex gap-1 overflow-x-auto rounded-full border border-line bg-white p-1 text-sm">
      {items.map((t) => (
        <Link key={t.href} href={t.href} className={clsx("flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 font-bold transition", t.active ? "bg-navy text-white" : "text-ink-2 hover:bg-sky")}>
          {t.label}
          {t.count ? <span className={clsx("rounded-full px-1.5 text-[11px]", t.active ? "bg-white/20" : "bg-mint-soft text-green-deep")}>{t.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

export function SectionTitle({ eyebrow, title, sub, center = false, light = false }: { eyebrow?: string; title: string; sub?: string; center?: boolean; light?: boolean }) {
  return (
    <div className={clsx("mb-10 max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className={clsx("eyebrow mb-3", light && "text-mint")}>{eyebrow}</p>}
      <h2 className={clsx("h-display text-3xl leading-tight sm:text-4xl", light && "text-white")}>{title}</h2>
      {sub && <p className={clsx("mt-3 text-lg", light ? "text-white/75" : "text-ink-2")}>{sub}</p>}
    </div>
  );
}
