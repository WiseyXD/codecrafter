// app/api/alerts/route.ts

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
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const timeframe = searchParams.get("timeframe") || "24h";
    const cityId = searchParams.get("cityId");
    const zoneId = searchParams.get("zoneId");
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;

    // Build where conditions for Prisma query
    const whereConditions: any = {};

    // Add cityId filter if provided
    if (cityId) {
      whereConditions.cityId = cityId;
    }

    // Add zoneId filter if provided
    if (zoneId) {
      whereConditions.zoneId = zoneId;
    }

    // Add status filter if provided
    if (status && status !== "all") {
      whereConditions.status = status.toUpperCase() as PrismaAlertStatus;
    }

    // Add severity filter if provided
    if (severity && severity !== "all") {
      whereConditions.severity = severity.toUpperCase() as Severity;
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
      case "30d":
        timeLimit.setDate(now.getDate() - 30);
        break;
      case "all":
        // Don't set a time limit
        break;
      default:
        timeLimit.setHours(now.getHours() - 24);
    }

    // Only add timestamp condition if not querying all timeframes
    if (timeframe !== "all") {
      whereConditions.timestamp = {
        gte: timeLimit,
      };
    }

    // Get alerts count with these filters
    const totalCount = await prisma.alert.count({
      where: whereConditions,
    });

    // Fetch alerts from database with pagination
    const alerts = await prisma.alert.findMany({
      where: whereConditions,
      include: {
        sensors: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        sensorData: {
          select: {
            dataValue: true,
          },
          take: 1, // Just get the most recent sensor data
          orderBy: {
            timestamp: "desc",
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Transform database alerts to match the expected format for the frontend
    const transformedAlerts = alerts.map((alert) => {
      // Extract sensor data or use default values
      const sensorDataRaw = (alert.sensorData[0]?.dataValue as any) || {};

      // Convert to expected frontend format
      return {
        id: alert.id,
        types: alert.types as string[],
        severity: alert.severity.toLowerCase(),
        timestamp: alert.timestamp,
        location: alert.location,
        description: alert.description,
        status: alert.status.toLowerCase(),
        thumbnail: alert.thumbnail || "/api/placeholder/300/200",
        sensorData: {
          video:
            sensorDataRaw.video === true ||
            alert.sensors.some((s) => s.type === "VIDEO"),
          vibration:
            sensorDataRaw.vibration === true ||
            alert.sensors.some((s) => s.type === "VIBRATION"),
          thermal:
            sensorDataRaw.thermal === true ||
            alert.sensors.some((s) => s.type === "THERMAL"),
          weather: sensorDataRaw.weather || {
            temp: 0,
            conditions: "Unknown",
          },
        },
      };
    });

    // Return the alerts with pagination metadata
    return NextResponse.json({
      alerts: transformedAlerts,
      meta: {
        total: totalCount,
        offset,
        limit,
        timeframe,
        generated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        alerts: [],
        meta: {
          total: 0,
          generated: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
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
    other: PrismaAlertType.OTHER,
    violence: PrismaAlertType.VIOLENCE,
    crowded: PrismaAlertType.CROWDED,
    none: PrismaAlertType.NONE,
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

    // Handle incoming alert types
    let alertTypes: string[] = [];

    // Check if the alert has types array
    if (alert.types && Array.isArray(alert.types)) {
      alertTypes = alert.types;
    }
    // Check for legacy single type field
    else if (alert.type) {
      alertTypes = [alert.type];
    }
    // Default to OTHER if no type information is found
    else {
      alertTypes = ["OTHER"];
    }

    // Map string types to PrismaAlertType enum values
    const mappedTypes = alertTypes.map((type) => mapAlertType(type));

    // Create the alert with multiple types
    const createdAlert = await prisma.alert.create({
      data: {
        types: mappedTypes,
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
