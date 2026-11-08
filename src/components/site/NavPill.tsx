"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** The navy pill navigation of the live site, with the active link in mint. */
export function NavPill({ items, home }: { items: { href: string; label: string }[]; home: string }) {
  const path = usePathname();
  return (
    <div className="mx-auto flex h-12 w-full items-center justify-center overflow-x-auto rounded-full bg-navy-deep px-4 xl:h-14 xl:px-6">
      <div className="flex min-w-max items-center gap-2 px-2 xl:gap-3">
        {items.map((i) => {
          const on = i.href === home ? path === home : path === i.href || path.startsWith(i.href + "/");
          return (
            <Link key={i.href} href={i.href} aria-current={on ? "page" : undefined}
              className={clsx("block w-[6rem] truncate text-center text-[13px] leading-5 transition-colors xl:w-[7rem] xl:text-[14px]",
                on ? "font-semibold text-mint" : "text-white/90 hover:text-mint")}>
              {i.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
