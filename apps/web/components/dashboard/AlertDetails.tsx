import React from "react";
import { format } from "date-fns";
import { Shield, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertType, AlertCategory } from "@/lib/types";
import { getSeverityColor } from "@/lib/utils";

interface AlertDetailsProps {
  selectedAlert: AlertType | null;
}

export default function AlertDetails({
  selectedAlert,
}: AlertDetailsProps): React.ReactNode {
  if (!selectedAlert) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Alert Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-full flex items-center justify-center text-gray-500 text-center p-8">
            <div>
              <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium">No Alert Selected</h3>
              <p className="mt-1">
                Select an alert from the list to view details
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Alert Details</CardTitle>
      </CardHeader>
      <CardContent>
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
              {format(selectedAlert.timestamp, "MMMM d, yyyy h:mm:ss a")}
            </p>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Location</AlertTitle>
            <AlertDescription>{selectedAlert.location}</AlertDescription>
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
                <div className="text-xs text-gray-500">Video Confirmation</div>
                <div className="font-medium">
                  {selectedAlert.sensorData.video ? "Yes" : "No"}
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <div className="text-xs text-gray-500">Vibration Sensors</div>
                <div className="font-medium">
                  {selectedAlert.sensorData.vibration ? "Triggered" : "No Data"}
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
                    {format(selectedAlert.timestamp, "MMMM d, yyyy h:mm a")}
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
                selectedAlert.status === "resolved" ? "outline" : "default"
              }
            >
              {selectedAlert.status === "resolved"
                ? "Reopen Alert"
                : "Mark as Resolved"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
