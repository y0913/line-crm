import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { lineUserId, message } = await req.json();

  if (!lineUserId || !message) {
    return NextResponse.json(
      { error: "lineUserId and message are required" },
      { status: 400 }
    );
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "LINE_CHANNEL_ACCESS_TOKEN is not configured" },
      { status: 500 }
    );
  }

  // LINE Messaging APIでプッシュメッセージ送信
  const lineRes = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: "text", text: message }],
    }),
  });

  if (!lineRes.ok) {
    const error = await lineRes.text();
    return NextResponse.json(
      { error: `LINE API error: ${error}` },
      { status: lineRes.status }
    );
  }

  // DBに送信メッセージを保存
  await supabase.from("messages").insert({
    line_user_id: lineUserId,
    direction: "outbound",
    message_type: "text",
    content: message,
    sent_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
