import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { LineUser } from "@/lib/supabase";

type UserListProps = {
  users: LineUser[];
};

function getInitial(name: string | null): string {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UserList({ users }: UserListProps) {
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
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Avatar className="h-10 w-10">
                  {user.picture_url && (
                    <AvatarImage src={user.picture_url} alt={user.display_name ?? ""} />
                  )}
                  <AvatarFallback className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {getInitial(user.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.display_name ?? "名前未取得"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {user.line_user_id}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    {user.source_type ?? "unknown"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(user.followed_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
