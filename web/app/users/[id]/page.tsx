import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { LineUser, Message } from "@/lib/supabase";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: user } = await supabase
    .from("line_users")
    .select("*")
    .eq("id", id)
    .single();

  if (!user) notFound();

  const typedUser = user as LineUser;

  const [{ data: messages }, { count: messageCount }] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .eq("line_user_id", typedUser.line_user_id)
      .order("sent_at", { ascending: false })
      .limit(50),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("line_user_id", typedUser.line_user_id),
  ]);

  const typedMessages = (messages as Message[]) ?? [];

  return (
    <>
      <header className="border-b bg-white dark:bg-zinc-900 px-6 py-4">
        <h1 className="text-xl font-bold">ユーザー詳細</h1>
      </header>

      <main className="p-6 space-y-6">
        {/* Profile */}
        <Card>
          <CardContent className="flex items-center gap-6 pt-6">
            <Avatar className="h-20 w-20">
              {typedUser.picture_url && (
                <AvatarImage
                  src={typedUser.picture_url}
                  alt={typedUser.display_name ?? ""}
                />
              )}
              <AvatarFallback className="text-2xl bg-zinc-100 dark:bg-zinc-800">
                {typedUser.display_name?.charAt(0).toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">
                {typedUser.display_name ?? "名前未取得"}
              </h2>
              <p className="text-sm text-muted-foreground font-mono">
                {typedUser.line_user_id}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Badge variant="secondary">
                  {typedUser.source_type ?? "unknown"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  フォロー: {formatDate(typedUser.followed_at)}
                </span>
                <span className="text-sm text-muted-foreground">
                  メッセージ: {messageCount ?? 0}件
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message History */}
        <Card>
          <CardHeader>
            <CardTitle>メッセージ履歴</CardTitle>
          </CardHeader>
          <CardContent>
            {typedMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                メッセージはまだありません
              </p>
            ) : (
              <div className="space-y-3">
                {typedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.direction === "outbound" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.direction === "outbound"
                          ? "bg-blue-500 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800"
                      }`}
                    >
                      <p className="text-sm">{msg.content ?? `[${msg.message_type}]`}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.direction === "outbound"
                            ? "text-blue-100"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(msg.sent_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
