export type FilterType = "all" | AlertStatus;
export type SeverityFilterType = "all" | AlertSeverity;
export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertStatus = "unresolved" | "investigating" | "resolved";
// Updated to match Prisma's AlertType enum
export type AlertCategory =
  | "INTRUSION"
  | "ANOMALY"
  | "MOVEMENT"
  | "FIRE"
  | "FLOOD"
  | "TRAFFIC"
  | "OTHER";

export interface SensorData {
  video: boolean;
  vibration: boolean;
  thermal: boolean;
  weather: {
    temp: number;
    conditions: string;
  };
}

// WebSocket alert interface that matches the Django server output
export interface WSAlert {
  // Changed from single type to array of types
  types: string[];
  severity: string;
  timestamp: string;
  location: string;
  description: string;
  status: string;
  thumbnail?: string;
  sensorData?: {
    video: boolean;
    vibration: boolean;
    thermal: boolean;
    weather: {
      temp: number;
      conditions: string;
    };
  };
}

// Updated AlertType interface to support multiple alert types
export interface AlertType {
  id: string;
  // Changed from single type to array of types
  types: AlertCategory[];
  severity: AlertSeverity;
  timestamp: Date;
  location: string;
  description: string;
  sensorData: SensorData;
  status: AlertStatus;
  thumbnail: string;
}

// For backward compatibility with existing code that uses Alert
export interface Alert {
  id: string;
  // Changed from single type to array of types
  types: AlertCategory[];
  severity: AlertSeverity;
  timestamp: Date;
  location: string;
  description: string;
  sensorData: SensorData;
  status: AlertStatus;
  thumbnail: string;
}

export interface AlertCountsType {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

// Updated mock data to use multiple alert types
export const MOCK_ALERTS: AlertType[] = [
  {
    id: "alert-001",
    types: ["INTRUSION", "MOVEMENT"],
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
    types: ["ANOMALY"],
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
    types: ["MOVEMENT"],
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
    types: ["INTRUSION", "ANOMALY"],
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
    types: ["ANOMALY", "TRAFFIC"],
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

export interface DashboardState {
  selectedAlert: Alert | null;
  statusFilter: FilterType;
  severityFilter: SeverityFilterType;
}

export interface ZoneStatus {
  id: string;
  name: string;
  status: "active" | "inactive" | "maintenance";
}

// Updated conversion function to handle array of types
export function convertWSAlertToAlert(
  wsAlert: WSAlert,
  id?: string,
): AlertType {
  return {
    id: id || `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    types: wsAlert.types?.map((type) => validateAlertCategory(type)) || [
      "MOVEMENT",
    ],
    severity: validateAlertSeverity(wsAlert.severity),
    timestamp: new Date(wsAlert.timestamp),
    location: wsAlert.location,
    description: wsAlert.description,
    status: validateAlertStatus(wsAlert.status || "unresolved"),
    thumbnail: wsAlert.thumbnail || "/api/placeholder/300/200",
    sensorData: wsAlert.sensorData || {
      video: false,
      vibration: false,
      thermal: false,
      weather: {
        temp: 0,
        conditions: "Unknown",
      },
    },
  };
}

// Helper functions to validate enum-like types (updated to match Prisma's enum case)
function validateAlertCategory(type: string): AlertCategory {
  const validTypes: AlertCategory[] = [
    "INTRUSION",
    "ANOMALY",
    "MOVEMENT",
    "FIRE",
    "FLOOD",
    "TRAFFIC",
    "OTHER",
  ];
  return validTypes.includes(type as AlertCategory)
    ? (type as AlertCategory)
    : "MOVEMENT";
}

function validateAlertSeverity(severity: string): AlertSeverity {
  const validSeverities: AlertSeverity[] = [
    "critical",
    "high",
    "medium",
    "low",
  ];
  return validSeverities.includes(severity as AlertSeverity)
    ? (severity as AlertSeverity)
    : "low";
}

function validateAlertStatus(status: string): AlertStatus {
  const validStatuses: AlertStatus[] = [
    "unresolved",
    "investigating",
    "resolved",
  ];
  return validStatuses.includes(status as AlertStatus)
    ? (status as AlertStatus)
    : "unresolved";
}

// Rest of the types remain the same
export type ZonePriority = "low" | "medium" | "high";

export interface SecurityZone {
  id: string;
  name: string;
  description: string;
  priority: ZonePriority;
}

export type MonitoringHours = "24/7" | "business" | "night" | "custom";
export type InitialSensors = "3" | "5" | "10" | "custom";
export type NotificationType = "email" | "sms" | "both";

export interface OnboardingFormData {
  cityName: string;
  region: string;
  country: string;
  population: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminDepartment: string;
  securityZones: SecurityZone[];
  initialSensors: InitialSensors;
  monitoringHours: MonitoringHours;
  agreeToTerms: boolean;
  notificationType: NotificationType;
}

export interface FormErrors {
  cityName?: string;
  country?: string;
  adminName?: string;
  adminEmail?: string;
  adminDepartment?: string;
  securityZones?: string;
  agreeToTerms?: string;
  [key: string]: string | undefined;
}

export type FormStep = 0 | 1 | 2 | 3 | 4;

export interface OnboardingResponse {
  success: boolean;
  message: string;
  data?: {
    cityId: string;
    zoneCount: number;
    isOnboarded: boolean;
  };
  error?: string;
  details?: any;
}
