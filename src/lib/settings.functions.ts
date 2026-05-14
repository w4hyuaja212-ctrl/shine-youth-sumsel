import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DEFAULT_NPSN = ["https://api.fazriansyah.eu.org/v1"];

export async function getNpsnEndpoints(): Promise<string[]> {
  const { data } = await supabaseAdmin.from("app_settings").select("value").eq("key", "npsn_api_endpoints").maybeSingle();
  const v = data?.value as unknown;
  if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
    const arr = (v as string[]).map((s) => s.replace(/\/+$/, "")).filter(Boolean);
    return arr.length ? arr : DEFAULT_NPSN;
  }
  return DEFAULT_NPSN;
}

export const setNpsnEndpoints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      endpoints: z.array(z.string().url().max(500)).min(1).max(10),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // hanya superadmin
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (!roles?.some((r: any) => r.role === "panitia_superadmin")) {
      throw new Error("Hanya Superadmin yang dapat mengubah pengaturan.");
    }
    const cleaned = Array.from(new Set(data.endpoints.map((s) => s.replace(/\/+$/, "")))).filter(Boolean);
    const { error } = await supabaseAdmin.from("app_settings").upsert(
      { key: "npsn_api_endpoints", value: cleaned, updated_by: context.userId },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true, endpoints: cleaned };
  });
