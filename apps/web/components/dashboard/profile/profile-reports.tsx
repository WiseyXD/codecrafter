// // components/profile/profile-reports.tsx
// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@repo/ui/components/ui/card";
// import { Button } from "@repo/ui/components/ui/button";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@repo/ui/components/ui/tabs";
// import { AlertCircle, ArrowLeft, Download, RefreshCw } from "lucide-react";
// import Link from "next/link";

// interface ProfileWithReports {
//   profileId: string;
//   profileName: string;
//   type: string;
//   status: string;
//   currency: string;
//   account: {
//     accountName: string;
//   };
//   reports: Array<{
//     id: string;
//     name: string;
//     status: string;
//     startDate: Date;
//     endDate: Date;
//     createdAt: Date;
//     downloadUrl?: string | null;
//   }>;
// }

// interface ProfileReportsProps {
//   profile: ProfileWithReports;
// }

// export function ProfileReports({ profile }: ProfileReportsProps) {
//   const handleRefreshReport = async (reportId: string) => {
//     // Implement report refresh logic
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div className="space-y-1">
//           <div className="flex items-center gap-2">
//             <Link href="/dashboard/profiles">
//               <Button variant="ghost" size="sm">
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Back to Profiles
//               </Button>
//             </Link>
//             <h2 className="text-2xl font-bold">{profile.profileName}</h2>
//           </div>
//           <p className="text-sm text-muted-foreground">
//             Account: {profile.account.accountName}
//           </p>
//         </div>
//       </div>

//       <Tabs defaultValue="reports">
//         <TabsList>
//           <TabsTrigger value="reports">Reports</TabsTrigger>
//           <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
//           <TabsTrigger value="settings">Settings</TabsTrigger>
//         </TabsList>

//         <TabsContent value="reports" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Recent Reports</CardTitle>
//               <CardDescription>
//                 View and manage your advertising reports
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {profile.reports.map((report) => (
//                   <div
//                     key={report.id}
//                     className="flex items-center justify-between p-4 border rounded-lg"
//                   >
//                     <div className="space-y-1">
//                       <p className="font-medium">{report.name}</p>
//                       <p className="text-sm text-muted-foreground">
//                         {new Date(report.startDate).toLocaleDateString()} -{" "}
//                         {new Date(report.endDate).toLocaleDateString()}
//                       </p>
//                       <p className="text-sm">
//                         Status:{" "}
//                         <span
//                           className={
//                             report.status === "COMPLETED"
//                               ? "text-green-600"
//                               : report.status === "FAILED"
//                                 ? "text-red-600"
//                                 : "text-yellow-600"
//                           }
//                         >
//                           {report.status}
//                         </span>
//                       </p>
//                     </div>
//                     <div className="flex gap-2">
//                       {report.status === "COMPLETED" && report.downloadUrl ? (
//                         <Button size="sm" variant="outline">
//                           <Download className="h-4 w-4 mr-2" />
//                           Download
//                         </Button>
//                       ) : report.status === "FAILED" ? (
//                         <Button
//                           size="sm"
//                           onClick={() => handleRefreshReport(report.id)}
//                         >
//                           <RefreshCw className="h-4 w-4 mr-2" />
//                           Retry
//                         </Button>
//                       ) : (
//                         <Button size="sm" variant="outline" disabled>
//                           <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//                           Processing
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 ))}

//                 {profile.reports.length === 0 && (
//                   <div className="text-center py-6">
//                     <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
//                     <p className="mt-2 text-muted-foreground">
//                       No reports found
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="campaigns">
//           <Card>
//             <CardHeader>
//               <CardTitle>Campaigns</CardTitle>
//               <CardDescription>
//                 View and manage your advertising campaigns
//               </CardDescription>
//             </CardHeader>
//             <CardContent>{/* Add campaigns content here */}</CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="settings">
//           <Card>
//             <CardHeader>
//               <CardTitle>Profile Settings</CardTitle>
//               <CardDescription>
//                 Manage your profile settings and preferences
//               </CardDescription>
//             </CardHeader>
//             <CardContent>{/* Add settings content here */}</CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
