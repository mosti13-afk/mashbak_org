import "server-only";
import { cookies } from "next/headers";
import { isDemo } from "./env";

/*
 * Preview mode: a private link (/[locale]/preview/<key>) lets the owner look around the live site from
 * the inside without touching real data. While the preview cookie is set, every read and write goes to
 * the in-memory demo store and no messages are sent. Without Supabase configured the whole app is demo anyway.
 */
export const PREVIEW_COOKIE = "mb_preview";
export const PREVIEW_KEY = process.env.PREVIEW_KEY?.trim() || "TD2UVXh18Y03";

export async function demoActive() {
  if (isDemo) return true;
  return (await cookies()).get(PREVIEW_COOKIE)?.value === "1";
}

/** True only for the preview on a real deployment (not plain demo mode). */
export async function previewOnly() {
  return !isDemo && (await demoActive());
}
