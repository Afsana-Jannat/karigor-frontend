"use client";

import { ArrowRight, FileSignature, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCancelJob, useCompleteJob } from "../queries";

type JobActionsProps = {
  jobId: string;
  /** The list from the backend. Buttons come from here, never from the status. */
  allowedActions: string[];
};

// Placeholder for a piece another person is building. It is shown only when
// the backend lists the matching action, so the layout is ready for the merge.
function PendingSlot({ owner, name }: { owner: string; name: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-center text-sm text-slate-500">
      {name} এখানে বসবে ({owner})
    </p>
  );
}

export function JobActions({ jobId, allowedActions }: JobActionsProps) {
  const can = (action: string) => allowedActions.includes(action);

  const cancelJob = useCancelJob(jobId);
  const completeJob = useCompleteJob(jobId);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [reason, setReason] = useState("");

  const hasMainButtons =
    can("view_bids") || can("sign") || can("complete") || can("cancel");

  return (
    <div className="space-y-4">
      {hasMainButtons ? (
        <div className="flex flex-wrap gap-3">
          {can("view_bids") ? (
            <Link
              href={`/jobs/${jobId}/bids`}
              className={buttonVariants({ variant: "accent", size: "xl" })}
            >
              <Users aria-hidden="true" /> প্রস্তাব দেখুন
            </Link>
          ) : null}

          {can("sign") ? (
            <Link
              href={`/jobs/${jobId}/contract`}
              className={buttonVariants({ variant: "accent", size: "xl" })}
            >
              <FileSignature aria-hidden="true" /> চুক্তি দেখুন ও স্বাক্ষর করুন
            </Link>
          ) : null}

          {can("complete") ? (
            <Button
              type="button"
              variant="accent"
              size="xl"
              onClick={() => setCompleteOpen(true)}
            >
              কাজ শেষ হয়েছে <ArrowRight aria-hidden="true" />
            </Button>
          ) : null}

          {can("cancel") ? (
            <Button
              type="button"
              variant="outline"
              size="xl"
              onClick={() => setCancelOpen(true)}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              কাজ বাতিল করুন
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Pieces owned by other people (section 10.5 and 10.3 of the guide). */}
      {can("place_bid") || can("update_bid") ? (
        <PendingSlot owner="Samir" name="PlaceBidForm" />
      ) : null}
      {can("withdraw_bid") ? (
        <PendingSlot owner="Samir" name="WithdrawBidButton" />
      ) : null}
      {can("pay_bkash") || can("mark_cash_received") || can("confirm") ? (
        <PendingSlot owner="Afsana" name="PayPanel" />
      ) : null}
      {can("review") ? <PendingSlot owner="Mohebul" name="ReviewForm" /> : null}
      {can("report") ? (
        <PendingSlot owner="Mohebul" name="ReportDialog" />
      ) : null}

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="কাজটি বাতিল করবেন?"
        description="বাতিল করলে এই কাজ আর চালু করা যাবে না।"
        confirmLabel="কাজ বাতিল করুন"
        destructive
        pending={cancelJob.isPending}
        onConfirm={() =>
          cancelJob.mutate(reason.trim() || undefined, {
            onSuccess: () => {
              setCancelOpen(false);
              setReason("");
            },
          })
        }
      >
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            কারণ (ঐচ্ছিক)
          </span>
          <textarea
            rows={3}
            maxLength={200}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-950/5"
          />
        </label>
      </ConfirmDialog>

      <ConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="কাজ কি সত্যিই শেষ হয়েছে?"
        description="নিশ্চিত করলে গ্রাহককে কাজ নিশ্চিত করার জন্য জানানো হবে।"
        confirmLabel="হ্যাঁ, কাজ শেষ"
        pending={completeJob.isPending}
        onConfirm={() =>
          completeJob.mutate(undefined, {
            onSuccess: () => setCompleteOpen(false),
          })
        }
      />
    </div>
  );
}
