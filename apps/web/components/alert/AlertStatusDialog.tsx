// components/AlertStatusDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { AlertStatus } from "@prisma/client";

interface AlertStatusDialogProps {
  alertId: string;
  currentStatus: AlertStatus;
  onStatusUpdate: (updatedAlert: { status: AlertStatus }) => void;
}

interface UpdateResponse {
  id: string;
  status: AlertStatus;
  [key: string]: any;
}

export default function AlertStatusDialog({
  alertId,
  currentStatus,
  onStatusUpdate,
}: AlertStatusDialogProps) {
  const [status, setStatus] = useState<AlertStatus>(currentStatus);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!status) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/alerts/${alertId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      const data: UpdateResponse = await response.json();
      onStatusUpdate(data);
      setOpen(false);
    } catch (err) {
      console.error("Error updating alert status:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating status",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Update Status</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Alert Status</DialogTitle>
          <DialogDescription>
            Change the status of this alert and add any relevant comments.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-md mb-2 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <div className="col-span-3">
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as AlertStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNRESOLVED">Unresolved</SelectItem>
                  <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right">
              Comment
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any comments about this status change"
              className="col-span-3"
            />
          </div>
        </div>

        {status === "RESOLVED" && (
          <div className="bg-yellow-50 p-3 rounded-md mb-4 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              Resolving this alert will mark it as complete. Make sure all
              necessary actions have been taken before proceeding.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
