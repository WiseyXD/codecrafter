import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bell,
  Camera,
  Settings,
  Users,
  FileText,
  BarChart3,
  Shield,
  HelpCircle,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSession, signOut } from "next-auth/react";
import {
  handleSignInAndRedirect,
  handleSignOutAndRedirect,
} from "@/actions/auth";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps): React.ReactNode {
  const pathname = usePathname();

  const { data: session } = useSession();
  console.log("user", session?.user);
  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Alerts", path: "/dashboard/alerts", icon: Bell, badge: "3" },
    { name: "Cameras", path: "/dashboard/cameras", icon: Camera },
    { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
    { name: "Users", path: "/dashboard/users", icon: Users },
    { name: "Reports", path: "/dashboard/reports", icon: FileText },
    { name: "Security", path: "/dashboard/security", icon: Shield },
  ];

  const bottomNavItems = [
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
    { name: "Help", path: "/dashboard/help", icon: HelpCircle },
  ];

  return (
    <div
      className={cn("flex flex-col h-full border-r bg-background", className)}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <Shield className="h-6 w-6" />
          <span>SecureWatch</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="py-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Button
                  key={item.path}
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.path}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator className="my-2" />

        <div className="py-2">
          <div className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Button
                  key={item.path}
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.path}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}

            {/* Logout Button */}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={async () => {
              await handleSignOutAndRedirect("/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </ScrollArea>

      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={
                session?.user?.image
                  ? session?.user?.image
                  : "/api/placeholder/32/32"
              }
              alt="User avatar"
            />
            <AvatarFallback>{session?.user?.name?.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5 text-sm">
            <div className="font-medium">{session?.user?.name}</div>
            <div className="text-xs text-muted-foreground">
              {session?.user?.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
