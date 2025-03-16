// app/alerts/[id]/page.tsx
"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AlertDetailPage from "@/components/alert/AlertPage";

export default function AlertPage() {
  return (
    <Suspense fallback={<AlertPageSkeleton />}>
      <AlertDetailPage />
    </Suspense>
  );
}

function AlertPageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="h-4 my-6">
        <Skeleton className="h-0.5 w-full" />
      </div>

      <Skeleton className="h-52 w-full" />

      <div className="h-10 grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
