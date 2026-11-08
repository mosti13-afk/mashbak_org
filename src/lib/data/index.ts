import "server-only";
import { isDemo } from "../env";
import { demoActive } from "../preview";
import { demoRepo } from "./demo";
import { supabaseRepo } from "./supabase";
import type { Repo } from "./repo";

/* Real data in production; the in-memory demo store in demo mode or while the private preview cookie is set. */
const switching = new Proxy({} as Repo, {
  get(_, key: string) {
    return async (...args: unknown[]) => {
      const target = (await demoActive()) ? demoRepo : supabaseRepo;
      return (target[key as keyof Repo] as (...a: unknown[]) => unknown)(...args);
    };
  },
});

export const repo: Repo = isDemo ? demoRepo : switching;
export type { Repo, MemberCard, ApplicationInput, JobInput, ProfilePatch } from "./repo";
