export type SensorDataType = {
  video: boolean;
  vibration: boolean;
  thermal: boolean;
  weather: {
    temp: number;
    conditions: string;
  };
};

export type AlertType =
  | "intrusion"
  | "anomaly"
  | "movement"
  | "fire"
  | "flood"
  | "traffic"
  | "other";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type AlertStatus = "unresolved" | "investigating" | "resolved";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  timestamp: Date;
  location: string;
  description: string;
  sensorData: SensorDataType;
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

export type FilterType = "all" | AlertStatus;
export type SeverityFilterType = "all" | AlertSeverity;

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

// types/onboarding.ts

// Security zone priority levels
export type ZonePriority = "low" | "medium" | "high";

// Security zone definition
export interface SecurityZone {
  id: string;
  name: string;
  description: string;
  priority: ZonePriority;
}

// Monitoring hours options
export type MonitoringHours = "24/7" | "business" | "night" | "custom";

// Initial sensors per zone options
export type InitialSensors = "3" | "5" | "10" | "custom";

// Notification preferences
export type NotificationType = "email" | "sms" | "both";

// Form data structure
export interface OnboardingFormData {
  // City Information
  cityName: string;
  region: string;
  country: string;
  population: string;

  // Admin Information
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminDepartment: string;

  // System Configuration
  securityZones: SecurityZone[];
  initialSensors: InitialSensors;
  monitoringHours: MonitoringHours;

  // Confirmation
  agreeToTerms: boolean;
  notificationType: NotificationType;
}

// Form errors structure - matches form fields that require validation
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

// Form steps
export type FormStep = 0 | 1 | 2 | 3 | 4;

// API response for onboarding
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
