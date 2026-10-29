"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/apiClient";
import { formatMoney } from "@/lib/format";
import { useSelectBid } from "../queries";

type SelectBidButtonProps = {
  jobId: string;
  bidId: string;
  /** Integer BDT of the bid. It becomes the agreed price. */
  price: number;
  technicianName: string;
};

/**
 * "এই কারিগরকে নিন": asks for confirmation, selects the bid, then opens the
 * contract page. Selecting is a dangerous action, so it uses ConfirmDialog.
 */
export function SelectBidButton({
  jobId,
  bidId,
  price,
  technicianName,
}: SelectBidButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selectBid = useSelectBid(jobId);

  return (
    <>
      <Button
        type="button"
        variant="accent"
        size="xl"
        onClick={() => {
          selectBid.reset();
          setOpen(true);
        }}
        className="w-full sm:w-auto"
      >
        এই কারিগরকে নিন
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`${technicianName}-কে নির্বাচন করবেন?`}
        description={`এই প্রস্তাব নিলে দাম ${formatMoney(price)} স্থির হবে। এরপর চুক্তিতে স্বাক্ষর করতে হবে।`}
        confirmLabel="নির্বাচন করুন"
        pending={selectBid.isPending}
        onConfirm={() =>
          selectBid.mutate(bidId, {
            onSuccess: () => {
              setOpen(false);
              router.push(`/jobs/${jobId}/contract`);
            },
          })
        }
      >
        {selectBid.isError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {getErrorMessage(selectBid.error, {
              CONFLICT: "এই প্রস্তাবটি আর নির্বাচন করা যাচ্ছে না।",
            })}
          </p>
        ) : null}
      </ConfirmDialog>
    </>
  );
}
