// lib/services/sensor-service.ts
import { SensorType } from "@prisma/client";
import prisma from "@repo/db";

// Function to find or create a sensor based on alert location
export const findOrCreateSensor = async (
  location: string,
  zoneId: string,
  cityId: string,
): Promise<string> => {
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
  const newSensor = await prisma.sensor.create({
    data: {
      name: `Sensor at ${location}`,
      type: determineSensorType(location),
      status: "ACTIVE",
      location,
      description: `Automatically created sensor for ${location}`,
      zoneId,
      cityId,
    },
  });

  return newSensor.id;
};

// Helper function to determine sensor type based on location name
const determineSensorType = (location: string): SensorType => {
  const locationLower = location.toLowerCase();

  if (locationLower.includes("camera") || locationLower.includes("video")) {
    return SensorType.VIDEO;
  }
  if (locationLower.includes("thermal")) {
    return SensorType.THERMAL;
  }
  if (locationLower.includes("motion")) {
    return SensorType.MOTION;
  }
  if (locationLower.includes("vibration")) {
    return SensorType.VIBRATION;
  }
  if (locationLower.includes("audio")) {
    return SensorType.AUDIO;
  }
  if (locationLower.includes("weather")) {
    return SensorType.WEATHER;
  }

  // Default to VIDEO as fallback
  return SensorType.VIDEO;
};
