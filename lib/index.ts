import { DropResult } from "@hello-pangea/dnd";
import { Session as SupabaseSession } from "@supabase/supabase-js";
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
import { RestMod, RestRelease, RestUser } from "./API";
export { useSession as useSupabaseSession } from "@supabase/auth-helpers-react";

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

export function primitiveDiff<T>(prevValue: T, newValue: T): Partial<T> | null {
  let hasValues = false;
  const diff: Partial<T> = {};

  for (const key in prevValue) {
    const next = newValue[key];
    if (next !== undefined && isPrimitive(next) && next !== prevValue[key]) {
      diff[key] = next;
      hasValues = true;
    }
  }
  return hasValues ? diff : null;
}
export function isPrimitive(value: any): value is string | number | null | undefined {
  return (typeof value !== "object" && typeof value !== "function") || value === null;
}
export function extractPrimitiveProps<T>(value: T): {
  [K in keyof T as T[K] extends string | number | null ? K : never]: T[K];
} {
  const extracted: Partial<T> = {};

  for (const key in value) {
    if (isPrimitive(value[key])) {
      extracted[key] = value[key];
    }
  }
  return extracted as any;
}

export function collectionDiff<T>(
  prevValues: T[],
  newValues: T[],
  idProp: keyof T,
): { added: T[]; removed: T[]; updated: Partial<T>[]; diff?: Partial<T>[]; hasChanges: boolean };
export function collectionDiff<T>(
  prevValues: T[],
  newValues: T[],
  selectIdentity: keyof T | ((obj: T) => string | number),
  extractIdentity?: (obj: T) => object,
): { added: T[]; removed: T[]; updated: Partial<T>[]; diff?: Partial<T>[]; hasChanges: boolean } {
  if (!prevValues || !newValues) return { added: [], removed: [], updated: [], diff: [], hasChanges: false };

  if (typeof selectIdentity !== "function") {
    const key = selectIdentity;
    selectIdentity = (obj: T) => obj[key] as string | number;
    extractIdentity = (obj: T) => ({ [key]: obj[key] });
  }

  const prevIds = prevValues.map(selectIdentity);
  const newIds = newValues.map(selectIdentity);
  const uniqueIds = prevIds.concat(newIds).filter((id, i, arr) => i === arr.indexOf(id));

  const added: T[] = [];
  const removed: T[] = [];
  const updated: Partial<T>[] = [];
  const diff: Partial<T>[] = [];

  for (const id of uniqueIds) {
    if (!prevIds.includes(id)) {
      const newValue = newValues[newIds.indexOf(id)];
      added.push(newValue);
      diff.push(newValue);
    } else if (!newIds.includes(id)) {
      removed.push(prevValues[prevIds.indexOf(id)]);
    } else {
      const prev = prevValues[prevIds.indexOf(id)];
      const next = newValues[newIds.indexOf(id)];
      const objDiff = primitiveDiff(prev, next);
      if (objDiff) updated.push(Object.assign(objDiff, extractIdentity!(next)));
      diff.push(objDiff || extractIdentity!(next));
    }
  }

  const hasChanges = !!(added.length || removed.length || updated.length);
  return { added, removed, updated, diff: hasChanges ? diff : undefined, hasChanges };
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

export type Filter<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

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
