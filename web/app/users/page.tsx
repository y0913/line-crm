import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { LineUser } from "@/lib/supabase";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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

export default async function UsersPage() {
  const [{ data: users, count }] = await Promise.all([
    supabase
      .from("line_users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <header className="border-b bg-white dark:bg-zinc-900 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">ユーザー</h1>
        <span className="text-sm text-muted-foreground">{count ?? 0} 件</span>
      </header>

      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>ユーザー一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {!users || users.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                ユーザーはまだいません
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ユーザー</TableHead>
                    <TableHead>LINE ID</TableHead>
                    <TableHead>ソース</TableHead>
                    <TableHead>フォロー日時</TableHead>
                    <TableHead>登録日時</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(users as LineUser[]).map((user) => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <TableCell>
                        <Link href={`/users/${user.id}`} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {user.picture_url && (
                              <AvatarImage
                                src={user.picture_url}
                                alt={user.display_name ?? ""}
                              />
                            )}
                            <AvatarFallback className="text-xs bg-zinc-100 dark:bg-zinc-800">
                              {user.display_name?.charAt(0).toUpperCase() ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {user.display_name ?? "名前未取得"}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {user.line_user_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {user.source_type ?? "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(user.followed_at)}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(user.created_at)}
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
