"use client";

import React, { useState } from "react";
import Header from "@/components/dashboard/Header";
import OverviewCards from "@/components/dashboard/OverviewCards";
import AlertList from "@/components/dashboard/AlertList";
import AlertDetails from "@/components/dashboard/AlertDetails";
import {
  FilterType,
  SeverityFilterType,
  AlertType,
  AlertCategory,
  MOCK_ALERTS,
} from "@/lib/types";

export default function Dashboard(): React.ReactNode {
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [severityFilter, setSeverityFilter] =
    useState<SeverityFilterType>("all");

  // Filter alerts based on current filters
  const filteredAlerts = MOCK_ALERTS.filter((alert) => {
    if (statusFilter !== "all" && alert.status !== statusFilter) return false;
    if (severityFilter !== "all" && alert.severity !== severityFilter)
      return false;
    return true;
  });

  // Count alerts by severity
  const alertCounts = {
    critical: MOCK_ALERTS.filter((a) => a.severity === "critical").length,
    high: MOCK_ALERTS.filter((a) => a.severity === "high").length,
    medium: MOCK_ALERTS.filter((a) => a.severity === "medium").length,
    low: MOCK_ALERTS.filter((a) => a.severity === "low").length,
    total: MOCK_ALERTS.length,
  };

  return (
    <div className="container mx-auto p-4">
      <Header />

      <OverviewCards alertCounts={alertCounts} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertList
            filteredAlerts={filteredAlerts}
            selectedAlert={selectedAlert}
            setSelectedAlert={setSelectedAlert}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            severityFilter={severityFilter}
            setSeverityFilter={setSeverityFilter}
          />
        </div>

        <div>
          <AlertDetails selectedAlert={selectedAlert} />
        </div>
      </div>
    </div>
  );
}
