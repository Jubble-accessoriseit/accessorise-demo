import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("makes")
    .select("*")
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message });
  }

  return NextResponse.json({ data });
}