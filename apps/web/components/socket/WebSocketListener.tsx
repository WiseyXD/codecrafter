"use client";

import { WSAlert, AlertType, convertWSAlertToAlert } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

type WebSocketMessage = {
  type: string;
  message?: string;
  data?: WSAlert;
  error?: string;
};

const WebSocketListener = ({ cityId }: { cityId: string }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isStoringToDB, setIsStoringToDB] = useState(true);
  const [defaultZoneId, setDefaultZoneId] = useState<string | null>(null);
  const [isLoadingZone, setIsLoadingZone] = useState(false);
  const [isStoringAlert, setIsStoringAlert] = useState(false);

  // Replace with your Django WebSocket server URL
  const WS_URL = "wss://1826-103-218-100-74.ngrok-free.app/ws/";

  // Backup URL in case the main one fails
  const BACKUP_WS_URL = "ws://localhost:8000/ws/random/";

  const [currentUrl, setCurrentUrl] = useState(WS_URL);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Fetch default zone ID from API
  const fetchDefaultZone = async () => {
    if (!cityId) {
      setIsStoringToDB(false);
      toast.error("No city ID provided. Database storage disabled.");
      return null;
    }

    setIsLoadingZone(true);

    try {
      const response = await fetch(`/api/zones/default?cityId=${cityId}`, {
        cache: "no-store", // Make sure we don't get a cached response
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Unknown error");
      }

      // Explicitly set the zone ID in state
      const zoneId = data.zoneId;
      setDefaultZoneId(zoneId);

      if (data.isNew) {
        toast.success(`Created new zone "${data.name}" for this city`);
      } else {
        toast.success(`Using existing zone "${data.name}"`);
      }

      return zoneId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Failed to fetch zone:", error);
      toast.error(`Could not get zone: ${errorMessage}`);
      setIsStoringToDB(false);
      return null;
    } finally {
      setIsLoadingZone(false);
    }
  };

  // Store an alert using the API
  const storeAlertToDB = async (wsAlert: WSAlert) => {
    if (!isStoringToDB) {
      return;
    }

    let zoneIdToUse = defaultZoneId;

    if (!zoneIdToUse) {
      const fetchedZoneId = await fetchDefaultZone();
      zoneIdToUse = fetchedZoneId;

      if (!zoneIdToUse) {
        return;
      }
    }

    setIsStoringAlert(true);

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alert: wsAlert,
          zoneId: zoneIdToUse,
          cityId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Unknown error");
      }

      toast.success("Alert stored to database", {
        id: "db-success",
        duration: 2000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Failed to store alert to database:", error);
      toast.error(`DB Error: ${errorMessage}`, { id: "db-error" });
    } finally {
      setIsStoringAlert(false);
    }
  };

  // Get or update zone when cityId changes
  useEffect(() => {
    // Reset zone ID when city changes
    setDefaultZoneId(null);

    // Fetch zone for this city
    if (cityId) {
      fetchDefaultZone();
    }
  }, [cityId]);

  const connectWebSocket = () => {
    // Increment connection attempts
    setConnectionAttempts((prev) => prev + 1);

    // Try alternate URL after 3 attempts
    if (connectionAttempts >= 3 && currentUrl === WS_URL) {
      setCurrentUrl(BACKUP_WS_URL);
      //@ts-ignore
      toast.info("Trying alternate connection URL...");
    }

    let ws;
    try {
      ws = new WebSocket(currentUrl);
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      toast.error("Failed to create WebSocket connection");
      return null;
    }

    ws.onopen = () => {
      setIsConnected(true);
      toast.success("Connected to WebSocket server");
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      toast.error(
        `Disconnected: ${event.code} ${event.reason || "Connection closed"}`,
      );

      // Try to reconnect after a delay
      setTimeout(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          connectWebSocket();
        }
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);

      // Check if we're using ngrok with secure context
      if (window.location.protocol === "https:" && WS_URL.startsWith("ws://")) {
        toast.error(
          "Connection failed: Trying to connect to ws:// from https://. Try using wss:// instead.",
        );
      } else {
        toast.error("WebSocket connection error - check console for details");
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        // Handle connection message
        if (message.type === "connection_established") {
          toast.success(message.message || "Connection established");
        }

        // Handle alerts
        else if (message.type === "alert" && message.data) {
          const wsAlert = message.data;

          // Explicitly check if data has the expected structure
          if (!wsAlert.type || !wsAlert.severity || !wsAlert.location) {
            return;
          }

          // Store the raw alert to database
          if (isStoringToDB) {
            storeAlertToDB(wsAlert);
          }

          // Convert to properly typed AlertType for the UI
          const typedAlert = convertWSAlertToAlert(wsAlert);

          // Add the alert to state
          setAlerts((prev) => [typedAlert, ...prev].slice(0, 50));

          // Create toast notification with appropriate style based on severity
          const toastContent = (
            <div>
              <strong>{typedAlert.type}</strong>: {typedAlert.description}
              <div className="text-sm text-gray-500">{typedAlert.location}</div>
            </div>
          );

          // Use different toast styles based on severity
          switch (typedAlert.severity) {
            case "critical":
              toast.error(toastContent, { duration: 5000 });
              break;
            case "high":
              toast.error(toastContent, { duration: 4000 });
              break;
            case "medium":
              //@ts-ignore
              toast.warning(toastContent);
              break;
            case "low":
            default:
              toast(toastContent);
              break;
          }
        }

        // Handle errors
        else if (message.type === "error") {
          toast.error(message.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    setSocket(ws);
    return ws;
  };

  useEffect(() => {
    // Connect to WebSocket when component mounts or currentUrl changes
    const ws = connectWebSocket();

    // Clean up on unmount
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [currentUrl]);

  return (
    <div className="p-4">
      <Toaster position="top-right" />

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span>
            {isConnected ? "Connected to WebSocket Server" : "Disconnected"}
          </span>

          {!isConnected && (
            <button
              onClick={() => {
                setConnectionAttempts(0);
                connectWebSocket();
              }}
              className="ml-4 bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Reconnect
            </button>
          )}
        </div>

        <div className="text-sm text-gray-600 mt-1">
          <div>Current URL: {currentUrl}</div>
          <div>Connection attempts: {connectionAttempts}</div>
          <div>City ID: {cityId || "None"}</div>
          <div className="flex items-center">
            <span>Zone ID: </span>
            {isLoadingZone ? (
              <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></span>
            ) : defaultZoneId ? (
              <span className="ml-1">{defaultZoneId}</span>
            ) : (
              <span className="ml-1 text-red-500">Not available</span>
            )}

            {!isLoadingZone && (
              <button
                onClick={() => fetchDefaultZone()}
                className="ml-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                disabled={isLoadingZone}
              >
                Refresh
              </button>
            )}
          </div>
          <div className="flex items-center">
            <span>DB Storage: </span>
            <span className="ml-1">
              {isStoringToDB ? (
                <span className="text-green-600 font-medium">Enabled</span>
              ) : (
                <span className="text-red-600 font-medium">Disabled</span>
              )}
            </span>
            {isStoringAlert && (
              <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></span>
            )}
          </div>

          <div className="flex mt-2">
            {!isConnected && connectionAttempts > 0 && (
              <button
                onClick={() => {
                  setCurrentUrl(currentUrl === WS_URL ? BACKUP_WS_URL : WS_URL);
                  setConnectionAttempts(0);
                }}
                className="mr-2 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
              >
                Try {currentUrl === WS_URL ? "localhost" : "ngrok"} URL
              </button>
            )}

            <button
              onClick={() => setIsStoringToDB(!isStoringToDB)}
              className={`mr-2 px-3 py-1 rounded text-sm ${
                isStoringToDB
                  ? "bg-red-100 hover:bg-red-200 text-red-700"
                  : "bg-green-100 hover:bg-green-200 text-green-700"
              }`}
              disabled={isStoringAlert}
            >
              {isStoringToDB ? "Disable DB Storage" : "Enable DB Storage"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">
          Recent Alerts ({alerts.length})
        </h2>
        {alerts.length === 0 ? (
          <p className="text-gray-500">No alerts received yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  alert.severity === "critical"
                    ? "border-red-500 bg-red-50"
                    : alert.severity === "high"
                      ? "border-orange-500 bg-orange-50"
                      : alert.severity === "medium"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-blue-500 bg-blue-50"
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-bold">
                    {alert.type} ({alert.severity})
                  </span>
                  <span className="text-sm text-gray-500">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p>{alert.description}</p>
                <div className="text-sm">{alert.location}</div>
                {alert.sensorData && (
                  <div className="text-xs text-gray-600 mt-1">
                    Temp: {alert.sensorData.weather.temp}°C, Conditions:{" "}
                    {alert.sensorData.weather.conditions}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSocketListener;
