"use client";
import { useSession } from "next-auth/react";
import React from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const handleConnectHono = async () => {
    try {
      const resp = await fetch("/api/connect-hono");
      const data = await resp.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      User here with the user name - {session?.user?.name}
      <div>
        <button onClick={handleConnectHono}>Connect Hono</button>
      </div>
    </>
  );
}
