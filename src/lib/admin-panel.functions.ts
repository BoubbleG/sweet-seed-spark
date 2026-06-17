import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const adminBypassPin = createServerFn({ method: "POST" })
  .inputValidator(z.object({ passwordHash: z.string(), restaurantId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
    );
    const { data: rows, error } = await supabase.rpc("admin_create_pin_session", {
      _password_hash: data.passwordHash,
      _restaurant_id: data.restaurantId,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row?.session_token) throw new Error("Falha ao criar sessão");
    return {
      token: row.session_token as string,
      expiresAt: row.expires_at as string,
    };
  });
