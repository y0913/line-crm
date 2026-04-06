import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

// 設定取得（トークンはマスク表示）
export async function GET() {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { data } = await supabase
    .from("tenant_line_config")
    .select("*")
    .eq("tenant_id", user!.id)
    .single();

  if (!data) {
    return NextResponse.json({ configured: false });
  }

  return NextResponse.json({
    configured: true,
    line_channel_secret: maskToken(data.line_channel_secret),
    line_channel_access_token: maskToken(data.line_channel_access_token),
    webhook_active: data.webhook_active,
  });
}

// 設定保存
export async function PUT(req: NextRequest) {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { line_channel_secret, line_channel_access_token } = await req.json();

  if (!line_channel_secret || !line_channel_access_token) {
    return NextResponse.json(
      { error: "Channel SecretとAccess Tokenは必須です" },
      { status: 400 }
    );
  }

  const { error: dbError } = await supabase
    .from("tenant_line_config")
    .upsert(
      {
        tenant_id: user!.id,
        line_channel_secret,
        line_channel_access_token,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id" }
    );

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function maskToken(token: string): string {
  if (token.length <= 8) return "****";
  return token.slice(0, 4) + "****" + token.slice(-4);
}
