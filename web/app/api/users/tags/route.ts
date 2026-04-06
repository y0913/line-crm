import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { lineUserId, tagId } = await req.json();

  if (!lineUserId || !tagId) {
    return NextResponse.json({ error: "lineUserId and tagId are required" }, { status: 400 });
  }

  const { error: dbError } = await supabase
    .from("user_tags")
    .insert({ tenant_id: user!.id, line_user_id: lineUserId, tag_id: tagId });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { lineUserId, tagId } = await req.json();

  if (!lineUserId || !tagId) {
    return NextResponse.json({ error: "lineUserId and tagId are required" }, { status: 400 });
  }

  const { error: dbError } = await supabase
    .from("user_tags")
    .delete()
    .eq("line_user_id", lineUserId)
    .eq("tag_id", tagId);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
