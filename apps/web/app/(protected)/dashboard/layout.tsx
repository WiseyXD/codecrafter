"use client";

import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps): React.ReactNode {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 border-r">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
