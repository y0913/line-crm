import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // bodyが空の場合に対応
  let body: { events?: unknown[] } = {};
  try {
    body = await req.json();
  } catch {
    return new Response("OK", { status: 200 });
  }

  const events = body.events ?? [];

  for (const event of events as Record<string, unknown>[]) {
    const source = event.source as Record<string, unknown> | undefined;
    const lineUserId = source?.userId as string | undefined;
    if (!lineUserId) continue;

    if (event.type === "follow") {
      // LINE APIからプロフィール取得
      let displayName: string | null = null;
      let pictureUrl: string | null = null;
      const channelAccessToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
      if (channelAccessToken) {
        try {
          const profileRes = await fetch(
            `https://api.line.me/v2/bot/profile/${lineUserId}`,
            {
              headers: { Authorization: `Bearer ${channelAccessToken}` },
            }
          );
          if (profileRes.ok) {
            const profile = await profileRes.json();
            displayName = profile.displayName ?? null;
            pictureUrl = profile.pictureUrl ?? null;
          }
        } catch {
          // プロフィール取得失敗は無視して続行
        }
      }

      await supabase.from("line_users").upsert({
        line_user_id: lineUserId,
        display_name: displayName,
        picture_url: pictureUrl,
        source_type: source?.type ?? "unknown",
        followed_at: new Date(event.timestamp as number).toISOString(),
      }, { onConflict: "line_user_id" });
    }

    if (event.type === "message") {
      const message = event.message as Record<string, unknown> | undefined;
      await supabase.from("messages").insert({
        line_user_id: lineUserId,
        direction: "inbound",
        message_type: message?.type,
        content: message?.text ?? null,
        sent_at: new Date(event.timestamp as number).toISOString(),
      });
    }
  }

  return new Response("OK", { status: 200 });
});
