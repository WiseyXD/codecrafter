import React from "react";
import { Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header(): React.ReactNode {
  return (
    <header className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Surveillance System Dashboard</h1>
        <p className="text-gray-500">
          Real-time security alerts and notifications
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          <Clock className="mr-2 h-4 w-4" />
          Live Feed
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
        <Avatar>
          <AvatarImage src="/api/placeholder/40/40" alt="User avatar" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
