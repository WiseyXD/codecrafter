// app/api/alerts/route.js

import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
import {
  AlertType as PrismaAlertType,
  Severity,
  AlertStatus as PrismaAlertStatus,
} from "@prisma/client";
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

// Map WebSocket alert type to database AlertType enum
const mapAlertType = (type: string): PrismaAlertType => {
  const typeMap: Record<string, PrismaAlertType> = {
    movement: PrismaAlertType.MOVEMENT,
    intrusion: PrismaAlertType.INTRUSION,
    anomaly: PrismaAlertType.ANOMALY,
    fire: PrismaAlertType.FIRE,
    flood: PrismaAlertType.FLOOD,
    traffic: PrismaAlertType.TRAFFIC,
  };
  return typeMap[type.toLowerCase()] || PrismaAlertType.OTHER;
};

// Map WebSocket severity to database Severity enum
const mapSeverity = (severity: string): Severity => {
  const severityMap: Record<string, Severity> = {
    critical: Severity.CRITICAL,
    high: Severity.HIGH,
    medium: Severity.MEDIUM,
    low: Severity.LOW,
  };
  return severityMap[severity.toLowerCase()] || Severity.LOW;
};

// Map WebSocket status to database AlertStatus enum
const mapAlertStatus = (status: string): PrismaAlertStatus => {
  const statusMap: Record<string, PrismaAlertStatus> = {
    unresolved: PrismaAlertStatus.UNRESOLVED,
    investigating: PrismaAlertStatus.INVESTIGATING,
    resolved: PrismaAlertStatus.RESOLVED,
  };
  return statusMap[status.toLowerCase()] || PrismaAlertStatus.UNRESOLVED;
};

// Function to find or create a sensor
async function findOrCreateSensor(
  location: string,
  zoneId: string,
  cityId: string,
): Promise<string> {
  // Try to find an existing sensor with this location
  const existingSensor = await prisma.sensor.findFirst({
    where: {
      location: {
        contains: location,
        mode: "insensitive",
      },
      zoneId,
      cityId,
    },
  });

  if (existingSensor) {
    return existingSensor.id;
  }

  // If no sensor exists, create a new one
  const sensorType = determineSensorType(location);

  const newSensor = await prisma.sensor.create({
    data: {
      name: `Sensor at ${location}`,
      type: sensorType,
      status: "ACTIVE",
      location,
      description: `Automatically created sensor for ${location}`,
      zoneId,
      cityId,
    },
  });

  return newSensor.id;
}

// Helper function to determine sensor type based on location name
function determineSensorType(location: string) {
  const locationLower = location.toLowerCase();

  if (locationLower.includes("camera") || locationLower.includes("video")) {
    return "VIDEO";
  }
  if (locationLower.includes("thermal")) {
    return "THERMAL";
  }
  if (locationLower.includes("motion")) {
    return "MOTION";
  }
  if (locationLower.includes("vibration")) {
    return "VIBRATION";
  }
  if (locationLower.includes("audio")) {
    return "AUDIO";
  }
  if (locationLower.includes("weather")) {
    return "WEATHER";
  }

  // Default to VIDEO as fallback
  return "VIDEO";
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Extract required fields
    const { alert, zoneId, cityId } = data;

    if (!alert || !zoneId || !cityId) {
      return NextResponse.json(
        { error: "Missing required fields: alert, zoneId, or cityId" },
        { status: 400 },
      );
    }

    // Find or create a sensor based on the alert location
    const sensorId = await findOrCreateSensor(alert.location, zoneId, cityId);

    // Map the WebSocket alert to the database Alert schema
    const createdAlert = await prisma.alert.create({
      data: {
        type: mapAlertType(alert.type),
        severity: mapSeverity(alert.severity),
        timestamp: new Date(alert.timestamp),
        location: alert.location,
        description: alert.description,
        status: mapAlertStatus(alert.status || "unresolved"),
        thumbnail: alert.thumbnail || "/api/placeholder/300/200",
        zoneId: zoneId,
        cityId: cityId,
        // Connect this alert to the sensor
        sensors: {
          connect: {
            id: sensorId,
          },
        },
      },
    });

    // If there's sensor data, store it in the SensorData table
    if (alert.sensorData) {
      await prisma.sensorData.create({
        data: {
          sensorId: sensorId,
          dataValue: alert.sensorData,
          alertId: createdAlert.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      alertId: createdAlert.id,
      timestamp: createdAlert.timestamp,
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
