import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ユーザーにタグ付与
export async function POST(req: NextRequest) {
  const { lineUserId, tagId } = await req.json();

  if (!lineUserId || !tagId) {
    return NextResponse.json({ error: "lineUserId and tagId are required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_tags")
    .insert({ line_user_id: lineUserId, tag_id: tagId });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// ユーザーからタグ解除
export async function DELETE(req: NextRequest) {
  const { lineUserId, tagId } = await req.json();

  if (!lineUserId || !tagId) {
    return NextResponse.json({ error: "lineUserId and tagId are required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_tags")
    .delete()
    .eq("line_user_id", lineUserId)
    .eq("tag_id", tagId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
