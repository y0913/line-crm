import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { lineUserId, message } = await req.json();

  if (!lineUserId || !message) {
    return NextResponse.json(
      { error: "lineUserId and message are required" },
      { status: 400 }
    );
  }

  // DBからLINEトークンを取得
  const { data: config } = await supabase
    .from("tenant_line_config")
    .select("line_channel_access_token")
    .eq("tenant_id", user!.id)
    .single();

  if (!config?.line_channel_access_token) {
    return NextResponse.json(
      { error: "LINE設定が未完了です。設定画面からトークンを登録してください。" },
      { status: 400 }
    );
  }

  // LINE Messaging APIでプッシュメッセージ送信
  const lineRes = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.line_channel_access_token}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: "text", text: message }],
    }),
  });

  if (!lineRes.ok) {
    const err = await lineRes.text();
    return NextResponse.json(
      { error: `LINE API error: ${err}` },
      { status: lineRes.status }
    );
  }

  // DBに送信メッセージを保存
  await supabase.from("messages").insert({
    tenant_id: user!.id,
    line_user_id: lineUserId,
    direction: "outbound",
    message_type: "text",
    content: message,
    sent_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
