import ar from "./dict/ar";
import en from "./dict/en";
import he from "./dict/he";
import type { Dict } from "./dict/en";
import type { Locale } from "./config";

const dicts: Record<Locale, Dict> = { ar, en, he };

export function getDict(locale: Locale): Dict {
  return dicts[locale] ?? ar;
}

export type { Dict };
export * from "./config";
