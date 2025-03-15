"use client";

import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps): React.ReactNode {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <Sidebar className="hidden lg:flex w-64 flex-col" />

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden absolute left-4 top-4 z-40"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className={cn("flex-1 overflow-y-auto lg:ml-64 pt-16 lg:pt-0")}>
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
