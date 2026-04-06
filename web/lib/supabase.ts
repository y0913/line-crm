import { createBrowserClient } from "@supabase/ssr";
import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

// Client Component用
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server Component / API Route用
export function createServerClient(cookieStore: ReadonlyRequestCookies) {
  return createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component からの呼び出し時は set できないので無視
          }
        },
      },
    }
  );
}

// 型定義
export type LineUser = {
  id: string;
  tenant_id: string;
  line_user_id: string;
  display_name: string | null;
  picture_url: string | null;
  source_type: string | null;
  memo: string | null;
  followed_at: string;
  created_at: string;
};

export type Tag = {
  id: string;
  tenant_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type UserTag = {
  id: string;
  tenant_id: string;
  line_user_id: string;
  tag_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  tenant_id: string;
  line_user_id: string;
  direction: "inbound" | "outbound";
  message_type: string;
  content: string | null;
  sent_at: string;
};

export type TenantLineConfig = {
  id: string;
  tenant_id: string;
  line_channel_secret: string;
  line_channel_access_token: string;
  webhook_active: boolean;
  created_at: string;
  updated_at: string;
};
