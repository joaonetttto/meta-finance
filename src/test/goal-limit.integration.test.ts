import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { loadEnv } from "vite";

describe.skipIf(process.env.GOAL_LIMIT_INTEGRATION !== "1")("live authenticated free goal limit", () => {
  let client: SupabaseClient<Database>;
  let userId = "";
  let initialCount = 0;
  const prefix = `plan-limit-test-${crypto.randomUUID()}`;

  beforeAll(async () => {
    const env = loadEnv("development", process.cwd(), "VITE_");
    client = createClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const minted = JSON.parse(readFileSync(join(homedir(), ".cache/lovable-auth/session.json"), "utf8"));
    const auth = await client.auth.setSession(minted.session);
    expect(auth.error).toBeNull();
    if (!auth.data.user) throw new Error("Authenticated session required");
    userId = auth.data.user.id;
    const profile = await client.from("profiles").select("plano").eq("id", userId).single();
    expect(profile.error).toBeNull();
    expect(profile.data?.plano).toBe("gratuito");
    const goals = await client.from("goals").select("id", { count: "exact", head: true }).eq("user_id", userId);
    expect(goals.error).toBeNull();
    initialCount = goals.count ?? 0;
  });

  it("allows up to three goals then rejects another insert with 42501", async () => {
    for (let count = initialCount; count < 3; count++) {
      const result = await client.from("goals").insert({
        user_id: userId, nome: `${prefix}-${count}`, valor_objetivo: 1000, valor_atual: 0, prazo: "2030-12-31",
      });
      expect(result.error).toBeNull();
    }
    const rejected = await client.from("goals").insert({
      user_id: userId, nome: `${prefix}-blocked`, valor_objetivo: 1000, valor_atual: 0, prazo: "2030-12-31",
    });
    expect(rejected.error?.code).toBe("42501");
    expect(rejected.error?.message).toContain("no máximo 3 metas");
    const stored = await client.from("goals").select("id", { count: "exact", head: true }).eq("user_id", userId);
    expect(stored.error).toBeNull();
    expect(stored.count).toBe(Math.max(initialCount, 3));
  });

  afterAll(async () => {
    if (!userId) return;
    const cleanup = await client.from("goals").delete().eq("user_id", userId).like("nome", `${prefix}%`);
    expect(cleanup.error).toBeNull();
    const remaining = await client.from("goals").select("id", { count: "exact", head: true }).eq("user_id", userId).like("nome", `${prefix}%`);
    expect(remaining.error).toBeNull();
    expect(remaining.count).toBe(0);
    const restored = await client.from("goals").select("id", { count: "exact", head: true }).eq("user_id", userId);
    expect(restored.count).toBe(initialCount);
  });
});