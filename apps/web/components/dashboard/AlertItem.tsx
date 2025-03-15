import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Thermometer, MapPin, Camera, Bell } from "lucide-react";
import { AlertType, AlertCategory } from "@/lib/types";
import { getSeverityColor, getStatusBadgeClass } from "@/lib/utils";

interface AlertItemProps {
  alert: AlertType;
  isSelected: boolean;
  onSelect: () => void;
}

export default function AlertItem({
  alert,
  isSelected,
  onSelect,
}: AlertItemProps): React.ReactNode {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? "border-blue-500 bg-blue-50" : "hover:bg-gray-400"
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <div
            className={`p-2 rounded-full ${getSeverityColor(alert.severity)} text-white`}
          >
            {alert.type === "intrusion" && <ShieldAlert className="h-5 w-5" />}
            {alert.type === "anomaly" && <Thermometer className="h-5 w-5" />}
            {alert.type === "movement" && <MapPin className="h-5 w-5" />}
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
  );
}
