import React from "react";
import AlertItem from "./AlertItem";
import { AlertType, FilterType, SeverityFilterType } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";

interface AlertListProps {
  filteredAlerts: AlertType[];
  selectedAlert: AlertType | null;
  setSelectedAlert: (alert: AlertType | null) => void;
  statusFilter: FilterType;
  setStatusFilter: (status: FilterType) => void;
  severityFilter: SeverityFilterType;
  setSeverityFilter: (severity: SeverityFilterType) => void;
  timeframeFilter: string;
  setTimeframeFilter: (timeframe: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function AlertList({
  filteredAlerts,
  selectedAlert,
  setSelectedAlert,
  statusFilter,
  setStatusFilter,
  severityFilter,
  setSeverityFilter,
  timeframeFilter,
  setTimeframeFilter,
  isLoading,
  error,
}: AlertListProps): React.ReactNode {
  return (
    <div className="bg-white dark:bg-black rounded-lg shadow">
      <div className="p-4 border-b ">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h2 className="text-xl font-bold dark:text-white">Recent Alerts</h2>

          <div className="flex flex-wrap gap-2">
            <Select
              value={timeframeFilter}
              onValueChange={(value) => setTimeframeFilter(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="6h">Last 6 Hours</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as FilterType)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={severityFilter}
              onValueChange={(value) =>
                setSeverityFilter(value as SeverityFilterType)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-4 dark:bg-black">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
            <span className="ml-2 text-gray-500 dark:text-gray-400">
              Loading alerts...
            </span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12 text-red-500 dark:text-red-400">
            <AlertTriangle className="h-8 w-8 mr-2" />
            <span>Error: {error}</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No alerts found matching your criteria.
          </div>
        ) : (
          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {filteredAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                isSelected={selectedAlert?.id === alert.id}
                onSelect={() => setSelectedAlert(alert)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
