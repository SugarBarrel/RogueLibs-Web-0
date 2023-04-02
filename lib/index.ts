import { DropResult } from "@hello-pangea/dnd";
import { Session as SupabaseSession } from "@supabase/supabase-js";
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
import { useEffect, useState } from "react";
import { RestMod, RestRelease, RestUser } from "./API";

export function extract<T extends object, Prop extends keyof T>(subject: T, prop: Prop): T[Prop] {
  const value = subject[prop];
  delete subject[prop];
  return value;
}
export function extractAll<T extends object, Prop extends keyof T>(subjects: readonly T[], prop: Prop): T[Prop][] {
  return subjects.map(subject => extract(subject, prop));
}

export function reorder<T>(dnd: DropResult, container: T[], orderProp?: keyof T): T[];
export function reorder<T>(dnd: DropResult, containers: Record<string, T[]>, orderProp?: keyof T): Record<string, T[]>;
export function reorder<T>(dnd: DropResult, containers: T[] | Record<string, T[]>, orderProp?: keyof T) {
  if (!dnd.destination) return containers;

  if (Array.isArray(containers)) {
    let copy = containers.slice();
    const [removed] = copy.splice(dnd.source.index, 1);
    copy.splice(dnd.destination.index, 0, removed);

    if (orderProp != undefined) {
      copy = copy.map((item, order) => ({ ...item, [orderProp]: order }));
    }
    return copy;
  } else {
    let copyFrom = containers[dnd.source.droppableId].slice();
    const [removed] = copyFrom.splice(dnd.source.index, 1);
    let copyTo = containers[dnd.destination.droppableId].slice();
    copyTo.splice(dnd.destination.index, 0, removed);

    if (orderProp != undefined) {
      copyFrom = copyFrom.map((item, order) => ({ ...item, [orderProp]: order }));
      copyTo = copyTo.map((item, order) => ({ ...item, [orderProp]: order }));
    }
    return {
      ...containers,
      [dnd.source.droppableId]: copyFrom,
      [dnd.destination.droppableId]: copyTo,
    };
  }
}

export function orderInsensitiveEqual<T>(
  a: T[],
  b: T[],
  selectId: (obj: T) => string | number,
  equalityFunc?: (a: T, b: T) => boolean,
) {
  if (a.length !== b.length) return false;
  for (const item of a) {
    const id = selectId(item);
    const other = b.find(e => selectId(e) === id);
    if (!other || (equalityFunc && !equalityFunc(item, other))) return false;
  }
  return true;
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

export type GSSPR<Props extends { [key: string]: any } = {}> = GetServerSidePropsResult<Props>;
