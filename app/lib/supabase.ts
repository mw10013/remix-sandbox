import { createClient } from "@supabase/supabase-js";
import type { Database } from "types/database";

export const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
      // See Auth Admin: https://supabase.com/docs/reference/javascript/admin-api
      auth: {
        autoRefreshToken: false,
        // https://github.com/nuxt-modules/supabase/issues/188
        persistSession: false,
      },
    }
  );