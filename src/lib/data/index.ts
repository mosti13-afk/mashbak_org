import "server-only";
import { isDemo } from "../env";
import { demoRepo } from "./demo";
import { supabaseRepo } from "./supabase";
import type { Repo } from "./repo";

export const repo: Repo = isDemo ? demoRepo : supabaseRepo;
export type { Repo, MemberCard, ApplicationInput, JobInput, ProfilePatch } from "./repo";
