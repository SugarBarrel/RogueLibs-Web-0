import { Session as SupabaseSession } from "@supabase/supabase-js";
import { RestMod, RestRelease, RestUser } from "./API";

export function extract<T extends object, Prop extends keyof T>(subject: T, prop: Prop): T[Prop] {
  const value = subject[prop];
  delete subject[prop];
  return value;
}
export function extractAll<T extends object, Prop extends keyof T>(subjects: readonly T[], prop: Prop): T[Prop][] {
  return subjects.map(subject => extract(subject, prop));
}

export interface PageProps {
  initialSession: SupabaseSession | null;
  initialState?: {
    users?: RestUser[];
    mods?: RestMod[];
    releases?: RestRelease[];
  };
}
