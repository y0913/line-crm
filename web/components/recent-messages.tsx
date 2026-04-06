import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Message } from "@/lib/supabase";

type RecentMessagesProps = {
  messages: Message[];
};

export function RecentMessages({ messages }: RecentMessagesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近のメッセージ</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
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
              {messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {new Date(msg.sent_at).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-[120px] truncate">
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
                  <TableCell className="text-sm">{msg.message_type}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {msg.content ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
