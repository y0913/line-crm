import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// タグ一覧取得
export async function GET() {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// タグ新規作成
export async function POST(req: NextRequest) {
  const { name, color } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tags")
    .insert({ name, color: color ?? "#6b7280" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
