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
      await supabase.from("line_users").upsert({
        line_user_id: lineUserId,
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
