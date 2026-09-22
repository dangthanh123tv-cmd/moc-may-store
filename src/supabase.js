import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://deknuzzystcfvbyyboah.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rsqbMvBnAmDJnhJk8iAbxQ_OogptzEJ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
