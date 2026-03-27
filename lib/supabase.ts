import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
  throw new Error(
    "Supabase URL is missing or invalid. Check NEXT_PUBLIC_SUPABASE_URL in Vercel."
  );
}

if (!supabaseKey) {
  throw new Error(
    "Supabase key is missing. Check NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);