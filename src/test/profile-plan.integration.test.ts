import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { loadEnv } from "vite";

// Opt in with a locally minted authenticated session; never commit credentials.
const runLive = process.env.PROFILE_PLAN_INTEGRATION === "1";

describe.skipIf(!runLive)("authenticated profile plan protection (live)", () => {
  let client: SupabaseClient<Database>;
  let userId = "";
  let original: { idade: number | null; salario: number | null; plano: string } | undefined;

  beforeAll(async () => {
    const env = loadEnv("development", process.cwd(), "VITE_");
    client = createClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const minted = JSON.parse(readFileSync(join(homedir(), ".cache/lovable-auth/session.json"), "utf8"));
    const { data, error } = await client.auth.setSession(minted.session);
    expect(error).toBeNull();
    if (!data.user) throw new Error("An authenticated account is required");
    userId = data.user.id;
    const profile = await client.from("profiles").select("idade,salario,plano").eq("id", userId).single();
    expect(profile.error).toBeNull();
    if (!profile.data) throw new Error("An existing profile is required");
    original = profile.data;
  });

  for (const plan of ["ouro", "diamante"]) {
    it(`rejects changing plano to ${plan} with 42501`, async () => {
      if (!original) throw new Error("Profile was not loaded");
      const target = original.plano === plan ? "gratuito" : plan;
      const result = await client.from("profiles").update({ plano: target }).eq("id", userId);
      expect(result.error?.code).toBe("42501");
      const stored = await client.from("profiles").select("plano").eq("id", userId).single();
      expect(stored.error).toBeNull();
      expect(stored.data?.plano).toBe(original.plano);
    });
  }

  it("allows saving idade and salario and reads back both values", async () => {
    if (!original) throw new Error("Profile was not loaded");
    const idade = original.idade === 37 ? 38 : 37;
    const salario = original.salario === 4321.98 ? 4322.98 : 4321.98;
    const result = await client.from("profiles").update({ idade, salario }).eq("id", userId);
    expect(result.error).toBeNull();
    const stored = await client.from("profiles").select("idade,salario,plano").eq("id", userId).single();
    expect(stored.error).toBeNull();
    expect(stored.data?.idade).toBe(idade);
    expect(stored.data?.salario).toBe(salario);
    expect(stored.data?.plano).toBe(original.plano);
  });

  afterAll(async () => {
    if (!original || !userId) return;
    const result = await client.from("profiles").update({
      idade: original.idade, salario: original.salario,
    }).eq("id", userId);
    expect(result.error).toBeNull();
    const stored = await client.from("profiles").select("idade,salario,plano").eq("id", userId).single();
    expect(stored.error).toBeNull();
    expect(stored.data).toEqual(original);
  });
});