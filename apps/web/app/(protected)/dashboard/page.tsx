import React from "react";
import DashboardComponent from "@/components/dashboard/DashboardClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  const isOnboarded = session?.user?.isOnboarded;

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  return <DashboardComponent />;
}
