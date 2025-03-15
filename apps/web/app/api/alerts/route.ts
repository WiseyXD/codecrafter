// app/api/alerts/route.js

import { NextRequest, NextResponse } from "next/server";

// In a real implementation, this would connect to your database
// or surveillance system's API to fetch real-time alerts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");
  const timeframe = searchParams.get("timeframe") || "24h";

  // Mock data for demonstration
  const alerts = [
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
    // ... more alerts would be here
  ];

  // Filter the alerts based on query parameters
  let filteredAlerts = [...alerts];

  if (status) {
    filteredAlerts = filteredAlerts.filter((alert) => alert.status === status);
  }

  if (severity) {
    filteredAlerts = filteredAlerts.filter(
      (alert) => alert.severity === severity,
    );
  }

  // Apply timeframe filter
  const now = new Date();
  let timeLimit = new Date();

  switch (timeframe) {
    case "1h":
      timeLimit.setHours(now.getHours() - 1);
      break;
    case "6h":
      timeLimit.setHours(now.getHours() - 6);
      break;
    case "24h":
      timeLimit.setHours(now.getHours() - 24);
      break;
    case "7d":
      timeLimit.setDate(now.getDate() - 7);
      break;
    default:
      timeLimit.setHours(now.getHours() - 24);
  }

  filteredAlerts = filteredAlerts.filter(
    (alert) => new Date(alert.timestamp) >= timeLimit,
  );

  // Return the filtered alerts
  return NextResponse.json({
    alerts: filteredAlerts,
    meta: {
      total: filteredAlerts.length,
      timeframe,
      generated: new Date().toISOString(),
    },
  });
}
