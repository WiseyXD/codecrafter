import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Thermometer,
  MapPin,
  Camera,
  Bell,
  Lamp,
  Droplets,
  Car,
  HelpCircle,
} from "lucide-react";
import { AlertType, AlertCategory } from "@/lib/types";
import { getSeverityColor, getStatusBadgeClass } from "@/lib/utils";

interface AlertItemProps {
  alert: AlertType;
  isSelected: boolean;
  onSelect: () => void;
}

// Helper function to get the appropriate icon for an alert type
const getAlertTypeIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case "INTRUSION":
      return <ShieldAlert className="h-4 w-4" />;
    case "ANOMALY":
      return <Thermometer className="h-4 w-4" />;
    case "MOVEMENT":
      return <MapPin className="h-4 w-4" />;
    case "FIRE":
      return <Lamp className="h-4 w-4" />;
    case "FLOOD":
      return <Droplets className="h-4 w-4" />;
    case "TRAFFIC":
      return <Car className="h-4 w-4" />;
    case "OTHER":
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
};

export default function AlertItem({
  alert,
  isSelected,
  onSelect,
}: AlertItemProps): React.ReactNode {
  // Get the primary alert type (first in the array) for the main icon
  const primaryType =
    alert.types && alert.types.length > 0 ? alert.types[0] : "OTHER";

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? "border-blue-500 " : "hover:bg-gray-900"
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <div
            className={`p-2 rounded-full ${getSeverityColor(alert.severity)} text-white`}
          >
            {getAlertTypeIcon(primaryType!)}
          </div>
          <div>
            <h4 className="font-medium">{alert.description}</h4>
            <div className="text-sm text-gray-500 mt-1">
              {format(alert.timestamp, "MMM d, yyyy h:mm a")} • {alert.location}
            </div>
          </div>
        </div>
        <Badge className={getStatusBadgeClass(alert.status)}>
          {alert.status}
        </Badge>
      </div>

      {/* Alert type badges */}
      <div className="flex flex-wrap mt-2 gap-1">
        {alert.types.map((type, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="text-xs flex items-center"
          >
            {getAlertTypeIcon(type)}
            <span className="ml-1">
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </span>
          </Badge>
        ))}
      </div>

      {/* Sensor data badges */}
      <div className="flex mt-3 space-x-2 flex-wrap gap-1">
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
  );
}
