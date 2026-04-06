import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="pl-56 min-h-screen bg-zinc-50 dark:bg-zinc-950">
        {children}
      </div>
    </>
  );
}
