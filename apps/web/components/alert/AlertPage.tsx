// components/AlertDetail.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ShieldAlert,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Activity,
  Thermometer,
  Video,
  BarChart4,
} from "lucide-react";
import { format } from "date-fns";
import AlertStatusDialog from "./AlertStatusDialog";

// Placeholder for recharts components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

// Types based on your Prisma schema
import type {
  Alert as AlertType,
  Severity,
  AlertStatus,
  AlertType as AlertTypeEnum,
  Status,
  SensorType,
  Zone,
  City,
  Sensor,
  SensorData,
  Action,
} from "@prisma/client";
import SensorGauge from "./SensorGauge";

// Extended types for the component
type FullAlertType = AlertType & {
  zone: Zone;
  city: City;
  sensors: Sensor[];
  sensorData: SensorData[];
  actions: Action[];
};

type ChartDataPoint = {
  timestamp: number;
  formattedTime: string;
  [key: string]: any;
};

const getSeverityColor = (severity: Severity): string => {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-100 text-red-800 border-red-800";
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-800";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-800";
    case "LOW":
      return "bg-blue-100 text-blue-800 border-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: AlertStatus): string => {
  switch (status) {
    case "UNRESOLVED":
      return "bg-red-100 text-red-800";
    case "INVESTIGATING":
      return "bg-yellow-100 text-yellow-800";
    case "RESOLVED":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getAlertTypeIcon = (type: AlertTypeEnum) => {
  switch (type) {
    case "INTRUSION":
      return <ShieldAlert className="h-5 w-5" />;
    case "ANOMALY":
      return <AlertTriangle className="h-5 w-5" />;
    case "MOVEMENT":
      return <Activity className="h-5 w-5" />;
    case "FIRE":
      return <Thermometer className="h-5 w-5" />;
    case "FLOOD":
      return <BarChart4 className="h-5 w-5" />;
    case "TRAFFIC":
      return <Video className="h-5 w-5" />;
    case "OTHER":
      return <Bell className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const AlertDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;

  const [alert, setAlert] = useState<FullAlertType | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("24h");

  useEffect(() => {
    const fetchAlertDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch data from our API endpoint
        const response = await fetch(`/api/alerts/${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load alert details");
        }

        const alertData = (await response.json()) as FullAlertType;

        setAlert(alertData);
        setSensorData(alertData.sensorData);
        setActions(alertData.actions);
      } catch (err) {
        console.error("Error fetching alert details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load alert details",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAlertDetails();
    }
  }, [id]);

  // Function to process sensor data for charts
  const processChartData = (): ChartDataPoint[] => {
    if (!sensorData?.length) return [];

    // Group data by sensor and timestamp for chart display
    const chartData = sensorData.map((data) => {
      return {
        timestamp: new Date(data.timestamp).getTime(),
        formattedTime: format(new Date(data.timestamp), "HH:mm:ss"),
        ...(data.dataValue as Record<string, any>),
      };
    });

    return chartData.sort((a, b) => a.timestamp - b.timestamp);
  };

  const chartData = processChartData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading alert details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!alert) {
    return (
      <Alert>
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>Alert could not be found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Alert Details</h1>
          <p className="text-gray-500">
            Detailed information about alert #{id.substring(0, 8)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Alerts
          </Button>
          {alert.status !== "RESOLVED" && (
            <AlertStatusDialog
              alertId={id}
              currentStatus={alert.status}
              onStatusUpdate={(updatedAlert) => {
                setAlert((prev) =>
                  prev ? { ...prev, status: updatedAlert.status } : null,
                );
              }}
            />
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Alert Header Card */}
      <Card
        className="overflow-hidden border-l-4"
        style={{
          borderLeftColor:
            alert.severity === "CRITICAL"
              ? "#EF4444"
              : alert.severity === "HIGH"
                ? "#F97316"
                : alert.severity === "MEDIUM"
                  ? "#EAB308"
                  : "#3B82F6",
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              {alert.types.map((type, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  {getAlertTypeIcon(type)}
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                  {idx < alert.types.length - 1 ? " + " : ""}
                </span>
              ))}
            </CardTitle>
            <Badge className={getStatusColor(alert.status)}>
              {alert.status}
            </Badge>
          </div>
          <CardDescription className="flex items-center space-x-4 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(alert.timestamp), "PPP p")}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {alert.location}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Severity</p>
              <Badge className={`mt-1 ${getSeverityColor(alert.severity)}`}>
                {alert.severity}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Zone</p>
              <p className="mt-1">{alert.zone.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">City</p>
              <p className="mt-1">
                {alert.city.name}, {alert.city.country}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="mt-1">{alert.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sensor-data">Sensor Data</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sensors Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Sensors Involved</CardTitle>
                <CardDescription>
                  Sensors that triggered or are related to this alert
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alert.sensors.map((sensor) => (
                    <div key={sensor.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{sensor.name}</h3>
                        <Badge>{sensor.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {sensor.location}
                      </p>
                      <div className="flex items-center mt-2">
                        <Badge
                          variant="outline"
                          className={
                            sensor.status === "ACTIVE"
                              ? "text-green-600 border-green-600"
                              : "text-gray-600"
                          }
                        >
                          {sensor.status}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {alert.sensors.length === 0 && (
                    <p className="text-gray-500">
                      No sensors linked to this alert.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions taken on this alert
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {actions.slice(0, 3).map((action) => (
                    <div
                      key={action.id}
                      className="flex items-start space-x-3 p-3 border-b last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{action.actionType}</p>
                        <p className="text-sm text-gray-500">
                          {action.description}
                        </p>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {format(new Date(action.timestamp), "PPp")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {action.performedBy || "System"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {actions.length === 0 && (
                    <p className="text-gray-500">No actions recorded yet.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  View All Activities
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Thumbnail if available */}
          {alert.thumbnail && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Alert Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img
                    src={alert.thumbnail}
                    alt="Alert Snapshot"
                    className="max-h-96 object-contain rounded-md"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sensor Data Tab */}
        <TabsContent value="sensor-data" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Sensor Readings</CardTitle>
                <Select
                  value={selectedTimePeriod}
                  onValueChange={setSelectedTimePeriod}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="6h">Last 6 Hours</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                Latest data readings from sensors related to this alert
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="space-y-6">
                  {/* Sensor Gauges */}
                  <div>
                    <p className="font-medium mb-2">Current Sensor Readings</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                      {alert.sensors.map((sensor) => {
                        // Get the latest data for this sensor
                        const latestData = sensorData.find(
                          (d) => d.sensorId === sensor.id,
                        );
                        if (!latestData) return null;

                        // Extract a relevant value based on sensor type
                        let value: number,
                          min: number,
                          max: number,
                          unit: string;
                        const dataValue = latestData.dataValue as Record<
                          string,
                          any
                        >;

                        switch (sensor.type) {
                          case "THERMAL":
                            value = dataValue.temperature || 0;
                            min = 0;
                            max = 100;
                            unit = "°C";
                            break;
                          case "VIBRATION":
                            value = dataValue.intensity || 0;
                            min = 0;
                            max = 10;
                            unit = "Hz";
                            break;
                          case "AUDIO":
                            value = dataValue.decibels || 0;
                            min = 0;
                            max = 120;
                            unit = "dB";
                            break;
                          case "MOTION":
                            value = dataValue.movement || 0;
                            min = 0;
                            max = 100;
                            unit = "%";
                            break;
                          default:
                            value = dataValue.value || 0;
                            min = 0;
                            max = 100;
                            unit = "";
                        }

                        return (
                          <Card key={sensor.id} className="p-4">
                            <h3 className="text-sm font-medium mb-2">
                              {sensor.name}
                            </h3>
                            <SensorGauge
                              value={value}
                              min={min}
                              max={max}
                              title={sensor.type}
                              unit={unit}
                              color="auto"
                            />
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                  {/* Sensor Data Visualization - Line Chart */}
                  <div className="h-72">
                    <p className="font-medium mb-2">Sensor Activity Trend</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="formattedTime"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {chartData.length > 0 &&
                          (() => {
                            // Get the first data point or use an empty object as fallback
                            const firstDataPoint: Record<string, any> =
                              chartData[0] || {};

                            // Now we can safely get the keys
                            return Object.keys(firstDataPoint)
                              .filter(
                                (key) =>
                                  !["timestamp", "formattedTime"].includes(key),
                              )
                              .map((key, index) => (
                                <Line
                                  key={key}
                                  type="monotone"
                                  dataKey={key}
                                  stroke={`hsl(${index * 30}, 70%, 50%)`}
                                  activeDot={{ r: 8 }}
                                />
                              ));
                          })()}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Sensor Data Table */}
                  <div>
                    <p className="font-medium mb-2">Raw Sensor Data</p>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Sensor</TableHead>
                            <TableHead>Data Values</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sensorData.slice(0, 10).map((data) => (
                            <TableRow key={data.id}>
                              <TableCell>
                                {format(new Date(data.timestamp), "PPp")}
                              </TableCell>
                              <TableCell>
                                {alert.sensors.find(
                                  (s) => s.id === data.sensorId,
                                )?.name || data.sensorId}
                              </TableCell>
                              <TableCell>
                                <pre className="text-xs overflow-x-auto">
                                  {JSON.stringify(data.dataValue, null, 2)}
                                </pre>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">
                    No sensor data available
                  </h3>
                  <p className="mt-2 text-gray-500">
                    This alert doesn't have any associated sensor data records.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Actions Taken</CardTitle>
              <CardDescription>
                History of all actions taken in response to this alert
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actions.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Action Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Performed By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {actions.map((action) => (
                        <TableRow key={action.id}>
                          <TableCell>
                            {format(new Date(action.timestamp), "PPp")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{action.actionType}</Badge>
                          </TableCell>
                          <TableCell>{action.description}</TableCell>
                          <TableCell>
                            {action.performedBy || "System"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">
                    No actions recorded
                  </h3>
                  <p className="mt-2 text-gray-500">
                    No actions have been taken for this alert yet.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full">Add New Action</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Severity Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Alert Severity Analysis
                </CardTitle>
                <CardDescription>
                  Distribution of alerts by severity in this zone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Critical", count: 5 },
                        { name: "High", count: 12 },
                        { name: "Medium", count: 18 },
                        { name: "Low", count: 9 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Response Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Response Time Analysis
                </CardTitle>
                <CardDescription>
                  Average time to resolve alerts by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { name: "INTRUSION", time: 45 },
                        { name: "ANOMALY", time: 36 },
                        { name: "MOVEMENT", time: 28 },
                        { name: "FIRE", time: 15 },
                        { name: "FLOOD", time: 33 },
                        { name: "TRAFFIC", time: 42 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis
                        label={{
                          value: "Minutes",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="time"
                        fill="#F59E0B"
                        stroke="#F59E0B"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertDetailPage;
