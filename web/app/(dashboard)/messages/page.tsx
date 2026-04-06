import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import type { Message } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default async function MessagesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const [{ data: messages, count }] = await Promise.all([
    supabase
      .from("messages")
      .select("*", { count: "exact" })
      .order("sent_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <>
      <header className="border-b bg-white dark:bg-zinc-900 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">メッセージ</h1>
        <span className="text-sm text-muted-foreground">{count ?? 0} 件</span>
      </header>

      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>メッセージ一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {!messages || messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                メッセージはまだありません
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日時</TableHead>
                    <TableHead>ユーザーID</TableHead>
                    <TableHead>方向</TableHead>
                    <TableHead>種別</TableHead>
                    <TableHead>内容</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(messages as Message[]).map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(msg.sent_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[160px] truncate">
                        {msg.line_user_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            msg.direction === "inbound" ? "default" : "secondary"
                          }
                        >
                          {msg.direction === "inbound" ? "受信" : "送信"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {msg.message_type}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-sm">
                        {msg.content ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
