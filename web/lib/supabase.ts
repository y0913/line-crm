import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type LineUser = {
  id: string;
  line_user_id: string;
  display_name: string | null;
  picture_url: string | null;
  source_type: string | null;
  followed_at: string;
  created_at: string;
};

export type Message = {
  id: string;
  line_user_id: string;
  direction: "inbound" | "outbound";
  message_type: string;
  content: string | null;
  sent_at: string;
};
