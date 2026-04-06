import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, supabase, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user, supabase, error: null };
}
