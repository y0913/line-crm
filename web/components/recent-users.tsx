import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LineUser } from "@/lib/supabase";

type RecentUsersProps = {
  users: LineUser[];
};

export function RecentUsers({ users }: RecentUsersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近のユーザー</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            ユーザーはまだいません
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>表示名</TableHead>
                <TableHead>LINE ID</TableHead>
                <TableHead>ソース</TableHead>
                <TableHead>フォロー日時</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    {user.picture_url && (
                      <img
                        src={user.picture_url}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm">
                      {user.display_name ?? "不明"}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-[120px] truncate">
                    {user.line_user_id}
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.source_type ?? "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {new Date(user.followed_at).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
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
