import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const makeId = searchParams.get("makeId");
  const modelId = searchParams.get("modelId");
  const year = searchParams.get("year");

  const supabase = createSupabaseServerClient();

  if (!makeId && !modelId && !year) {
    const { data, error } = await supabase
      .from("makes")
      .select("id, name, slug")
      .order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ makes: data });
  }

  if (makeId && !modelId) {
    const { data, error } = await supabase
      .from("models")
      .select("id, name, slug, category")
      .eq("make_id", makeId)
      .order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ models: data });
  }

  if (modelId && !year) {
    const { data, error } = await supabase
      .from("model_variants")
      .select("year_from, year_to")
      .eq("model_id", modelId)
      .order("year_from", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const years = new Set<number>();

    for (const row of data ?? []) {
      const from = row.year_from;
      const to = row.year_to ?? new Date().getFullYear();
      for (let y = from; y <= to; y++) years.add(y);
    }

    return NextResponse.json({
      years: Array.from(years).sort((a, b) => b - a)
    });
  }

  if (modelId && year) {
    const selectedYear = Number(year);

    const { data, error } = await supabase
      .from("model_variants")
      .select("id, variant_name, year_from, year_to, market, engine_cc, engine_type")
      .eq("model_id", modelId)
      .lte("year_from", selectedYear)
      .or(`year_to.is.null,year_to.gte.${selectedYear}`)
      .order("variant_name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ variants: data });
  }

  return NextResponse.json({ error: "Invalid query" }, { status: 400 });
}