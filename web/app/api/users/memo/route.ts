import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const { supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { lineUserId, memo } = await req.json();

  if (!lineUserId) {
    return NextResponse.json({ error: "lineUserId is required" }, { status: 400 });
  }

  const { error: dbError } = await supabase
    .from("line_users")
    .update({ memo: memo ?? null })
    .eq("line_user_id", lineUserId);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
