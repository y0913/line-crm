import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const { supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("tags")
    .select("*")
    .order("name");

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { name, color } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("tags")
    .insert({ tenant_id: user!.id, name, color: color ?? "#6b7280" })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
