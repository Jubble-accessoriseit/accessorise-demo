import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const make  = searchParams.get("make");
  const model = searchParams.get("model");

  const supabase = createSupabaseServerClient();

  // No params → distinct makes
  if (!make && !model) {
    const { data, error } = await supabase
      .from("bikes")
      .select("make")
      .order("make");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const unique = [...new Set((data ?? []).map((r) => r.make as string))].sort();
    return NextResponse.json({
      makes: unique.map((name) => ({ id: name, name, slug: name.toLowerCase().replace(/\s+/g, "-") })),
    });
  }

  // make provided → distinct models for that make
  if (make && !model) {
    const { data, error } = await supabase
      .from("bikes")
      .select("model")
      .eq("make", make)
      .order("model");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const unique = [...new Set((data ?? []).map((r) => r.model as string))].sort();
    return NextResponse.json({
      models: unique.map((name) => ({
        id: name,
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        category: "",
      })),
    });
  }

  // make + model + year → distinct variants for that make/model/year
  const year = searchParams.get("year");
  if (make && model && year) {
    const { data, error } = await supabase
      .from("bikes")
      .select("variant")
      .eq("make", make)
      .eq("model", model)
      .eq("year", parseInt(year, 10))
      .order("variant");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const unique = [
      ...new Set(
        (data ?? [])
          .map((r) => r.variant as string | null)
          .filter((v): v is string => !!v && v.trim() !== "")
      ),
    ].sort();
    return NextResponse.json({ variants: unique });
  }

  // model provided → distinct years for that model (optionally filtered by make)
  if (model) {
    const { data, error } = make
      ? await supabase.from("bikes").select("year").eq("model", model).eq("make", make).order("year", { ascending: false })
      : await supabase.from("bikes").select("year").eq("model", model).order("year", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const unique = [...new Set((data ?? []).map((r) => r.year as number))].sort((a, b) => b - a);
    return NextResponse.json({ years: unique });
  }

  return NextResponse.json({ error: "Invalid query" }, { status: 400 });
}
