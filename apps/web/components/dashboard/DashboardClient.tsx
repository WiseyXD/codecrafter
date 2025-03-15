// app/dashboard/page.tsx
"use client";

import React, { useState } from "react";
import {
  Bell,
  Camera,
  Clock,
  Filter,
  MapPin,
  Shield,
  ShieldAlert,
  Thermometer,
} from "lucide-react";
import { format } from "date-fns";

// Import shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import types
import {
  Alert as AlertType,
  AlertSeverity,
  AlertStatus,
  AlertCountsType,
  FilterType,
  SeverityFilterType,
} from "@/lib/types";

// Mock data for demonstration
const MOCK_ALERTS: AlertType[] = [
  {
    id: "alert-001",
    type: "intrusion",
    severity: "high",
    timestamp: new Date("2025-03-15T08:24:00"),
    location: "North Perimeter",
    description: "Multiple individuals detected crossing perimeter fence",
    sensorData: {
      video: true,
      vibration: true,
      thermal: false,
      weather: { temp: 18, conditions: "Clear" },
    },
    status: "unresolved",
    thumbnail: "/api/placeholder/300/200",
  },
  {
    id: "alert-002",
    type: "anomaly",
    severity: "medium",
    timestamp: new Date("2025-03-15T06:45:00"),
    location: "East Gate",
    description: "Unusual heat signature detected near storage area",
    sensorData: {
      video: false,
      vibration: false,
      thermal: true,
      weather: { temp: 16, conditions: "Foggy" },
    },
    status: "investigating",
    thumbnail: "/api/placeholder/300/200",
  },
  {
    id: "alert-003",
    type: "movement",
    severity: "low",
    timestamp: new Date("2025-03-15T03:12:00"),
    location: "South Building",
    description:
      "Movement detected after hours, recognized as maintenance staff",
    sensorData: {
      video: true,
      vibration: true,
      thermal: true,
      weather: { temp: 15, conditions: "Cloudy" },
    },
    status: "resolved",
    thumbnail: "/api/placeholder/300/200",
  },
  {
    id: "alert-004",
    type: "intrusion",
    severity: "critical",
    timestamp: new Date("2025-03-15T02:07:00"),
    location: "Server Room",
    description: "Unauthorized access attempt at server room door",
    sensorData: {
      video: true,
      vibration: true,
      thermal: true,
      weather: { temp: 14, conditions: "Clear" },
    },
    status: "unresolved",
    thumbnail: "/api/placeholder/300/200",
  },
  {
    id: "alert-005",
    type: "anomaly",
    severity: "medium",
    timestamp: new Date("2025-03-14T23:55:00"),
    location: "West Parking",
    description: "Vehicle parked in restricted area",
    sensorData: {
      video: true,
      vibration: false,
      thermal: false,
      weather: { temp: 12, conditions: "Rainy" },
    },
    status: "resolved",
    thumbnail: "/api/placeholder/300/200",
  },
];

