// src/hooks/useUsage.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// Use an untyped client ONLY in this file to avoid deep generic expansion
const sbAny = supabase as unknown as SupabaseClient<any>;
const fromAny = (table: string) => sbAny.from(table);

// Month window helper
const monthStartIso = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export type Usage = {
  legacyCountMonth: number;
  ideaCountMonth: number;
  timelessCountMonth: number;
  wisdomCountMonth: number;
  storageBytes: number;
  loading: boolean;
  error?: string;
};

async function countTable(
  table: string,
  userId: string,
  createdField = "created_at",
  userField = "user_id"
) {
  const from = monthStartIso();

  // typed loosening on purpose because table/column names are dynamic
  const { count, error } = await fromAny(table)
    .select("id", { count: "exact", head: true })
    .eq(userField as any, userId)
    .gte(createdField as any, from)
    // .eq("is_deleted" as any, false); // ignored if column doesn't exist

  // If `is_deleted` column doesn't exist yet, run again without it
  if (error?.message?.includes('column "is_deleted"')) {
    const fallback = await fromAny(table)
      .select("id", { count: "exact", head: true })
      .eq(userField as any, userId)
      .gte(createdField as any, from);
    return { count: fallback.count ?? 0, error: fallback.error?.message };
  }

  return { count: count ?? 0, error: error?.message };
}

async function listAllObjects(bucket: string, prefix: string) {
  // Flatten listing; Supabase Storage lists files with size on the object.
  // We also check metadata.size if present.
  let total = 0;
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit: pageSize, offset: page * pageSize });

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const obj of data) {
      const anyObj = obj as any;
      // prefer top-level size if available (Supabase provides this)
      if (typeof anyObj.size === "number") {
        total += anyObj.size;
        continue;
      }
      // fallback to metadata.size
      const meta = anyObj.metadata;
      if (meta && typeof meta.size === "number") {
        total += meta.size;
      }
      // NOTE: if you have folders, you can detect and recurse here.
    }

    if (data.length < pageSize) break;
    page++;
  }

  return total;
}

export function useUsage(userId?: string) {
  const [state, setState] = useState<Usage>({
    legacyCountMonth: 0,
    ideaCountMonth: 0,
    timelessCountMonth: 0,
    wisdomCountMonth: 0,
    storageBytes: 0,
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      // no user → not loading, zero usage
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [legacy, idea, timeless, wisdom] = await Promise.all([
          countTable("legacy_posts", userId),
          countTable("idea_posts", userId),
          countTable("timeless_messages", userId),
          countTable("wisdom_resources", userId, "created_at", "created_by"),
        ]);

        // Storage: assume files are under content_media bucket, prefixed by userId/
        let storageBytes = 0;
        try {
          storageBytes = await listAllObjects("content_media", `${userId}`);
        } catch {
          // ignore storage error, keep 0
        }

        if (!cancelled) {
          setState({
            legacyCountMonth: legacy.count || 0,
            ideaCountMonth: idea.count || 0,
            timelessCountMonth: timeless.count || 0,
            wisdomCountMonth: wisdom.count || 0,
            storageBytes,
            loading: false,
            error: legacy.error || idea.error || timeless.error || wisdom.error,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: e?.message || "Failed to load usage",
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return state;
}
