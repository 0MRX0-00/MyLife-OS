"use client";

import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <Header user={user} />
        <main className="flex-1 px-4 pb-20 pt-4 lg:px-8 lg:pb-8 lg:pt-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
