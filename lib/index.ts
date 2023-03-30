import { Session as SupabaseSession } from "@supabase/supabase-js";
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
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
  initialState: {
    session: SupabaseSession | null;
    users?: RestUser[];
    mods?: RestMod[];
    releases?: RestRelease[];
  };
}

export type GSSP<
  Props extends { [key: string]: any },
  Params extends ParsedUrlQuery = ParsedUrlQuery,
  Preview extends PreviewData = PreviewData,
> = GetServerSideProps<Props, Params, Preview>;

export type GSSPC<
  Params extends ParsedUrlQuery = ParsedUrlQuery,
  Preview extends PreviewData = PreviewData,
> = GetServerSidePropsContext<Params, Preview>;

export type GSSPR<Props extends { [key: string]: any }> = GetServerSidePropsResult<Props>;
