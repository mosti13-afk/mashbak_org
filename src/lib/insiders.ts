import type { Insider } from "./types";

/*
 * Fair rotation of insiders. The order is a weighted shuffle seeded by viewer + context + day:
 * it is stable while you look at a page today, different for each member and each job, and it changes tomorrow.
 * Weights favour people who are not already busy (few pending requests), who answer requests,
 * and who were not asked recently, so nobody gets flooded and new members get a turn.
 */

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967296;
}

export function insiderWeight(i: Insider, now = Date.now()) {
  const busy = 1 / Math.pow(1 + i.pending, 1.6);
  const answerRate = (i.answered + 1) / (i.total - i.pending + 2); // smoothed: new people start at 0.5
  const responsive = 0.45 + 0.55 * Math.min(1, answerRate);
  const days = i.last_asked ? (now - Date.parse(i.last_asked)) / 864e5 : 30;
  const rested = 0.6 + 0.4 * Math.min(1, days / 14);
  return busy * responsive * rested;
}

export function rotateInsiders(list: Insider[], opts: { viewerId: string; context: string; day?: string; exclude?: string[] }): Insider[] {
  const day = opts.day ?? new Date().toISOString().slice(0, 10);
  const skip = new Set([opts.viewerId, ...(opts.exclude ?? [])]);
  return list
    .filter((i) => !skip.has(i.id))
    .map((i) => {
      // Efraimidis-Spirakis weighted sampling: key = u^(1/w), highest first
      const u = Math.max(1e-9, hash(`${opts.viewerId}|${opts.context}|${day}|${i.id}`));
      return { i, k: Math.pow(u, 1 / Math.max(0.01, insiderWeight(i))) };
    })
    .sort((a, b) => b.k - a.k)
    .map((x) => x.i);
}

/** A short, honest line about how this insider usually responds. */
export function insiderSignal(i: Insider): "new" | "responsive" | "busy" | "steady" {
  if (i.total === 0) return "new";
  if (i.pending >= 3) return "busy";
  const decided = i.total - i.pending;
  return decided > 0 && i.answered / decided >= 0.7 ? "responsive" : "steady";
}
