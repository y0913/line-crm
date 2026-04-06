import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


async function verifySignature(
  body: string,
  signature: string,
  channelSecret: string
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(channelSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body)
  );
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return expected === signature;
}

async function fetchLineProfile(
  lineUserId: string,
  accessToken: string
): Promise<{
  displayName: string | null;
  pictureUrl: string | null;
}> {
  try {
    const res = await fetch(
      `https://api.line.me/v2/bot/profile/${lineUserId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (res.ok) {
      const profile = await res.json();
      return {
        displayName: profile.displayName ?? null,
        pictureUrl: profile.pictureUrl ?? null,
      };
    }
  } catch {
    // ignore
  }
  return { displayName: null, pictureUrl: null };
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // URLからテナントIDを取得
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const tenantId = pathParts[pathParts.length - 1];

  if (!tenantId || tenantId === "line-webhook") {
    return new Response("tenant_id is required", { status: 400 });
  }

  // テナントのLINE設定を取得
  const { data: config } = await supabase
    .from("tenant_line_config")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();

  if (!config) {
    return new Response("Tenant not found", { status: 404 });
  }

  // リクエストボディを取得
  const rawBody = await req.text();

  // LINE署名検証
  const signature = req.headers.get("x-line-signature") ?? "";
  if (signature) {
    const valid = await verifySignature(
      rawBody,
      signature,
      config.line_channel_secret
    );
    if (!valid) {
      return new Response("Invalid signature", { status: 401 });
    }
  }

  // bodyが空の場合に対応
  let body: { events?: unknown[] } = {};
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("OK", { status: 200 });
  }

  const events = body.events ?? [];

  for (const event of events as Record<string, unknown>[]) {
    const source = event.source as Record<string, unknown> | undefined;
    const lineUserId = source?.userId as string | undefined;
    if (!lineUserId) continue;

    if (event.type === "follow") {
      const { displayName, pictureUrl } = await fetchLineProfile(
        lineUserId,
        config.line_channel_access_token
      );

      await supabase.from("line_users").upsert(
        {
          tenant_id: tenantId,
          line_user_id: lineUserId,
          display_name: displayName,
          picture_url: pictureUrl,
          source_type: source?.type ?? "unknown",
          followed_at: new Date(event.timestamp as number).toISOString(),
        },
        { onConflict: "tenant_id,line_user_id" }
      );
    }

    if (event.type === "message") {
      // ユーザーが未登録 or プロフィール未取得なら取得して保存
      const { data: existingUser } = await supabase
        .from("line_users")
        .select("display_name")
        .eq("tenant_id", tenantId)
        .eq("line_user_id", lineUserId)
        .single();

      if (!existingUser || !existingUser.display_name) {
        const { displayName, pictureUrl } = await fetchLineProfile(
          lineUserId,
          config.line_channel_access_token
        );

        await supabase.from("line_users").upsert(
          {
            tenant_id: tenantId,
            line_user_id: lineUserId,
            display_name: displayName,
            picture_url: pictureUrl,
            source_type: source?.type ?? "unknown",
          },
          { onConflict: "tenant_id,line_user_id" }
        );
      }

      const message = event.message as Record<string, unknown> | undefined;
      await supabase.from("messages").insert({
        tenant_id: tenantId,
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
