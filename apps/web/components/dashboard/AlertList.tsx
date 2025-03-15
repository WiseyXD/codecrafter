"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AlertItem from "./AlertItem";
import {
  AlertType,
  FilterType,
  SeverityFilterType,
  AlertCategory,
} from "@/lib/types";

interface AlertListProps {
  filteredAlerts: AlertType[];
  selectedAlert: AlertType | null;
  setSelectedAlert: (alert: AlertType) => void;
  statusFilter: FilterType;
  setStatusFilter: (status: FilterType) => void;
  severityFilter: SeverityFilterType;
  setSeverityFilter: (severity: SeverityFilterType) => void;
}

export default function AlertList({
  filteredAlerts,
  selectedAlert,
  setSelectedAlert,
  statusFilter,
  setStatusFilter,
  severityFilter,
  setSeverityFilter,
}: AlertListProps): React.ReactNode {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Security Alerts</CardTitle>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value: FilterType) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={severityFilter}
              onValueChange={(value: SeverityFilterType) =>
                setSeverityFilter(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No alerts match your current filters
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                isSelected={selectedAlert?.id === alert.id}
                onSelect={() => setSelectedAlert(alert)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
