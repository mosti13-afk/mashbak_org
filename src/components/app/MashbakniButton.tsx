import clsx from "clsx";
import Link from "next/link";
import type { CSSProperties } from "react";

/* Mashbakni button v1.0 (design package): raised navy bubble with a face. Styles in app/mashbakni.css. */
export type MashbakniState = "idle" | "listening" | "thinking" | "answered" | "notify";

const LABELS: Record<MashbakniState, string> = {
  idle: "مشبكني", listening: "مشبكني يستمع", thinking: "مشبكني يفكّر", answered: "مشبكني أجاب", notify: "مشبكني: عندك اقتراح جديد",
};

function Face() {
  return (
    <svg className="mbk__svg" viewBox="4 6 96 90" aria-hidden="true" focusable="false">
      <path className="mbk__bubble" d="M42 16 H62 A28 28 0 0 1 90 44 A28 28 0 0 1 62 72 H34 L14 84 V44 A28 28 0 0 1 42 16 Z" />
      <g data-part="idle">
        <circle className="mbk__eye" cx="42" cy="43" r="7" />
        <circle className="mbk__eye" cx="62" cy="43" r="7" />
        <path className="mbk__accent" d="M44.5 56 Q52 62.5 59.5 56" />
      </g>
      <g data-part="listening">
        <circle className="mbk__eye" cx="43.5" cy="40.5" r="7.5" />
        <circle className="mbk__eye" cx="63.5" cy="40.5" r="7.5" />
        <circle className="mbk__dot" cx="52" cy="58" r="4.2" />
      </g>
      <g data-part="thinking">
        <circle className="mbk__eye" cx="40" cy="39" r="5.6" />
        <circle className="mbk__eye" cx="60" cy="39" r="5.6" />
        <g>
          <circle className="mbk__dot" cx="40" cy="58" r="4.4" />
          <circle className="mbk__dot" cx="52" cy="58" r="4.4" />
          <circle className="mbk__dot" cx="64" cy="58" r="4.4" />
        </g>
      </g>
      <g data-part="answered">
        <path className="mbk__ink-line" d="M34.5 45 Q42 34 49.5 45 M54.5 45 Q62 34 69.5 45" />
        <path className="mbk__accent" d="M43 54 Q52 64 61 54" />
      </g>
    </svg>
  );
}

/** The round button. As a link (nav) when href is given, otherwise a decorative avatar. */
export function MashbakniButton({ state = "idle", href, size, active, className, label }: {
  state?: MashbakniState; href?: string; size?: number; active?: boolean; className?: string; label?: string;
}) {
  const style = size ? ({ "--mb-btn-size": `${size}px` } as CSSProperties) : undefined;
  const props = { className: clsx("mbk", className), "data-state": state, style };
  if (href) {
    return (
      <Link href={href} {...props} aria-label={label ?? LABELS[state]} aria-current={active ? "page" : undefined} aria-expanded={active ? true : undefined}>
        <Face /><span className="mbk__badge" aria-hidden="true" />
      </Link>
    );
  }
  return <span {...props} role="img" aria-label={label ?? LABELS[state]}><Face /><span className="mbk__badge" aria-hidden="true" /></span>;
}

/** Line mark for light backgrounds (sidebar icon, small sizes use the heavier stroke). */
export function MashbakniMark({ className }: { className?: string }) {
  return (
    <svg viewBox="4 6 96 90" className={className} aria-hidden="true">
      <path d="M42 16 H62 A28 28 0 0 1 90 44 A28 28 0 0 1 62 72 H34 L14 84 V44 A28 28 0 0 1 42 16 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
      <circle cx="42" cy="43" r="7" fill="currentColor" /><circle cx="62" cy="43" r="7" fill="currentColor" />
      <path d="M44.5 56 Q52 62.5 59.5 56" stroke="#78BF98" strokeWidth="6.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
