import { SidebarNav } from "./sidebar-nav";

export function DashboardShell({ children, user }: { children: React.ReactNode, user: any }) {
  return (
    <div className="flex bg-surface min-h-screen">
      <SidebarNav user={user} />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
