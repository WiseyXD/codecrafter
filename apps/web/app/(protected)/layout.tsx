import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log(session);
  if (!session) {
    redirect("/login");
  }
  return <div>{children}</div>;
}
