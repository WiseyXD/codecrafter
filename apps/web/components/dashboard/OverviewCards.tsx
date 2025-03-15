import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCountsType } from "@/lib/types";

interface OverviewCardsProps {
  alertCounts: AlertCountsType;
}

export default function OverviewCards({
  alertCounts,
}: OverviewCardsProps): React.ReactNode {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{alertCounts.total}</div>
          <p className="text-xs text-gray-500">Last 24 hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {alertCounts.critical}
          </div>
          <p className="text-xs text-gray-500">Requires immediate attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4/6</div>
          <p className="text-xs text-gray-500">Monitored perimeters</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <div className="text-sm font-medium">Operational</div>
          </div>
          <p className="text-xs text-gray-500">All sensors online</p>
        </CardContent>
      </Card>
    </div>
  );
}
