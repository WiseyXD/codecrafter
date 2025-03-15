// app/(protected)/dashboard/live-feed/page.tsx
"use client";

import { useEffect, useState } from "react";
import WebSocketListener from "@/components/socket/WebSocketListener";
import { useSession } from "next-auth/react";

export default function LiveFeedPage() {
  const [cityId, setCityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserCity = async () => {
      try {
        // Fetch the user's cityId - this should be an API call in a real app
        // For simplicity, I'm showing how it might look, but you should
        // implement a proper API endpoint for this
        const response = await fetch(`/api/user/city`);

        if (!response.ok) {
          throw new Error("Failed to fetch user city");
        }

        const data = await response.json();
        setCityId(data.cityId);
      } catch (err) {
        console.error("Error fetching user city:", err);
        setError("Failed to load user city information");
      } finally {
        setIsLoading(false);
      }
    };

    getUserCity();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !cityId) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">
          {error ||
            "No city assigned to this user. Please contact your administrator."}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Live Security Feed</h1>
      <WebSocketListener cityId={cityId} />
    </div>
  );
}
