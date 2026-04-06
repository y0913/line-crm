import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function fetchLineProfile(lineUserId: string): Promise<{
  displayName: string | null;
  pictureUrl: string | null;
}> {
  const channelAccessToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
  if (!channelAccessToken) return { displayName: null, pictureUrl: null };

  try {
    const res = await fetch(
      `https://api.line.me/v2/bot/profile/${lineUserId}`,
      { headers: { Authorization: `Bearer ${channelAccessToken}` } }
    );
    if (res.ok) {
      const profile = await res.json();
      return {
        displayName: profile.displayName ?? null,
        pictureUrl: profile.pictureUrl ?? null,
      };
    }
  } catch {
    // プロフィール取得失敗は無視して続行
  }
  return { displayName: null, pictureUrl: null };
}

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
      const { displayName, pictureUrl } = await fetchLineProfile(lineUserId);

      await supabase.from("line_users").upsert({
        line_user_id: lineUserId,
        display_name: displayName,
        picture_url: pictureUrl,
        source_type: source?.type ?? "unknown",
        followed_at: new Date(event.timestamp as number).toISOString(),
      }, { onConflict: "line_user_id" });
    }

    if (event.type === "message") {
      // ユーザーが未登録 or プロフィール未取得なら取得して保存
      const { data: existingUser } = await supabase
        .from("line_users")
        .select("display_name")
        .eq("line_user_id", lineUserId)
        .single();

      if (!existingUser || !existingUser.display_name) {
        const { displayName, pictureUrl } = await fetchLineProfile(lineUserId);

        await supabase.from("line_users").upsert({
          line_user_id: lineUserId,
          display_name: displayName,
          picture_url: pictureUrl,
          source_type: source?.type ?? "unknown",
        }, { onConflict: "line_user_id" });
      }

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
