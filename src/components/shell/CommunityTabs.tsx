import { SectionTabs } from "./page";
import type { ShellDict } from "@/i18n/shell";

export function CommunityTabs({ base, S, active }: { base: string; S: ShellDict; active: "members" | "asks" | "events" }) {
  return (
    <SectionTabs items={[
      { href: `${base}/members`, label: S.members, active: active === "members" },
      { href: `${base}/asks`, label: S.asks, active: active === "asks" },
      { href: `${base}/events`, label: S.events, active: active === "events" },
    ]} />
  );
}
