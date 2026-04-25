import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function compactModelKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function acronymModelKey(value: string) {
  const tokens = value.match(/[a-z]+|\d+/gi) ?? [];

  return tokens
    .map((token) => {
      if (/^\d+$/.test(token)) return token;
      if (token === token.toUpperCase() && token.length <= 3) return token;
      return token[0] ?? "";
    })
    .join("")
    .toLowerCase();
}

function getModelMatchKeys(value: string) {
  return new Set([compactModelKey(value), acronymModelKey(value)].filter(Boolean));
}

function preferDisplayModelName(left: string, right: string) {
  const leftHasSpaces = /\s/.test(left);
  const rightHasSpaces = /\s/.test(right);

  if (leftHasSpaces !== rightHasSpaces) return leftHasSpaces ? left : right;
  if (left.length !== right.length) return left.length > right.length ? left : right;
  return left.localeCompare(right) <= 0 ? left : right;
}

function getCanonicalModelNames(models: string[]) {
  const modelByKey = new Map<string, string>();

  models.forEach((model) => {
    const keys = getModelMatchKeys(model);
    const existing = [...keys].map((key) => modelByKey.get(key)).find(Boolean);
    const canonical = existing ? preferDisplayModelName(existing, model) : model;

    keys.forEach((key) => modelByKey.set(key, canonical));
  });

  return [...new Set([...modelByKey.values()])].sort();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const make    = searchParams.get("make");
  const model   = searchParams.get("model");
  const variant = searchParams.get("variant"); // null = not in URL; "" = no variant filter

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

  // make only → distinct models for that make
  if (make && !model) {
    const { data, error } = await supabase
      .from("bikes")
      .select("model")
      .eq("make", make)
      .order("model");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const unique = getCanonicalModelNames([...new Set((data ?? []).map((r) => r.model as string))]);
    return NextResponse.json({
      models: unique.map((name) => ({
        id: name,
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        category: "",
      })),
    });
  }

  // make + model + variant param present → years for that make/model(/variant)
  // variant="" means no variant filter (single-variant bikes); variant="X" filters to that variant
  if (make && model && variant !== null) {
    let query = supabase
      .from("bikes")
      .select("year")
      .eq("make", make)
      .eq("model", model);

    if (variant) query = query.eq("variant", variant);

    const { data, error } = await query.order("year", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const unique = [...new Set((data ?? []).map((r) => r.year as number))].sort((a, b) => b - a);
    return NextResponse.json({ years: unique });
  }

  // make + model → distinct variants for that make/model
  if (make && model) {
    const { data, error } = await supabase
      .from("bikes")
      .select("variant")
      .eq("make", make)
      .eq("model", model)
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

  return NextResponse.json({ error: "Invalid query" }, { status: 400 });
}
