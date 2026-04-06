import { supabase } from "@/lib/supabase";
import type { LineUser, Message } from "@/lib/supabase";
import { StatsCard } from "@/components/stats-card";
import { RecentMessages } from "@/components/recent-messages";
import { UserList } from "@/components/user-list";

function getTodayStartJST(): string {
  const now = new Date();
  const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  jst.setHours(0, 0, 0, 0);
  const offset = 9 * 60 * 60 * 1000;
  return new Date(jst.getTime() - offset).toISOString();
}

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const todayStart = getTodayStartJST();

  const [
    { count: totalUsers },
    { count: todayUsers },
    { count: totalMessages },
    { count: todayMessages },
    { data: recentMessages },
    { data: recentUsers },
  ] = await Promise.all([
    supabase
      .from("line_users")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("line_users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .gte("sent_at", todayStart),
    supabase
      .from("messages")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(20),
    supabase
      .from("line_users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <>
      <header className="border-b bg-white dark:bg-zinc-900 px-6 py-4">
        <h1 className="text-xl font-bold">ダッシュボード</h1>
      </header>

      <main className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="総ユーザー数" value={totalUsers ?? 0} />
          <StatsCard title="本日の新規ユーザー" value={todayUsers ?? 0} />
          <StatsCard title="総メッセージ数" value={totalMessages ?? 0} />
          <StatsCard title="本日のメッセージ" value={todayMessages ?? 0} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RecentMessages messages={(recentMessages as Message[]) ?? []} />
          </div>
          <div>
            <UserList users={(recentUsers as LineUser[]) ?? []} />
          </div>
        </div>
      </main>
    </>
  );
}
