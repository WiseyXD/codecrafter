import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { AlertSeverity, AlertStatus } from "./types";

// Get severity badge color
export const getSeverityColor = (severity: AlertSeverity): string => {
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
export const getStatusBadgeClass = (status: AlertStatus): string => {
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
