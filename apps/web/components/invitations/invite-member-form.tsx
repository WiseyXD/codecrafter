"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

interface InviteMemberFormProps {
  organizationId: string;
}

export function InviteMemberForm({ organizationId }: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          organizationId,
          role,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      setSuccess("Invitation sent successfully!");
      setEmail("");
    } catch (error: any) {
      setError(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />

        <Select value={role} onValueChange={setRole} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MEMBER">Member</SelectItem>
            <SelectItem value="VIEWER">Viewer</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Sending..." : "Send Invitation"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
