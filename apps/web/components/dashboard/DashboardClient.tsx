// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@repo/ui/components/ui/button";
// import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@repo/ui/components/ui/card";
// import { LogOut, AlertCircle, Loader2 } from "lucide-react";
// import type { ProfileWithReports } from "../../types";
// import { ProfileGrid } from "../profile-grid";
// import { useAmazonAuth } from "../../hooks/useAmazonAuth";

// interface DashboardClientProps {
//   initialProfiles: ProfileWithReports[];
// }

// export default function DashboardClient({
//   initialProfiles,
// }: DashboardClientProps) {
//   const router = useRouter();
//   const { logout, isLoading: isLogoutLoading, error } = useAmazonAuth();
//   const [profiles, setProfiles] =
//     useState<ProfileWithReports[]>(initialProfiles);
//   const [isLoading, setIsLoading] = useState(false);

//   const fetchProfiles = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch("/api/profiles");
//       if (!response.ok) throw new Error("Failed to fetch profiles");
//       const profiles = await response.json();
//       setProfiles(profiles);
//       if (profiles.length === 0) {
//         const response = await fetch("/api/profiles/refresh", {
//           method: "POST",
//         });
//         if (!response.ok) throw new Error("Failed to refresh profiles");
//         const refreshedProfiles = await response.json();
//         setProfiles(refreshedProfiles);
//       }
//     } catch (err) {
//       console.error("Error fetching profiles:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfiles();
//   }, []);

//   if (isLoading || isLogoutLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950">
//         <div className="flex flex-col items-center space-y-4">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//           <p className="text-sm text-zinc-600 dark:text-zinc-400">
//             Loading dashboard...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen dark:bg-zinc-950">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div className="flex-1">
//               <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
//                 Amazon Advertising Dashboard
//               </h1>
//               <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
//                 Monitor and optimize your advertising performance
//               </p>
//             </div>

//             <Button
//               variant="outline"
//               // onClick={logout}
//               disabled={isLogoutLoading}
//               className="shrink-0 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
//             >
//               {isLogoutLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Logging out...
//                 </>
//               ) : (
//                 <>
//                   <LogOut className="mr-2 h-4 w-4" />
//                   Logout disabled
//                 </>
//               )}
//             </Button>
//           </div>
//         </div>

//         {error && (
//           <Alert variant="destructive" className="mb-6">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}

//         <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
//           <CardHeader>
//             <CardTitle className="text-lg font-medium dark:text-zinc-100">
//               Advertising Profiles
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ProfileGrid profiles={profiles} onRefresh={fetchProfiles} />
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
