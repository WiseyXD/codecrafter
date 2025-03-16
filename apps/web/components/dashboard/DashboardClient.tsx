"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import OverviewCards from "@/components/dashboard/OverviewCards";
import AlertList from "@/components/dashboard/AlertList";
import AlertDetails from "@/components/dashboard/AlertDetails";
import {
  FilterType,
  SeverityFilterType,
  AlertType,
  AlertCountsType,
} from "@/lib/types";

export default function Dashboard(): React.ReactNode {
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [severityFilter, setSeverityFilter] =
    useState<SeverityFilterType>("all");
  const [timeframeFilter, setTimeframeFilter] = useState<string>("24h");
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [alertCounts, setAlertCounts] = useState<AlertCountsType>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: 0,
  });

  // Fetch alerts from the API
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (severityFilter !== "all") {
        params.append("severity", severityFilter);
      }

      params.append("timeframe", timeframeFilter);

      // Add cityId if available from user context or local storage
      const cityId = localStorage.getItem("cityId");
      if (cityId) {
        params.append("cityId", cityId);
      }

      // Fetch data from the API
      const response = await fetch(`/api/alerts?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Error fetching alerts: ${response.status}`);
      }

      const data = await response.json();

      // Transform dates from strings to Date objects
      const alertsWithDates = data.alerts.map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
      }));

      setAlerts(alertsWithDates);

      // Calculate alert counts
      const counts: AlertCountsType = {
        critical: alertsWithDates.filter(
          (a: AlertType) => a.severity === "critical",
        ).length,
        high: alertsWithDates.filter((a: AlertType) => a.severity === "high")
          .length,
        medium: alertsWithDates.filter(
          (a: AlertType) => a.severity === "medium",
        ).length,
        low: alertsWithDates.filter((a: AlertType) => a.severity === "low")
          .length,
        total: alertsWithDates.length,
      };

      setAlertCounts(counts);

      // Clear selected alert if it's no longer in the results
      if (
        selectedAlert &&
        !alertsWithDates.find((a: any) => a.id === selectedAlert.id)
      ) {
        setSelectedAlert(null);
      }

      setError(null);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError(
        err instanceof Error ? err.message : "Unknown error fetching alerts",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch alerts on initial load and when filters change
  useEffect(() => {
    fetchAlerts();

    // Set up auto-refresh timer (every 30 seconds)
    const timer = setInterval(() => {
      fetchAlerts();
    }, 30000);

    // Clean up timer on component unmount
    return () => clearInterval(timer);
  }, [statusFilter, severityFilter, timeframeFilter]);

  // Refresh alerts on demand
  const handleRefresh = () => {
    fetchAlerts();
  };

  return (
    <div className="container mx-auto p-4">
      <Header onRefresh={handleRefresh} />
      <OverviewCards alertCounts={alertCounts} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertList
            filteredAlerts={alerts}
            selectedAlert={selectedAlert}
            setSelectedAlert={setSelectedAlert}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            severityFilter={severityFilter}
            setSeverityFilter={setSeverityFilter}
            timeframeFilter={timeframeFilter}
            setTimeframeFilter={setTimeframeFilter}
            isLoading={loading}
            error={error}
          />
        </div>
        <div>
          <AlertDetails selectedAlert={selectedAlert} />
        </div>
      </div>
    </div>
  );
}