// Dashboard component
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
  const alertCounts: AlertCountsType = {
    critical: MOCK_ALERTS.filter((a) => a.severity === "critical").length,
    high: MOCK_ALERTS.filter((a) => a.severity === "high").length,
    medium: MOCK_ALERTS.filter((a) => a.severity === "medium").length,
    low: MOCK_ALERTS.filter((a) => a.severity === "low").length,
    total: MOCK_ALERTS.length,
  };

  // Get severity badge color
  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case "critical":
        return "bg-red-500 hover:bg-red-600";
      case "high":
        return "bg-orange-500 hover:bg-orange-600";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "low":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Get status badge styling
  const getStatusBadgeClass = (status: AlertStatus): string => {
    switch (status) {
      case "unresolved":
        return "bg-red-100 text-red-800";
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4">
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

      {/* Overview Cards */}
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
            <CardTitle className="text-sm font-medium">
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {alertCounts.critical}
            </div>
            <p className="text-xs text-gray-500">
              Requires immediate attention
            </p>
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert List (Left Column) */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Security Alerts</CardTitle>
                <div className="flex gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(value: FilterType) =>
                      setStatusFilter(value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unresolved">Unresolved</SelectItem>
                      <SelectItem value="investigating">
                        Investigating
                      </SelectItem>
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
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAlert?.id === alert.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`p-2 rounded-full ${getSeverityColor(alert.severity)} text-white`}
                          >
                            {alert.type === "intrusion" && (
                              <ShieldAlert className="h-5 w-5" />
                            )}
                            {alert.type === "anomaly" && (
                              <Thermometer className="h-5 w-5" />
                            )}
                            {alert.type === "movement" && (
                              <MapPin className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{alert.description}</h4>
                            <div className="text-sm text-gray-500 mt-1">
                              {format(alert.timestamp, "MMM d, yyyy h:mm a")} •{" "}
                              {alert.location}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusBadgeClass(alert.status)}>
                          {alert.status}
                        </Badge>
                      </div>
                      <div className="flex mt-3 space-x-2">
                        {alert.sensorData.video && (
                          <Badge variant="outline" className="text-xs">
                            <Camera className="h-3 w-3 mr-1" /> Video
                          </Badge>
                        )}
                        {alert.sensorData.vibration && (
                          <Badge variant="outline" className="text-xs">
                            <Bell className="h-3 w-3 mr-1" /> Vibration
                          </Badge>
                        )}
                        {alert.sensorData.thermal && (
                          <Badge variant="outline" className="text-xs">
                            <Thermometer className="h-3 w-3 mr-1" /> Thermal
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Details (Right Column) */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Alert Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAlert ? (
                <div className="space-y-4">
                  <div>
                    <img
                      src={selectedAlert.thumbnail}
                      alt="Alert thumbnail"
                      className="w-full rounded-lg object-cover h-40"
                    />
                  </div>

                  <div>
                    <Badge className={getSeverityColor(selectedAlert.severity)}>
                      {selectedAlert.severity.toUpperCase()}
                    </Badge>
                    <h3 className="text-lg font-medium mt-2">
                      {selectedAlert.description}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(
                        selectedAlert.timestamp,
                        "MMMM d, yyyy h:mm:ss a",
                      )}
                    </p>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Location</AlertTitle>
                    <AlertDescription>
                      {selectedAlert.location}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h4 className="font-medium">Sensor Data</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-100 p-2 rounded">
                        <div className="text-xs text-gray-500">Temperature</div>
                        <div className="font-medium">
                          {selectedAlert.sensorData.weather.temp}°C
                        </div>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <div className="text-xs text-gray-500">Weather</div>
                        <div className="font-medium">
                          {selectedAlert.sensorData.weather.conditions}
                        </div>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <div className="text-xs text-gray-500">
                          Video Confirmation
                        </div>
                        <div className="font-medium">
                          {selectedAlert.sensorData.video ? "Yes" : "No"}
                        </div>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <div className="text-xs text-gray-500">
                          Vibration Sensors
                        </div>
                        <div className="font-medium">
                          {selectedAlert.sensorData.vibration
                            ? "Triggered"
                            : "No Data"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="mr-2">View Footage</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Alert Footage</DialogTitle>
                          <DialogDescription>
                            Video footage from{" "}
                            {format(
                              selectedAlert.timestamp,
                              "MMMM d, yyyy h:mm a",
                            )}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                          <p className="text-gray-500">
                            Video player simulation would appear here
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant={
                        selectedAlert.status === "resolved"
                          ? "outline"
                          : "default"
                      }
                    >
                      {selectedAlert.status === "resolved"
                        ? "Reopen Alert"
                        : "Mark as Resolved"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-center p-8">
                  <div>
                    <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium">No Alert Selected</h3>
                    <p className="mt-1">
                      Select an alert from the list to view details
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
